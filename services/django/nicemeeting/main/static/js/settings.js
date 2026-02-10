document.addEventListener('DOMContentLoaded', function() {
    // Предпросмотр темы при переключении радио-кнопок
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const selectedTheme = this.value;
            if (selectedTheme === 'auto') {
                // Для автотемы определяем системную
                const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
                document.body.className = 'theme-' + (isDarkMode ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', selectedTheme);
                document.body.className = 'theme-' + selectedTheme;
            }
        });
    });

    // Слушатель изменения системной темы для авторежима
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function(e) {
        const autoRadio = document.querySelector('input[name="theme"][value="auto"]:checked');
        if (autoRadio) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            document.body.className = 'theme-' + (e.matches ? 'dark' : 'light');
        }
    });
});