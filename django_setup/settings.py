"""
Django settings for scikiq project - Production Level.
"""

import os
import importlib
from django_setup.setting_utils import get_env_value
from datetime import timedelta

# Deployment Type
DEPLOYMENT_TYPE = get_env_value('DEPLOYMENT_TYPE', True, 'dev')

# Base Directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Allowed Hosts
ALLOWED_HOSTS = get_env_value('ALLOWED_HOSTS', optional=True, default_value=['*'])
CORS_ORIGIN_ALLOW_ALL = True  # Disable for production unless needed

# Security
SECRET_KEY = get_env_value("SCIKIQ_KEY",optional=True,default_value="No-key")
DEBUG = True  # Disable DEBUG mode in production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'  # Prevents clickjacking
CSRF_COOKIE_SECURE = True  # Ensures CSRF cookies are only sent over HTTPS
SESSION_COOKIE_SECURE = True  # Ensures session cookies are only sent over HTTPS
SECURE_HSTS_SECONDS = 31536000  # 1 year, for HTTP Strict Transport Security
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
LOGOUT_REDIRECT_URL = 'login_index'  # Replace with your desired redirect page name

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'app.home.homeApp',
    'app.user.userApp',
    'app.auth.authApp',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'django_setup.urls'
# Find the path to the drf_yasg package
drf_yasg_spec = importlib.util.find_spec("drf_yasg")
if drf_yasg_spec and drf_yasg_spec.submodule_search_locations:
    drf_yasg_templates_path = os.path.join(drf_yasg_spec.submodule_search_locations[0], "templates")
else:
    drf_yasg_templates_path = None  # Fallback if drf_yasg is not installed

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR,
            drf_yasg_templates_path  # Add the dynamically determined path to drf-yasg templates
        ] if drf_yasg_templates_path else [BASE_DIR],
        'APP_DIRS': False,  # Keep this set to False as required
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_setup.wsgi.application'


DB_ENVIRONMENT = get_env_value("DB_ENVIRONMENT")
# Database Configuration
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": get_env_value("DATABASE_NAME"),
        "USER": get_env_value("DATABASE_USER_NAME"),
        "PASSWORD": get_env_value("DATABASE_PASSWORD"),
        "HOST": get_env_value("DATABASE_HOST"),
        "PORT": get_env_value("DATABASE_PORT"),
        'OPTIONS': {
            "options": f"-c search_path={DB_ENVIRONMENT}"
        }
    }
}

# Cache Settings (optional, for performance)
CACHE_MIDDLEWARE_SECONDS = 60
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': os.path.join(BASE_DIR, 'cache'),  # Ensure this directory exists
    }
}

# Authentication Settings
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
# settings.py
AUTH_USER_MODEL = 'userApp.User'  # Replace 'userApp' with the actual app name where User model is defined

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = get_env_value('TIME_ZONE', optional=True, default_value="Asia/Kolkata")
USE_I18N = True
USE_L10N = True
USE_TZ = True
# Base Static and Media Configuration
STATIC_URL = '/common/'
STATIC_ROOT = '/common/static/'

# Find the path to drf_yasg package
drf_yasg_spec = importlib.util.find_spec("drf_yasg")
if drf_yasg_spec and drf_yasg_spec.submodule_search_locations:
    drf_yasg_static_path = os.path.join(drf_yasg_spec.submodule_search_locations[0], "static")
else:
    drf_yasg_static_path = None  # Handle case where drf_yasg is not installed

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "common"),
    os.path.join(BASE_DIR, "app/home/web"),
    os.path.join(BASE_DIR, "app/auth/web"),
]

# Only add drf-yasg static path if it exists
if drf_yasg_static_path:
    STATICFILES_DIRS.append(drf_yasg_static_path)

# Define the path for logs directory and log file
LOG_DIR = os.path.join(BASE_DIR, 'logs')
LOG_FILE_PATH = os.path.join(LOG_DIR, 'django.log')

# Create logs directory if it doesn't exist
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Create an empty log file if it doesn't exist
if not os.path.isfile(LOG_FILE_PATH):
    with open(LOG_FILE_PATH, 'w') as f:
        pass


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '%(levelname)s %(message)s',
        },
    },
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': LOG_FILE_PATH,
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration (for security)
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Token-based authentication
        'rest_framework.authentication.SessionAuthentication',  # Session-based authentication
    ],
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# Ensure all API views require authentication by default
CORS_ALLOW_CREDENTIALS = True

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/home'
SESSION_SAVE_EVERY_REQUEST = True
SESSION_ENGINE = "django.contrib.sessions.backends.db"
