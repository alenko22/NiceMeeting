#!/usr/bin/env bash

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput

python manage.py migrate

python manage.py shell <<EOF
from django.db import connection
from django.apps import apps
from django.contrib.auth import get_user_model

User = get_user_model()
app_models = apps.get_app_config('main').get_models()

print("Синхронизация таблиц приложения main...")

for model in app_models:
    table_name = model._meta.db_table
    print(f"Проверка таблицы {table_name}...")

    # Проверяем, существует ли таблица
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = %s
            );
        """, [table_name])
        table_exists = cursor.fetchone()[0]

    if not table_exists:
        # Создаём таблицу через Django (это выполнит CREATE TABLE)
        print(f"Таблица {table_name} не существует. Создаём...")
        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(model)
        print(f"Таблица {table_name} создана.")
        continue  # Для новой таблицы колонки проверять не нужно

    # Если таблица существует, проверяем наличие всех колонок модели
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s;
        """, [table_name])
        existing_columns = {row[0] for row in cursor.fetchall()}

    # Получаем поля модели (исключая отношения)
    model_fields = {}
    for field in model._meta.get_fields():
        if field.is_relation and not (field.many_to_one or field.one_to_many):
            continue
        if field.primary_key and field.name == 'id':
            continue
        if hasattr(field, 'column') and field.column:
            model_fields[field.column] = field

    missing_columns = set(model_fields.keys()) - existing_columns
    if missing_columns:
        print(f"Отсутствующие колонки в {table_name}: {missing_columns}")
        for col_name in missing_columns:
            field = model_fields[col_name]
            # Определяем SQL-тип (упрощённо)
            if field.get_internal_type() == 'CharField':
                max_length = field.max_length or 255
                sql_type = f"varchar({max_length})"
            elif field.get_internal_type() in ('IntegerField', 'SmallIntegerField', 'BigIntegerField'):
                sql_type = "integer"
            elif field.get_internal_type() == 'BooleanField':
                sql_type = "boolean"
            elif field.get_internal_type() == 'DateField':
                sql_type = "date"
            elif field.get_internal_type() == 'DateTimeField':
                sql_type = "timestamptz"
            elif field.get_internal_type() == 'TextField':
                sql_type = "text"
            else:
                sql_type = "text"

            with connection.cursor() as cursor:
                cursor.execute(f'ALTER TABLE {table_name} ADD COLUMN "{col_name}" {sql_type} NULL;')
            print(f"Добавлена колонка: {col_name}")
    else:
        print(f"Все колонки в {table_name} в порядке.")

print("Синхронизация завершена.")
EOF

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.getenv('DJANGO_SUPERUSER_USERNAME')
email = os.getenv('DJANGO_SUPERUSER_EMAIL')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

if username and password and email:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        print('Суперпользователь создан.')
    else:
        print('Суперпользователь уже существует.')
else:
    print('Переменные для суперпользователя не заданы — пропускаем создание.')
EOF