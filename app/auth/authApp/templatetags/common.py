from django import template
import json
import time
import requests,json
register = template.Library()
from django.http import HttpResponse
from django.template.defaulttags import register


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

@register.simple_tag(takes_context=True)
def scikiqVersion(context):
    return time.time()


class SetVarNode(template.Node):

    def __init__(self, var_name, var_value):
        self.var_name = var_name
        self.var_value = var_value

    def render(self, context):
        try:
            value = template.Variable(self.var_value).resolve(context)
        except template.VariableDoesNotExist:
            value = ""
        context[self.var_name] = value

        return u""

@register.tag(name='set')
def set_var(parser, token):
    """
    {% set some_var = '123' %}
    """
    parts = token.split_contents()
    if len(parts) < 4:
        raise template.TemplateSyntaxError("'set' tag must be of the form: {% set <var_name> = <var_value> %}")

    return SetVarNode(parts[1], parts[3])       

@register.filter()
def to_int(value):
    if value:
        value = int(value.strip())
    return value

@register.filter()
def show_formatted_datetime(value):
    if value:
        from dateutil.parser import parse

        value = parse(value).strftime('%d/%m/%Y %H:%M:%S')        
        print(value)
    return value    

@register.simple_tag
def string_to_json(data):
    try:
        return eval(data)
    except Exception :
        return []

@register.simple_tag(takes_context=True)
def get_page_name(context):
    url_name = context.request.resolver_match.url_name
    if url_name in ['data-prep','etl_edit']:
        return 'data-prep'
    else:
        return url_name
