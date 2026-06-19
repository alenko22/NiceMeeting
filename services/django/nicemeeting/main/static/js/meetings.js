document.addEventListener('DOMContentLoaded', function() {

    updateAllCountdowns();
    setInterval(updateAllCountdowns, 60000); // Обновляем каждую минуту
    // Показываем модальное окно, если есть уведомления
    const modal = document.getElementById('notificationModal');
    const pendingItems = document.querySelectorAll('.notification-item:not(.declined-item)');
    const declinedItems = document.querySelectorAll('.declined-item');

    if (pendingItems.length > 0 || declinedItems.length > 0) {
        modal.style.display = 'block';
    }
    console.log('Modal element:', modal);
    console.log('Pending items count:', pendingItems.length);
    console.log('Declined items count:', declinedItems.length);
    if (modal) {
    modal.style.display = 'block';
}


    // Закрытие модалки по крестику
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            // После закрытия удаляем declined встречи (уведомления)
            if (declinedItems.length > 0) {
                fetch('/dismiss-declined/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Удаляем блоки declined из DOM
                        declinedItems.forEach(el => el.remove());
                    }
                });
            }
        });
    }

    // Обработка принятия
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingId = this.dataset.id;
            const item = this.closest('.notification-item');
            fetch(`/accept-meeting/${meetingId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    item.remove(); // убираем из модалки
                    // Можно обновить страницу или добавить встречу в список вручную
                    // Для простоты перезагрузим страницу
                    location.reload();
                } else {
                    alert('Ошибка при принятии встречи');
                }
            });
        });
    });

    // Обработка отклонения
    document.querySelectorAll('.decline-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingId = this.dataset.id;
            const item = this.closest('.notification-item');
            fetch(`/decline-meeting/${meetingId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    item.remove(); // убираем из модалки
                    // Если не осталось уведомлений, закрываем модалку
                    if (!document.querySelector('.notification-item')) {
                        modal.style.display = 'none';
                    }
                } else {
                    alert('Ошибка при отклонении встречи');
                }
            });
        });
    });

    // Кнопка "Закрыть" для отклонённых (если есть отдельная)
    const dismissBtn = document.querySelector('.dismiss-btn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            // Удаляем declined встречи
            if (declinedItems.length > 0) {
                fetch('/dismiss-declined/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        declinedItems.forEach(el => el.remove());
                    }
                });
            }
        });
    }

    // Функция для получения CSRF-токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function updateAllCountdowns() {
    const countdownElements = document.querySelectorAll('.meetings__countdown');

    countdownElements.forEach(element => {
        const datetimeStr = element.getAttribute('data-datetime');
        if (!datetimeStr) return;

        const meetingTime = new Date(datetimeStr);
        const now = new Date();
        const diffMs = meetingTime - now;

        const valueElement = element.querySelector('.meetings__countdown-value');
        if (!valueElement) return;

        if (diffMs <= 0) {
            valueElement.textContent = 'Прошла';
            valueElement.style.color = '#9E9E9E';
            return;
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let countdownText = '';

        if (diffDays > 0) {
            countdownText = `${diffDays} дн. ${diffHours} ч.`;
        } else if (diffHours > 0) {
            countdownText = `${diffHours} ч. ${diffMinutes} мин.`;
        } else {
            countdownText = `${diffMinutes} мин.`;
        }

        valueElement.textContent = countdownText;

        // Меняем цвет в зависимости от времени до встречи
        if (diffHours < 24 && diffDays === 0) {
            valueElement.style.color = '#ff9800';
        }
        if (diffHours < 2 && diffDays === 0) {
            valueElement.style.color = '#f44336';
        }
    });

}
});

