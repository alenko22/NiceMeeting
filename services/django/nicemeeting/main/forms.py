from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm, PasswordResetForm

from .models import *
from django.contrib.auth import get_user_model

User = get_user_model()

class MainRegisterPostForm(UserCreationForm):
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput(attrs={
        "placeholder": "Введите здесь ваш пароль",
        "maxlength": "30",
        "class": "form-field__input",
    }))
    password2 = forms.CharField(label='Подтверждение пароля', widget=forms.PasswordInput(attrs={
        "placeholder": "Введите здесь ваш пароль",
        "maxlength": "30",
        "class": "form-field__input",
    }))



    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
        labels = {
            "username": "Имя пользователя",
            "email": "E-mail",
            "password": "Пароль",
        }
        widgets = {
            "username": forms.TextInput(attrs={
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
        }

class MainLoginPostForm(AuthenticationForm):
    username = forms.CharField(label="Имя пользователя", widget=forms.TextInput(attrs={
        'placeholder': 'Здесь Ваш логин',
        'maxlength': '50',
        'class': 'form-field__input',
    }))
    password = forms.CharField(label='Пароль', widget=forms.PasswordInput(attrs={
        'placeholder': 'Здесь Ваш пароль',
        'maxlength': '30',
        'class': 'form-field__input',
    }))

    class Meta:
        model = User
        fields = ["username", "password"]


class MainChangePasswordPostForm(PasswordResetForm):

    class Meta:
        model = User
        fields = ["email", "old_password"]

    email = forms.CharField(label="E-mail", widget=forms.TextInput(attrs={
        'placeholder': 'Здесь Ваш E-mail',
        'maxlength': '50',
        'class': 'form-field__input',
    }))

class MainChangePasswordConfirmPostForm(PasswordChangeForm):
    class Meta:
        model = User
        fields = ["new_password1", "new_password2"]

    old_password = None
    new_password1 = forms.CharField(label="Пароль", widget=forms.PasswordInput(attrs={
        'placeholder': 'Введите здесь новый пароль',
        'maxlength': '50',
        'class': 'form-field__input',
    }))
    new_password2 = forms.CharField(label="Подтверждение пароля", widget=forms.PasswordInput(attrs={
        'placeholder': 'Введите здесь новый пароль еще раз',
        'maxlength': '50',
        'class': 'form-field__input',
    }))