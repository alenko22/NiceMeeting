from django import forms
from .models import *

class SurveyUserPostForm(forms.Form):
    name = forms.CharField(label = "Ваше имя", widget = forms.TextInput(attrs = {
        'placeholder': 'Введите ваше имя',
        'maxlength': '100',
    }))
    age = forms.IntegerField(min_value=18, max_value=100, label="Возраст", widget=forms.NumberInput(attrs={
        'placeholder': 'Введите ваш возраст'
    }))
    hobby = forms.CharField(label= "Хобби", widget = forms.TextInput(attrs = {
        'placeholder': 'Напишите то, чем вы любите заниматься, через запятую'
    }))
