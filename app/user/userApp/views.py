from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status
from django.contrib.auth import authenticate,logout,login
from django.contrib.auth.views import LogoutView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import redirect
from django.urls import reverse
from django.db import transaction, DatabaseError
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
import uuid
from django.views import View
from django.contrib import messages
from rest_framework.views import APIView
from .models import User, UserProfile, UserRegistrationInfo, SkqLookup,CountryMaster,UserActivation
from .serializers import SkqLookupSerializer
from utils.utils import success_response, error_response, validation_error_response,exceptionAPI
from django.utils.crypto import get_random_string
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationInfoSerializer, SkqLookupSerializer,CountryMasterSerializer
from utils.email_utils import send_custom_email



class CountryLookupAPIView(APIView):
    """
    Retrieve country details based on search parameters.
    """

    @exceptionAPI()
    def get(self, request):
        search = request.query_params.get('search', None)
        if search:
            countries = CountryMaster.objects.filter(country_name__icontains=search)
        else:
            countries = CountryMaster.objects.all()

        serializer = CountryMasterSerializer(countries, many=True)
        return success_response("data retrieved successfully", serializer.data)

    @exceptionAPI()
    def post(self, request):
        search = request.data.get('search', None)
        if search:
            countries = CountryMaster.objects.filter(country_name__icontains=search)
        else:
            countries = CountryMaster.objects.all()

        serializer = CountryMasterSerializer(countries, many=True)
        return success_response("data retrieved successfully", serializer.data)

# Define the lookup_code parameter for Swagger documentation
lookup_code_param = openapi.Parameter(
    'lookup_code', openapi.IN_QUERY, description="Code to filter lookup records", type=openapi.TYPE_STRING, required=True
)

class SkqLookupAPIView(APIView):
    """
    API to retrieve lookup data based on a provided lookup_code.
    Supports both GET and POST requests.
    """

    def retrieve_lookup(self, lookup_code):
        if lookup_code:
            lookups = SkqLookup.objects.filter(lookup_code=lookup_code)
            serializer = SkqLookupSerializer(lookups, many=True)
            return success_response("Lookup data retrieved successfully", serializer.data)
        return error_response("The 'lookup_code' parameter is required")

    @swagger_auto_schema(
        manual_parameters=[lookup_code_param],
        responses={200: SkqLookupSerializer(many=True)}
    )
    @exceptionAPI()
    def get(self, request):
        """
        GET method to retrieve lookup data by lookup_code as a query parameter.
        """
        lookup_code = request.query_params.get('lookup_code')
        return self.retrieve_lookup(lookup_code)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'lookup_code': openapi.Schema(type=openapi.TYPE_STRING, description="Code to filter lookup records")
            },
            required=['lookup_code']
        ),
        responses={200: SkqLookupSerializer(many=True)}
    )
    @exceptionAPI()
    def post(self, request):
        """
        POST method to retrieve lookup data by providing lookup_code in the request body.
        """
        lookup_code = request.data.get('lookup_code')
        return self.retrieve_lookup(lookup_code)


