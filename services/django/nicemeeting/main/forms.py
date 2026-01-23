from django import forms
from .models import *

class MainRegisterPostForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ["user_name", "email", "password"]
        labels = {
            "user_name": "Имя пользователя",
            "email": "E-mail",
            "password": "Пароль",
        }
        widgets = {
            "user_name": forms.TextInput(attrs={
                "label" : "Имя пользователя",
                "placeholder": "Введите ваше имя, которое будет отображаться",
                "maxlength": "30",
                "class": "form-field__input",
            }),
            "email": forms.EmailInput(attrs={
                "label": "E-mail",
                "placeholder" : "Введите вашу электронную почту",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "password": forms.PasswordInput(attrs={
                "label": "Пароль",
                "placeholder": "Введите здесь ваш пароль",
                "maxlength": "30",
                "class": "form-field__input",
            })
        }

class MainLoginPostForm(forms.Form):
    userNameEmail = forms.CharField(label = "Имя пользователя или e-mail", widget = forms.TextInput(attrs = {
        'placeholder' : 'Здесь Ваш логин или e-mail',
        'maxlength': '50',
        'class': 'form-field__input',
    }))
    Password = forms.CharField(label = 'Пароль', widget = forms.TextInput(attrs = {
        'placeholder' : 'Здесь Ваш пароль',
        'maxlength': '30',
        'class': 'form-field__input',
    }))

class MainChangePasswordPostForm(forms.Form):
    CurrentPassword = forms.CharField(label = "Текущий пароль", widget = forms.TextInput(attrs = {
        'placeholder' : 'Введите здесь последний пароль, который помните',
        'maxlength': '50',
        'class': 'form-field__input',
    }))
    NewPassword = forms.CharField(label = 'Пароль', widget = forms.TextInput(attrs = {
        'placeholder' : 'Введите здесь новый пароль',
        'maxlength': '30',
        'class': 'form-field__input',
    }))
