from tokenize import Comment

from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm, PasswordResetForm
from datetime import date, timedelta
from django.core.validators import RegexValidator

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
    # Валидатор для кириллических букв
    cyrillic_validator = RegexValidator(
        regex=r'^[а-яА-ЯёЁ\s]+$',
        message='Поле должно содержать только кириллические буквы'
    )

    # Поля ФИО с валидацией
    first_name = forms.CharField(
        max_length=255,
        validators=[cyrillic_validator],
        label="Ваше имя",
        widget=forms.TextInput(attrs={
            "placeholder": "Здесь ваше имя",
            "class": "form-field__input",
        })
    )

    last_name = forms.CharField(
        max_length=255,
        validators=[cyrillic_validator],
        label="Ваша фамилия",
        widget=forms.TextInput(attrs={
            "placeholder": "Здесь ваша фамилия",
            "class": "form-field__input",
        })
    )

    patronymic = forms.CharField(
        max_length=255,
        validators=[cyrillic_validator],
        label="Ваше отчество (при наличии)",
        required=False,
        widget=forms.TextInput(attrs={
            "placeholder": "Здесь ваше отчество",
            "class": "form-field__input",
        })
    )

    # Поле даты рождения с ограничением 18 лет
    date_birth = forms.DateField(
        label="Ваша дата рождения",
        widget=forms.DateInput(attrs={
            "type": "date",
            "class": "form-field__input date-birth-input",
        })
    )

    # Поле пола с выбором
    sex = forms.ChoiceField(
        choices=[('Мужской', 'Мужской'), ('Женский', 'Женский')],
        label="Ваш пол",
        widget=forms.Select(attrs={
            "class": "form-field__input",
        })
    )

    # Знак зодиака - выбор из модели
    astral_sign = forms.ModelChoiceField(
        queryset=AstralSign.objects.all(),
        label="Ваш знак зодиака",
        widget=forms.Select(attrs={
            "class": "form-field__input",
        })
    )

    # Уровень образования - выбор из модели
    educational_level = forms.ModelChoiceField(
        queryset=EducationalLevel.objects.all(),
        label="Ваш уровень образования",
        widget=forms.Select(attrs={
            "class": "form-field__input",
        })
    )

    # Поле для вредных привычек
    bad_habits = forms.CharField(
        max_length=255,
        required=False,
        label="Ваши вредные привычки",
        widget=forms.TextInput(attrs={
            "placeholder": "Здесь ваши вредные привычки",
            "class": "form-field__input",
        })
    )

    # Количество детей
    children_quantity = forms.IntegerField(
        min_value=0,
        required=False,
        label="Сколько у вас детей",
        widget=forms.NumberInput(attrs={
            "placeholder": "Здесь ваше количество детей",
            "class": "form-field__input",
        })
    )

    class Meta:
        model = User
        fields = ["first_name", "last_name", "patronymic", "date_birth", "sex",
                  "educational_level", "bad_habits", "astral_sign", "children_quantity"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Устанавливаем ограничения для поля даты рождения всегда
        today = date.today()
        max_date = date(today.year - 18, today.month, today.day)
        min_date = date(today.year - 100, today.month, today.day)

        self.fields['date_birth'].widget.attrs['max'] = max_date.isoformat()
        self.fields['date_birth'].widget.attrs['min'] = min_date.isoformat()

        self.fields['astral_sign'].label_from_instance = lambda obj: obj.sign_name
        self.fields['educational_level'].label_from_instance = lambda obj: obj.level_name

    def clean_date_birth(self):
        date_birth = self.cleaned_data.get('date_birth')
        today = date.today()
        max_date = date(today.year - 18, today.month, today.day)

        if date_birth and date_birth > max_date:
            raise forms.ValidationError('Вы должны быть не моложе 18 лет')

        min_date = date(today.year - 100, today.month, today.day)
        if date_birth and date_birth < min_date:
            raise forms.ValidationError('Некорректная дата рождения')

        return date_birth

class MainCreatePostPostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["text", "image"]
        widgets = {
            "text": forms.Textarea(attrs={
                "placeholder": "Здесь ваш текст поста",
                "class": "form-field__input",
            }),
            "image": forms.FileInput(attrs={
                "placeholder": "Здесь изображение для вашего поста (необязательно)",
                "class": "form-field__input",
                "accept": "image/*",
            })
        }

class MainCreateCommentPostForm(forms.ModelForm):
    class Meta:
        model = Commentaries
        fields = ["text", "post", "parent_comment"]
        widgets = {
            "text": forms.Textarea(attrs={
                "class": "form-field__textarea",
                "placeholder": "Напишите ваш комментарий",
                "required": "required",
            }),
            "post": forms.HiddenInput(),
            "parent_comment": forms.HiddenInput(),
        }


from django import forms


class MainSearchUserForm(forms.Form):
    q = forms.CharField(
        required=False,
        label="Поиск",
        widget=forms.TextInput(attrs={
            "placeholder": "Имя, никнейм...",
            "class": "form-field__input"
        })
    )

    age_min = forms.IntegerField(
        required=False,
        label='От лет',
        widget=forms.NumberInput(attrs={
            "placeholder": "От",
            "class": "form-field__input",
            "min": 18,
            "max": 100,
        })
    )

    age_max = forms.IntegerField(
        required=False,
        label='До лет',
        widget=forms.NumberInput(attrs={
            "placeholder": "До",
            "class": "form-field__input",
            "min": 18,
            "max": 100,
        })
    )

    sex = forms.ChoiceField(
        choices=[('', 'Любой'), ('Мужской', 'Мужской'), ('Женский', 'Женский')],
        required=False,
        label='Пол',
        widget=forms.Select(attrs={
            "class": "form-field__select"
        })
    )

    def clean(self):
        cleaned_data = super().clean()
        age_min = cleaned_data.get('age_min')
        age_max = cleaned_data.get('age_max')

        if age_min and age_max and age_min > age_max:
            raise forms.ValidationError('Минимальный возраст не может быть больше максимального')

        return cleaned_data

class MainMessageForm(forms.Form):
    text = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-field__input chats__message-input',
            'placeholder': 'Напишите сообщение...',
            'required': True
        })
    )

class MainUserSettingsForm(forms.ModelForm):
    class Meta:
        model = UserSettings
        fields = ['theme', 'email_notifications', 'push_notifications']
        widgets = {
            'theme': forms.RadioSelect(attrs={'class': 'theme-toggle'}),
            'email_notifications': forms.CheckboxInput(attrs={'class': 'switch__input'}),
            'push_notifications': forms.CheckboxInput(attrs={'class': 'switch__input'}),
        }