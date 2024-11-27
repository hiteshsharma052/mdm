import os
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_env_value(env_variable, optional = False, default_value = ""):
    try:
        return os.environ[env_variable]
    except KeyError:
        if optional :
            return default_value
        else :
            error_msg = 'Set the {} environment variable'.format(env_variable)
            raise ImproperlyConfigured(error_msg)
