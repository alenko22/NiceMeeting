# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
import os

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from datetime import datetime


class AstralSign(models.Model):
    sign_id = models.AutoField(primary_key=True)
    sign_name = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."astral_sign'

class User(AbstractUser):
    patronymic = models.CharField(max_length=120, null=True)
    date_birth = models.DateField(null=True)
    address = models.CharField(max_length=120, null=True)
    sex = models.CharField(max_length=120, null=True)
    astral_sign = models.ForeignKey(AstralSign, models.DO_NOTHING, db_column='astral_sign', null=True)
    social_status = models.ForeignKey('SocialStatus', models.DO_NOTHING, db_column='social_status', null=True)
    educational_level = models.SmallIntegerField(null=True)
    children_quantity = models.SmallIntegerField(null=True)
    bad_habits = models.CharField(null=True)


class MeetingClient(models.Model):
    id = models.AutoField(primary_key=True)
    id_meeting_type = models.ForeignKey('MeetingType', models.DO_NOTHING, db_column='id_meeting_type')
    id_client = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='id_client')
    address = models.CharField()
    datetime = models.DateTimeField()

    class Meta:
        managed = True
        db_table = 'main"."meeting_client'


class MeetingType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."meeting_type'

class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='user1', related_name='chat_user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='user2', related_name='chat_user2')

    class Meta:
        managed = True
        db_table = 'main"."chat'
        unique_together = ('user1', 'user2')

    def get_other_user(self, current_user):
        return self.user2 if current_user == self.user1 else self.user1

    def get_last_message(self):
        return self.messages.order_by('-datetime').first()

class Message(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='id')
    chat = models.ForeignKey(Chat, models.DO_NOTHING, db_column='chat', related_name='messages', default=" ")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='sender', related_name='sent_messages')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='recipient', related_name='received_messages')
    datetime = models.DateTimeField(default=timezone.now)
    text = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        managed = True
        db_table = 'main"."message'
        ordering = ['datetime']


class SocialStatus(models.Model):
    status_id = models.AutoField(primary_key=True)
    status_name = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."social_status'

class Article(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=120, null=True)
    description = models.TextField()
    image = models.ImageField(
        upload_to='public/articles_img/%Y/%m/%d',
    )
    class Meta:
        managed = True

class EventUser(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='user_id')
    event_id = models.ForeignKey('Event', models.DO_NOTHING, db_column='event_id')

class Event(models.Model):
    id = models.AutoField(primary_key=True)
    external_id = models.IntegerField()
    date_begin = models.DateTimeField()
    date_end = models.DateTimeField()
    date_deadline = models.DateTimeField()
    title = models.CharField(null=True)
    place = models.CharField(null=True)
    info = models.CharField(null=True)

class Rating (models.Model):
    id = models.AutoField(primary_key=True)
    rater = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='rater', related_name='rater')
    rated_user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='rated_user', related_name='rated_user')
    rating = models.IntegerField()
    comment = models.CharField(null=True)

    class Meta:
        managed = True
        db_table = 'main"."rating'

def post_image_path(instance, filename):
    ext = filename.split('.')[-1]

    unique_id = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}.{ext}"
    year = timezone.now().strftime('%Y')
    month = timezone.now().strftime('%m')
    return os.path.join('posts', year, month, unique_id)


class Post(models.Model):
    id = models.AutoField(primary_key=True)
    image = models.ImageField(upload_to=post_image_path, blank=True, null=True)
    text = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='author')
    date_posted = models.DateTimeField(default=timezone.now)

    class Meta:
        managed = True
        db_table = 'main"."post'

    def delete(self, *args, **kwargs):
        if self.image:
            if os.path.exists(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)

class Commentaries(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey('Post', models.DO_NOTHING, db_column='post', related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='author', related_name='commentaries')
    text = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    parent_comment = models.ForeignKey('self', models.DO_NOTHING, null=True, blank=True, db_column='parent_comment', related_name='replies')

    class Meta:
        managed = True
        db_table = 'main"."commentaries'

    @property
    def is_reply(self):
        return self.parent is not None

class Meeting (models.Model):
    id = models.AutoField(primary_key=True)
    user1 = models.ManyToManyField(settings.AUTH_USER_MODEL, db_column='user1', related_name='user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='user2', related_name='user2')
    event = models.ForeignKey('Event', models.DO_NOTHING, db_column='event', related_name='event', null=True)
    datetime = models.DateTimeField(default=timezone.now)
    place = models.CharField(null=True)

    class Meta:
        managed = True
        db_table = 'main"."meeting'