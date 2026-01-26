# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

class User(models.Model):
    data = models.JSONField()

    class Meta:
        managed = True
        db_table = 'survey"."user'

class Questionnare(models.Model):
    data = models.JSONField()

    class Meta:
        managed = True
        db_table = 'survey"."questionnare'


class Rating(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.SmallIntegerField()
    id_user = models.ForeignKey('User', models.DO_NOTHING, db_column='id_user')
    id_questionnare = models.ForeignKey('Questionnare', models.DO_NOTHING, db_column='id_questionnare')

    class Meta:
        managed = True
        db_table = 'survey"."rating'


