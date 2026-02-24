document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('.date-birth-input');

    if (dateInput) {
        // Установка максимальной даты (18 лет назад от сегодня)
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 18);
        
        // Установка минимальной даты (100 лет назад)
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 100);

        // Форматирование даты для атрибутов
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        dateInput.setAttribute('max', formatDate(maxDate));
        dateInput.setAttribute('min', formatDate(minDate));

        // Запрет ввода с клавиатуры, но разрешение выбора через календарь
        dateInput.addEventListener('keydown', function(e) {
            // Разрешаем только клавиши навигации (Tab, Arrow keys, Delete, Backspace)
            const allowedKeys = [
                'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Delete', 'Backspace', 'Home', 'End'
            ];

            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        });

        // Дополнительная защита: очистка при вводе
        dateInput.addEventListener('input', function(e) {
            // Проверяем, что дата валидна
            const selectedDate = new Date(this.value);
            const maxAllowed = new Date(maxDate);
            const minAllowed = new Date(minDate);

            if (selectedDate > maxAllowed || selectedDate < minAllowed) {
                this.value = '';
                alert('Дата рождения должна быть от ' + formatDate(minAllowed) + 
                      ' до ' + formatDate(maxDate) + ' (только для лиц 18+)');
            }
        });
        
        // Обработка изменения через календарь
        dateInput.addEventListener('change', function(e) {
            if (this.value) {
                const selectedDate = new Date(this.value);
                const maxAllowed = new Date(maxDate);
                const minAllowed = new Date(minDate);
                
                if (selectedDate > maxAllowed) {
                    this.value = '';
                    alert('Вы должны быть не моложе 18 лет');
                } else if (selectedDate < minAllowed) {
                    this.value = '';
                    alert('Слишком ранняя дата рождения');
                }
            }
        });
    }
});