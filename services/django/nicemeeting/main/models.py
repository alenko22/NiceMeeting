# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AstralSign(models.Model):
    sign_id = models.AutoField(primary_key=True)
    sign_name = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."astral_sign'


class Client(models.Model):
    client_id = models.AutoField(primary_key=True)
    fio = models.CharField()
    date_birth = models.DateField()
    adress = models.CharField()
    sex = models.BooleanField()
    height = models.SmallIntegerField()
    weight = models.SmallIntegerField()
    hair_color = models.CharField()
    eye_color = models.CharField()
    astral_sign = models.ForeignKey('AstralSign', models.DO_NOTHING, db_column='astral_sign')
    social_status = models.ForeignKey('SocialStatus', models.DO_NOTHING, db_column='social_status')
    educational_level = models.SmallIntegerField()
    children_quantity = models.SmallIntegerField()
    bad_habits = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."client'


class MeetingClient(models.Model):
    id = models.AutoField(primary_key=True)
    id_meeting_type = models.ForeignKey('MeetingType', models.DO_NOTHING, db_column='id_meeting_type')
    id_client = models.ForeignKey('Client', models.DO_NOTHING, db_column='id_client')
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


class Message(models.Model):
    pk = models.CompositePrimaryKey('sender_id', 'recipient_id')
    sender = models.ForeignKey('Client', models.DO_NOTHING)
    recipient = models.ForeignKey('Client', models.DO_NOTHING, related_name='message_recipient_set')
    date_time = models.DateTimeField()
    text = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."message'


class SocialStatus(models.Model):
    status_id = models.AutoField(primary_key=True)
    status_name = models.CharField()

    class Meta:
        managed = True
        db_table = 'main"."social_status'
