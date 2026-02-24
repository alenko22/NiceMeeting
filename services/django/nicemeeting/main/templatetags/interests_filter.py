from django import template

register = template.Library()

@register.filter
def split_interests(value):
    if not value:
        return []
    if isinstance(value, str):
        return value.split()
    return []