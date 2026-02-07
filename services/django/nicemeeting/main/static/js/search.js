// static/js/search.js
document.addEventListener('DOMContentLoaded', function() {
    // Обработка кнопки очистки
    const clearBtn = document.querySelector('#clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.querySelector('.search-form').reset();
        });
    }

    // Показ ошибок формы
    const errorElements = document.querySelectorAll('.form-field__error');
    if (errorElements.length > 0) {
        // Можно добавить анимацию или скролл к ошибкам
        errorElements.forEach(el => {
            el.style.animation = 'fadeIn 0.3s';
        });
    }
});