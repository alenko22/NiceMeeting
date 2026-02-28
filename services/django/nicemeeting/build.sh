#!/usr/bin/env bash

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput

python manage.py migrate zero

python manage.py migrate

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