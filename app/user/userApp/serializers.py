# serializers.py
from rest_framework import serializers
from .models import User, UserProfile, UserRegistrationInfo, SkqLookup,CountryMaster

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'is_active', 'is_staff', 'date_joined']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user']

class UserRegistrationInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegistrationInfo
        fields = '__all__'
        read_only_fields = ['user']

class SkqLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkqLookup
        fields = '__all__'


class CountryMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountryMaster
        fields = [
            'country_id', 'country_name'
        ]