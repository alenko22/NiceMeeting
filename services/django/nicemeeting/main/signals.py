from django.db.models.signals import post_save
from django.dispatch import receiver

from main.models import UserSettings
from nicemeeting import settings

user = settings.AUTH_USER_MODEL

@receiver(post_save, sender=user)
def create_settings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.get_or_create(user=instance)

@receiver(post_save, sender=user)
def save_settings(sender, instance, **kwargs):
    instance.settings.save()