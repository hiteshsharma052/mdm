from rest_framework import serializers
import app.home.homeApp.models as mdl


class FormFieldSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = mdl.ItemFormField
        exclude = ()

class LookupScreenDictionarySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = mdl.LookupScreenDictionary
        exclude = ()


class ItemMasterSerializer(serializers.ModelSerializer):
    organizations = serializers.JSONField()
    
    class Meta:
        model = mdl.ItemMaster
        fields = '__all__'


class DictionaryDefinitionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = mdl.DictionaryDefinition
        fields = '__all__'
from .models import SavedSearch
# Serializer
class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = ['sck_saved_search_id', 'search_name', 'search_description', 'search_state', 'created_date', 'user_id']


