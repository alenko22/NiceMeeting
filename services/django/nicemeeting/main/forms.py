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

class MainChangeProfilePostForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "patronymic", "date_birth", "sex", "educational_level", "bad_habits", "astral_sign", "children_quantity"]
        labels = {
            "first_name" : "Ваше имя",
            "last_name" : "Ваша фамилия",
            "patronymic" : "Ваше отчество (при наличии)",
            "date_birth" : "Ваша дата рождения",
            "sex" : "Ваш пол",
            "educational_level" : "Ваш уровень образования",
            "bad_habits" : "Ваши вредные привычки",
            "astral_sign" : "Ваш знак зодиака",
            "children_quantity" : "Сколько у вас детей"
        }
        widgets = {
            "first_name": forms.TextInput(attrs={
                "placeholder": "Здесь ваше имя",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "last_name": forms.TextInput(attrs={
                "placeholder": "Здесь ваша фамилия",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "patronymic": forms.TextInput(attrs={
                "placeholder": "Здесь ваше отчество",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "date_birth": forms.DateInput(attrs={
                "placeholder": "Здесь ваша дата рождения",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "sex": forms.TextInput(attrs={
                "placeholder": "Здесь ваш пол",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "educational_level": forms.TextInput(attrs={
                "placeholder": "Здесь ваш уровень образования",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "bad_habits": forms.TextInput(attrs={
                "placeholder": "Здесь ваши вредные привычки",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "astral_sign": forms.TextInput(attrs={
                "placeholder": "Здесь ваш знак зодиака",
                "maxlength": "50",
                "class": "form-field__input",
            }),
            "children_quantity": forms.NumberInput(attrs={
                "placeholder": "Здесь ваше количество детей",
                "class": "form-field__input",
            }),
        }