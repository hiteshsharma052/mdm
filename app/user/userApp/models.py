from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta
import uuid



class CountryMaster(models.Model):
    country_id = models.AutoField(primary_key=True)
    country_name = models.CharField(max_length=100)
    iso3 = models.CharField(max_length=3, null=True, blank=True)
    numeric_code = models.CharField(max_length=3, null=True, blank=True)
    iso2 = models.CharField(max_length=2, null=True, blank=True)
    phonecode = models.CharField(max_length=255, null=True, blank=True)
    capital = models.CharField(max_length=255, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    currency_name = models.CharField(max_length=255, null=True, blank=True)
    currency_symbol = models.CharField(max_length=255, null=True, blank=True)
    tld = models.CharField(max_length=255, null=True, blank=True)
    native = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    subregion = models.CharField(max_length=255, null=True, blank=True)
    timezones = models.TextField(null=True, blank=True)
    translations = models.TextField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    emoji = models.CharField(max_length=191, null=True, blank=True)
    emojiU = models.CharField(max_length=191, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    flag = models.BooleanField(default=True)


    class Meta:
        db_table = 'countrymaster'
        verbose_name_plural = "Country Masters"

    def __str__(self):
        return self.country_name


class SkqLookup(models.Model):
    lookup_code = models.CharField(max_length=45)
    lookup_type = models.CharField(max_length=45, null=True, blank=True)
    sequence = models.IntegerField(null=True, blank=True)
    desc = models.CharField(max_length=500, null=True, blank=True)
    key = models.CharField(max_length=45)
    value1 = models.CharField(max_length=45, null=True, blank=True)
    value2 = models.CharField(max_length=500, null=True, blank=True)
    value3 = models.CharField(max_length=45, null=True, blank=True)
    value4 = models.CharField(max_length=45, null=True, blank=True)
    value5 = models.CharField(max_length=45, null=True, blank=True)
    client_id = models.IntegerField(default=-1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_valid = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = 'skq_lookup'
        ordering = ['id']
        managed = False  # Exclude this model from migrations


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return self.email

class UserActivation(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='activation')
    activation_code = models.CharField(max_length=36, unique=True)  # UUID for unique activation codes
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        # Set expiration to 24 hours from creation if not set
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=1)
        super(UserActivation, self).save(*args, **kwargs)

    def is_expired(self):
        """Check if the activation code is expired."""
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Activation for {self.user.email}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    contact_no = models.CharField(max_length=20, blank=True, null=True)
    alternate_contact_no = models.CharField(max_length=20, blank=True, null=True)
    user_type = models.CharField(max_length=50)  # Options: 'seller', 'buyer', 'value_added'
    user_category = models.CharField(max_length=50)  # Options: 'individual', 'company'

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email} Profile'


class UserRegistrationInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='registration_info')
    preferred_data_types = models.TextField(blank=True, null=True)  # JSON or comma-separated list
    purchase_frequency = models.CharField(max_length=50, blank=True, null=True)  # Options from lookup
    budget_range_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    budget_range_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    preferred_data_formats = models.TextField(blank=True, null=True)  # JSON or comma-separated list
    update_frequency = models.CharField(max_length=50, blank=True, null=True)  # Options from lookup
    notification_preferences = models.TextField(blank=True, null=True)  # JSON or comma-separated list
    compliance_standards = models.TextField(blank=True, null=True)  # JSON or comma-separated list

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email} Registration Info'