class UserRegistrationAPIView(APIView):
    @exceptionAPI()
    @transaction.atomic
    def post(self, request):
        """Registers a new user with profile and registration info."""
        data = request.data.copy()
        data['username'] = data.get('username', data.get('email'))
        password = data.get('password', None)
        data['user_type'] = data.get('user_type', "Individual")
        try:
            with transaction.atomic():
                # Validate and save the main User model
                user_serializer = UserSerializer(data=data)
                if user_serializer.is_valid():
                    # Use validated_data to create a user instance and set password manually
                    user_data = user_serializer.validated_data
                    user = User(
                        username=user_data['username'],
                        email=user_data['email'],
                        is_active=True  # New users start inactive
                    )
                    user.set_password(password)  # Set password
                    user.save()

                    # Create User Profile, ensure user instance is set
                    profile_data = {
                        'full_name': f"{data.get('first_name')} {data.get('last_name')}",
                        'occupation': data.get('occupation'),
                        'industry': data.get('industry'),
                        'country': data.get('country'),
                        'contact_no': data.get('contact_no'),
                        'alternate_contact_no': data.get('alternate_contact_no'),
                        'user_type': data.get('user_type'),
                        'user_category': data.get('user_category'),
                    }
                    profile_serializer = UserProfileSerializer(data=profile_data)
                    if profile_serializer.is_valid():
                        profile_serializer.save(user=user)  # Pass user to save method

                    # Create User Registration Info with user instance
                    registration_info_data = {
                        'preferred_data_types': ",".join(data.getlist('preferred_data_types')),
                        'purchase_frequency': data.get('purchase_frequency'),
                        'budget_range_min': data.get('budget_range_min'),
                        'budget_range_max': data.get('budget_range_max'),
                        'preferred_data_formats': ",".join(data.getlist('preferred_data_formats')),
                        'update_frequency': data.get('update_frequency'),
                        'notification_preferences': ",".join(data.getlist('notification_preferences')),
                    }
                    registration_info_serializer = UserRegistrationInfoSerializer(data=registration_info_data)
                    if registration_info_serializer.is_valid():
                        registration_info_serializer.save(user=user)  # Pass user to save method

                    # Generate and send activation code
                    activation_code = str(uuid.uuid4())
                    UserActivation.objects.create(user=user, activation_code=activation_code)
                    send_custom_email("Account Activation", f"Your activation code is: {activation_code}", [user.email])

                    return success_response(
                        "User registered successfully. Please check your email for the activation code.",
                        user_serializer.data,
                        status.HTTP_201_CREATED
                    )

                # If validation fails, return error without additional DB queries
                return error_response(user_serializer.errors, status.HTTP_400_BAD_REQUEST)

        except DatabaseError as db_err:
            transaction.set_rollback(True)  # Ensure the transaction rolls back
            return error_response("Database error occurred: " + str(db_err), status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            transaction.set_rollback(True)  # Ensure the transaction rolls back
            return error_response("An unexpected error occurred: " + str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)



class UpdateUserAPIView(APIView):
    @exceptionAPI()
    @transaction.atomic
    def put(self, request):
        """Updates user profile and registration info."""
        data = request.data.copy()
        user = request.user

        # Use a savepoint for rollback if any operation fails
        savepoint = transaction.savepoint()

        try:
            # Update User basic info
            user_serializer = UserSerializer(user, data=data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()

            # Update User Profile
            profile_data = {
                'full_name': f"{data.get('first_name')} {data.get('last_name')}",
                'occupation': data.get('occupation'),
                'industry': data.get('industry'),
                'country': data.get('country'),
                'contact_no': data.get('contact_no'),
                'alternate_contact_no': data.get('alternate_contact_no'),
                'user_type': data.get('user_type'),
                'user_category': data.get('user_category'),
            }
            profile_serializer = UserProfileSerializer(user.profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()

            # Update User Registration Info
            registration_info_data = {
                'preferred_data_types': ",".join(data.getlist('preferred_data_types')),
                'purchase_frequency': data.get('purchase_frequency'),
                'budget_range_min': data.get('budget_range_min'),
                'budget_range_max': data.get('budget_range_max'),
                'preferred_data_formats': ",".join(data.getlist('preferred_data_formats')),
                'update_frequency': data.get('update_frequency'),
                'notification_preferences': ",".join(data.getlist('notification_preferences')),
            }
            registration_info_serializer = UserRegistrationInfoSerializer(
                user.registration_info, data=registration_info_data, partial=True
            )
            if registration_info_serializer.is_valid():
                registration_info_serializer.save()

            # Commit transaction if everything is successful
            transaction.savepoint_commit(savepoint)
            return success_response("User updated successfully.", user_serializer.data)

        except Exception as e:
            # Rollback transaction on any error and return a structured error response
            transaction.savepoint_rollback(savepoint)
            return error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomLogoutView(View):
    def get(self, request, *args, **kwargs):
        """Log out the user and redirect to the login page on a GET request."""
        logout(request)
        messages.info(request, "You have been logged out successfully.")
        return redirect('home_index')  # Redirect to the login page or any other desired page

    def post(self, request, *args, **kwargs):
        """Log out the user and redirect to the login page on a POST request."""
        return self.get(request, *args, **kwargs)

class UserLoginAPIView(APIView):
    @exceptionAPI()
    def post(self, request):
        """Logs in a user by validating email and password, and checks activation status."""
        email = request.data.get("email")
        password = request.data.get("password")

        # First, check if the user exists
        try:
            user = User.objects.get(email=email)

            # Check if the account is activated
            if not user.is_active:
                return error_response("Account is not activated. Please check your email for activation instructions.",
                                      status.HTTP_403_FORBIDDEN)

            # If user is active, attempt to authenticate
            user = authenticate(username=email, password=password)
            if user:
                # Determine if request is from same domain
                # Extract host and port from HTTP_ORIGIN, excluding the protocol
                origin = request.META.get('HTTP_ORIGIN', '')
                origin_host = origin.split('//')[-1] if origin else ''

                # Compare only the host and port (ignoring protocol)
                same_domain = request.get_host() == origin_host

                # Handle session-based login for same domain
                if same_domain:
                    login(request, user)
                    return success_response("Session-based login successful", UserSerializer(user).data)

                # Handle token-based login for cross-origin requests
                else:
                    refresh = RefreshToken.for_user(user)
                    return success_response("Token-based login successful", {
                        'access_token': str(refresh.access_token),
                        'refresh_token': str(refresh),
                    })

            else:
                return error_response("Invalid email or password", status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            return error_response("Invalid email or password", status.HTTP_401_UNAUTHORIZED)

class UserListAPIView(APIView):

    def get(self, request):
        """Lists all users. Admin-only access."""
        if not request.user.is_staff:
            return error_response("Access denied", status.HTTP_403_FORBIDDEN)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return success_response("User list retrieved successfully", serializer.data)


class UserForgotPasswordAPIView(APIView):
    @exceptionAPI()
    def post(self, request):
        """Handles password reset requests."""
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            reset_token = get_random_string(20)  # Generate a simple token for password reset
            user.set_password(reset_token)
            user.save()

            # Use the custom email utility
            subject = "Password Reset Request"
            message = f"Your new password is: {reset_token}"
            email_result = send_custom_email(subject, message, [email])

            if email_result.data.get("success"):
                return success_response("Password reset email sent")
            else:
                return email_result  # Returns the error response from email utility

        except User.DoesNotExist:
            return error_response("User with this email does not exist")


class UserActivationAPIView(APIView):
    @exceptionAPI()
    def post(self, request):
        """Activates user by email and activation code."""
        email = request.data.get("email")
        activation_code = request.data.get("activation_code")

        try:
            user = User.objects.get(email=email)
            user_activation = UserActivation.objects.get(user=user)

            # Check if the code matches and is not expired
            if user_activation.activation_code == activation_code:
                if user_activation.is_expired():
                    return error_response("Activation code has expired. Please request a new one.")

                user.is_active = True
                user.save()
                user_activation.delete()  # Remove the activation record upon successful activation
                return success_response("User activated successfully")
            else:
                return error_response("Invalid activation code")

        except User.DoesNotExist:
            return error_response("User with this email does not exist")
        except UserActivation.DoesNotExist:
            return error_response("No activation record found. Please register or request a new activation code.")


class ResendActivationCodeAPIView(APIView):
    @exceptionAPI()
    def post(self, request):
        """Resends the activation code if it is expired or lost."""
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
            user_activation, created = UserActivation.objects.get_or_create(user=user)

            # If the code is expired or newly created, regenerate it
            if user_activation.is_expired() or created:
                user_activation.activation_code = str(uuid.uuid4())
                user_activation.expires_at = timezone.now() + timedelta(days=1)
                user_activation.save()

                # Resend activation code email
                subject = "Account Activation - Resend"
                message = f"Your new activation code is: {user_activation.activation_code}"
                send_custom_email(subject, message, [email])

                return success_response("Activation code resent. Please check your email.")
            else:
                return error_response("Activation code is still valid. Please check your email.")

        except User.DoesNotExist:
            return error_response("User with this email does not exist")