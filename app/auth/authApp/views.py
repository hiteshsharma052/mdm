from django.shortcuts import render, redirect
from django.http import HttpResponse

def login_index(request):
    return render(request, 'app/auth/web/html/login.html')
