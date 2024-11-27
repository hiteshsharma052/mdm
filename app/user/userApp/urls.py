from django.urls import path
from django.contrib.auth import views as auth_views

from .views import (
    UserRegistrationAPIView, UserLoginAPIView, UserListAPIView,
    UserForgotPasswordAPIView, UserActivationAPIView,ResendActivationCodeAPIView,
      SkqLookupAPIView,CountryLookupAPIView,CustomLogoutView
)
urlpatterns = [
    path('api/skq/lookup/', SkqLookupAPIView.as_view(), name='skq_lookup_api'),
    path('api/country/lookup/', CountryLookupAPIView.as_view(), name='country_lookup_api'),
    path('api/user/register/', UserRegistrationAPIView.as_view(), name='user_register'),
    path('api/user/login/', UserLoginAPIView.as_view(), name='user_login'),
    path('api/user/list/', UserListAPIView.as_view(), name='user_list'),
    path('api/user/forgot-password/', UserForgotPasswordAPIView.as_view(), name='user_forgot_password'),
    path('api/user/resend-activation/', ResendActivationCodeAPIView.as_view(), name='resend_activation_code'),
    path('api/user/activate/', UserActivationAPIView.as_view(), name='user_activation'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),

]
