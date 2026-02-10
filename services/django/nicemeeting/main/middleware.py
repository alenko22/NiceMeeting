from main.models import UserSettings


class ThemeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            try:
                theme = request.user.settings.theme
                if theme == 'auto':
                    # Можно определить предпочтение системы
                    theme = self.get_system_theme(request)
                request.theme = theme
            except UserSettings.DoesNotExist:
                request.theme = 'light'
        else:
            request.theme = request.session.get('theme', 'light')

        response = self.get_response(request)
        return response

    def get_system_theme(self, request):
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()

        return 'dark' if 'dark' in user_agent else 'light'