from django import forms
from .models import *

class MainRegisterPostForm(forms.Form):
    userName = forms.CharField(label = "Ваше имя пользователя", widget = forms.TextInput(attrs = {
        'placeholder': 'Введите ваше имя, которое будет отображаться',
        'maxlength': '30',
    }))
    Email = forms.CharField(label="Ваша электронная почта", widget=forms.TextInput(attrs={
        'placeholder': 'Введите вашу электронную почту',
        'maxlength': '50',
    }))
    Password = forms.CharField(label="Ваш пароль", widget=forms.TextInput(attrs={
        'placeholder': 'Введите здесь ваш пароль',
        'maxlength': '30',
    }))

class MainLoginForm(forms.Form):
    userNameEmail = forms.CharField(label = "Имя пользователя или e-mail", widget = forms.TextInput(attrs = {
        'placeholder' : 'Здесь Ваш логин или e-mail',
        'maxlength': '50',
    }))
    Password = forms.CharField(label = 'Пароль', widget = forms.TextInput(attrs = {
        'placeholder' : 'Здесь Ваш пароль',
        'maxlength': '30',
    }))
