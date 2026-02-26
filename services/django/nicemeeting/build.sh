#!/usr/bin/env bash

set -o errexit

cd ..

pip install -r requirements.txt

cd nicemeeting

python manage.py collectstatic --noinput

python manage.py migrate