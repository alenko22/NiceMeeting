// static/js/public_profile.js

document.addEventListener('DOMContentLoaded', function() {

    // ========== МОДАЛЬНОЕ ОКНО НАЗНАЧЕНИЯ ВСТРЕЧИ ==========
    const scheduleMeetingBtn = document.querySelector('.public-profile__schedule-meeting-btn');
    const scheduleMeetingModal = document.getElementById('scheduleMeetingModal');
    const closeScheduleMeetingModalBtns = document.querySelectorAll('#closeScheduleMeetingModal, #closeScheduleMeetingModalBtn');
    const scheduleMeetingForm = document.getElementById('scheduleMeetingForm');
    const typeBtns = document.querySelectorAll('.schedule-meeting-form__type-btn');
    const eventSection = document.querySelector('.schedule-meeting-form__section--event');
    const placeSection = document.querySelector('.schedule-meeting-form__section--place');
    const eventSelect = document.querySelector('.schedule-meeting-form__event-select');
    const placeInput = document.querySelector('.schedule-meeting-form__place-input');
    const datetimeInput = document.querySelector('.schedule-meeting-form__datetime-input');
    const eventError = document.querySelector('.schedule-meeting-form__event-error');
    const placeError = document.querySelector('.schedule-meeting-form__place-error');
    const datetimeError = document.querySelector('.schedule-meeting-form__datetime-error');

    // Открытие модального окна
    if (scheduleMeetingBtn) {
        scheduleMeetingBtn.addEventListener('click', function() {
            // Установить минимальную дату (сегодня + 1 час)
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const minDatetime = now.toISOString().slice(0, 16);
            datetimeInput.min = minDatetime;
            datetimeInput.value = minDatetime;

            // Сбросить форму
            scheduleMeetingForm.reset();
            eventError.textContent = '';
            placeError.textContent = '';
            datetimeError.textContent = '';
            eventSection.style.display = 'block';
            placeSection.style.display = 'none';
            document.querySelector('.schedule-meeting-form__type-btn--active').classList.remove('schedule-meeting-form__type-btn--active');
            typeBtns[0].classList.add('schedule-meeting-form__type-btn--active');

            openModal(scheduleMeetingModal);
        });
    }

    // Закрытие модального окна
    closeScheduleMeetingModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(scheduleMeetingModal);
        });
    });

    // Закрытие по клику на бэкдроп
    if (scheduleMeetingModal) {
        scheduleMeetingModal.querySelector('.modal__backdrop').addEventListener('click', function() {
            closeModal(scheduleMeetingModal);
        });
    }

    // Переключение типа встречи
    typeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            typeBtns.forEach(b => b.classList.remove('schedule-meeting-form__type-btn--active'));
            this.classList.add('schedule-meeting-form__type-btn--active');

            if (this.dataset.type === 'event') {
                eventSection.style.display = 'block';
                placeSection.style.display = 'none';
                eventSelect.required = true;
                placeInput.required = false;
            } else {
                eventSection.style.display = 'none';
                placeSection.style.display = 'block';
                eventSelect.required = false;
                placeInput.required = true;
            }
        });
    });

    // Отправка формы
    // Отправка формы
    if (scheduleMeetingForm) {
        scheduleMeetingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Валидация
            let isValid = true;
            eventError.textContent = '';
            placeError.textContent = '';
            datetimeError.textContent = '';

            const type = document.querySelector('.schedule-meeting-form__type-btn--active').dataset.type;

            if (type === 'event' && !eventSelect.value) {
                eventError.textContent = 'Пожалуйста, выберите мероприятие';
                isValid = false;
            }

            if (type === 'place' && !placeInput.value.trim()) {
                placeError.textContent = 'Пожалуйста, укажите место встречи';
                isValid = false;
            }

            if (!datetimeInput.value) {
                datetimeError.textContent = 'Пожалуйста, укажите дату и время';
                isValid = false;
            }

            if (!isValid) return;

            // Отправка данных
            const formData = new FormData(this);
            const userId = scheduleMeetingBtn.dataset.userId;

            // Добавляем тип встречи в данные
            formData.append('type', type);
            formData.append('user2_id', userId);

            // Получаем URL из атрибута формы
            const actionUrl = this.getAttribute('data-action-url');

            // Отправляем запрос
            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Встреча успешно назначена!', 'success');
                    closeModal(scheduleMeetingModal);
                    scheduleMeetingForm.reset();
                } else {
                    if (data.errors) {
                        if (data.errors.event) eventError.textContent = data.errors.event;
                        if (data.errors.place) placeError.textContent = data.errors.place;
                        if (data.errors.datetime) datetimeError.textContent = data.errors.datetime;
                    }
                    showNotification(data.message || 'Ошибка при создании встречи', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка. Попробуйте снова.', 'error');
            });
        });
    }

    // ========== ФУНКЦИИ ВСПОМОГАТЕЛЬНЫЕ ==========
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showNotification(message, type = 'success') {
        // Удаляем старое уведомление
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.classList.add('notification--hidden');
            setTimeout(() => existing.remove(), 300);
        }

        // Создаём новое
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;

        const icon = type === 'success' ?
            '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>' :
            '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>';

        notification.innerHTML = `
            ${icon}
            <span class="notification__message">${message}</span>
            <button class="notification__close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        document.body.appendChild(notification);

        // Автоскрытие
        const timeoutId = setTimeout(() => {
            notification.classList.add('notification--hidden');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, type === 'success' ? 3000 : 5000);

        // Закрытие по клику
        notification.querySelector('.notification__close').addEventListener('click', () => {
            clearTimeout(timeoutId);
            notification.classList.add('notification--hidden');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    // ========== УДАЛЕНИЕ ПОСТОВ ==========
    const deleteButtons = document.querySelectorAll('.public-profile__post-delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const postElement = this.closest('[data-post-id]');
            const deleteUrl = this.dataset.deleteUrl;

            if (!deleteUrl) {
                console.error('Delete URL not found');
                alert('Ошибка: не удалось найти ссылку для удаления');
                return;
            }

            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
                deletePost(deleteUrl, postElement);
            }
        });
    });

    function deletePost(deleteUrl, postElement) {
        fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                postElement.style.opacity = '0';
                postElement.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    postElement.remove();
                    showNotification('Пост успешно удалён!', 'success');
                }, 300);
            } else {
                showNotification(data.error || 'Ошибка при удалении поста', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Произошла ошибка при удалении', 'error');
        });
    }

    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
    // ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ИНТЕРЕСОВ ==========
    const editInterestsBtn = document.getElementById('editInterestsBtn');
    const editInterestsModal = document.getElementById('editInterestsModal');
    const closeEditInterestsModalBtns = document.querySelectorAll('#closeEditInterestsModal, #closeEditInterestsModalBtn');
    const editInterestsForm = document.getElementById('editInterestsForm');
    const interestsTextarea = document.querySelector('.edit-interests-form__textarea');
    const interestsError = document.querySelector('.edit-interests-form__error');
    const interestsList = document.getElementById('interestsList');

    // Открытие модального окна
    if (editInterestsBtn) {
        editInterestsBtn.addEventListener('click', function() {
            // Очистить ошибки
            interestsError.textContent = '';

            openModal(editInterestsModal);
        });
    }

    // Закрытие модального окна
    closeEditInterestsModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(editInterestsModal);
        });
    });

    // Закрытие по клику на бэкдроп
    if (editInterestsModal) {
        editInterestsModal.querySelector('.modal__backdrop').addEventListener('click', function() {
            closeModal(editInterestsModal);
        });
    }

    // Отправка формы редактирования интересов
    if (editInterestsForm) {
        editInterestsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Валидация
            let isValid = true;
            interestsError.textContent = '';

            const interestsValue = interestsTextarea.value.trim();

            if (!interestsValue) {
                interestsError.textContent = 'Пожалуйста, введите хотя бы один интерес';
                isValid = false;
            }

            if (!isValid) return;

            // Отправка данных
            const formData = new FormData(this);

            // Получаем URL из атрибута формы
            const actionUrl = this.getAttribute('data-action-url');

            // Отправляем запрос
            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Обновляем отображение интересов
                    updateInterestsDisplay(data.interests);

                    showNotification('Интересы успешно обновлены!', 'success');
                    closeModal(editInterestsModal);
                    editInterestsForm.reset();
                } else {
                    if (data.errors && data.errors.interests) {
                        interestsError.textContent = data.errors.interests;
                    }
                    showNotification(data.message || 'Ошибка при обновлении интересов', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка. Попробуйте снова.', 'error');
            });
        });
    }

    // Функция обновления отображения интересов
    function updateInterestsDisplay(interestsString) {
        if (!interestsList) return;

        // Очищаем текущий список
        interestsList.innerHTML = '';

        if (!interestsString || interestsString.trim() === '') {
            interestsList.innerHTML = '<p class="public-profile__no-interests">Интересы не указаны</p>';
            return;
        }

        // Разбиваем строку на отдельные интересы
        const interestsArray = interestsString.trim().split(/\s+/);

        // Создаем мини-блоки для каждого интереса
        interestsArray.forEach(interest => {
            if (interest.trim() !== '') {
                const interestElement = document.createElement('span');
                interestElement.className = 'public-profile__interest';
                // Делаем первую букву заглавной
                interestElement.textContent = capitalizeFirstLetter(interest.trim());
                interestsList.appendChild(interestElement);
            }
        });
    }

    // Функция для заглавной буквы
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
});