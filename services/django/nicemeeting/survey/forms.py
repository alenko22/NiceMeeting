from django import forms

class SurveyUserPostForm(forms.Form):
    name = forms.CharField(label = "Ваше имя", widget = forms.TextInput(attrs = {
        'placeholder': 'Введите ваше имя'
    }))
    age = forms.IntegerField(min_value=18, max_value=100, label="Возраст", widget=forms.NumberInput(attrs={
        'placeholder': 'Введите ваш возраст'
    }))
