
from django.shortcuts import render
templatePath = 'web-templates/errors/'

def server_error(request):
    return render(request, templatePath+'500.html')
 
def not_found(request):
    return render(request, templatePath+'404.html')
 
def permission_denied(request):
    return render(request, templatePath+'403.html')
 
def bad_request(request):
    return render(request, templatePath+'400.html')