from django import template
import base64

register = template.Library()

@register.filter
def b64image(data, fmt):
    if not data:
        return ''
    b64 = base64.b64encode(data).decode('utf-8')
    return f"data:image/{fmt};base64,{b64}"