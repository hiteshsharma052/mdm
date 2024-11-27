from django.urls import include, re_path
from app.auth.authApp import views

urlpatterns = [
    re_path(r'^login/$', views.login_index, name="login_index"),
]

