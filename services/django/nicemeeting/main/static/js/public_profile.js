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

    // Функция обновления поля datetime при выборе мероприятия
    function updateDatetimeForEvent() {
        const activeType = document.querySelector('.schedule-meeting-form__type-btn--active');
        if (activeType && activeType.dataset.type === 'event') {
            const selectedOption = eventSelect.options[eventSelect.selectedIndex];
            const beginTime = selectedOption?.dataset?.begin;
            if (beginTime) {
                datetimeInput.value = beginTime;
                datetimeInput.disabled = true;
                if (datetimeError) datetimeError.textContent = '';
            } else {
                datetimeInput.value = '';
                datetimeInput.disabled = false;
            }
        } else {
            datetimeInput.disabled = false;
        }
    }

    // Открытие модального окна
    if (scheduleMeetingBtn) {
        scheduleMeetingBtn.addEventListener('click', function() {
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const minDatetime = now.toISOString().slice(0, 16);
            datetimeInput.min = minDatetime;
            datetimeInput.value = minDatetime;

            scheduleMeetingForm.reset();
            eventError.textContent = '';
            placeError.textContent = '';
            datetimeError.textContent = '';
            eventSection.style.display = 'block';
            placeSection.style.display = 'none';

            // Исправление: безопасно удаляем активный класс, если он есть
            const activeBtn = document.querySelector('.schedule-meeting-form__type-btn--active');
            if (activeBtn) activeBtn.classList.remove('schedule-meeting-form__type-btn--active');
            typeBtns[0].classList.add('schedule-meeting-form__type-btn--active');

            if (eventSelect.value) {
                updateDatetimeForEvent();
            }

            openModal(scheduleMeetingModal);
        });
    }

    // Закрытие
    closeScheduleMeetingModalBtns.forEach(btn => {
        btn.addEventListener('click', () => closeModal(scheduleMeetingModal));
    });
    if (scheduleMeetingModal) {
        scheduleMeetingModal.querySelector('.modal__backdrop').addEventListener('click', () => closeModal(scheduleMeetingModal));
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
                updateDatetimeForEvent();
            } else {
                eventSection.style.display = 'none';
                placeSection.style.display = 'block';
                eventSelect.required = false;
                placeInput.required = true;
                datetimeInput.disabled = false;
                datetimeInput.value = '';
            }
        });
    });

    // Обновление при выборе мероприятия
    if (eventSelect) {
        eventSelect.addEventListener('change', updateDatetimeForEvent);
    }

    // Отправка формы
    if (scheduleMeetingForm) {
        scheduleMeetingForm.addEventListener('submit', function(e) {
            e.preventDefault();

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
            if (!datetimeInput.value && type !== 'event') {
                datetimeError.textContent = 'Пожалуйста, укажите дату и время';
                isValid = false;
            }

            if (!isValid) return;

            const formData = new FormData(this);
            const userId = scheduleMeetingBtn.dataset.userId;
            formData.append('type', type);
            formData.append('user2_id', userId);
            if (type === 'event') formData.delete('datetime');

            fetch(this.getAttribute('data-action-url'), {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
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
            .catch(() => showNotification('Произошла ошибка. Попробуйте снова.', 'error'));
        });
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

    if (editInterestsModal) {
        editInterestsModal.querySelector('.modal__backdrop').addEventListener('click', function() {
            closeModal(editInterestsModal);
        });
    }

    // Отправка формы редактирования интересов
    if (editInterestsForm) {
        editInterestsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let isValid = true;
            interestsError.textContent = '';

            const interestsValue = interestsTextarea.value.trim();

            if (!interestsValue) {
                interestsError.textContent = 'Пожалуйста, введите хотя бы один интерес';
                isValid = false;
            }

            if (!isValid) return;

            const formData = new FormData(this);
            const actionUrl = this.getAttribute('data-action-url');

            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
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

    function updateInterestsDisplay(interestsString) {
        if (!interestsList) return;

        interestsList.innerHTML = '';

        if (!interestsString || interestsString.trim() === '') {
            interestsList.innerHTML = '<p class="public-profile__no-interests">Интересы не указаны</p>';
            return;
        }

        const interestsArray = interestsString.trim().split(/\s+/);
        interestsArray.forEach(interest => {
            if (interest.trim() !== '') {
                const interestElement = document.createElement('span');
                interestElement.className = 'public-profile__interest';
                interestElement.textContent = capitalizeFirstLetter(interest.trim());
                interestsList.appendChild(interestElement);
            }
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    // ========== НАПИСАТЬ СООБЩЕНИЕ ==========
    const messageBtn = document.querySelector('.public-profile__message-btn');
    if (messageBtn) {
        messageBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const recipientId = this.dataset.recipientId;
            const url = this.dataset.url;

            if (!recipientId || !url) {
                console.error('Missing recipient ID or URL');
                showNotification('Ошибка: не удалось создать чат', 'error');
                return;
            }

            // Исправление: добавляем функцию getCSRFToken (она определена в этом же файле)
            function getCSRFToken() {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let cookie of cookies) {
                        cookie = cookie.trim();
                        if (cookie.substring(0, 10) === 'csrftoken=') {
                            cookieValue = decodeURIComponent(cookie.substring(10));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({ 'recipient_id': recipientId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect_url;
                } else {
                    showNotification('Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка при создании чата', 'error');
            });
        });
    }

    // ========== ЗАГРУЗКА АВАТАРА ==========
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const uploadAvatarModal = document.getElementById('uploadAvatarModal');
    const closeUploadAvatarBtns = document.querySelectorAll('#closeUploadAvatarModal, #closeUploadAvatarModalBtn');
    const uploadAvatarForm = document.getElementById('uploadAvatarForm');
    const avatarError = document.getElementById('avatarError');
    const profileAvatar = document.getElementById('profileAvatar');

    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            if (uploadAvatarForm) uploadAvatarForm.reset();
            if (avatarError) avatarError.textContent = '';
            openModal(uploadAvatarModal);
        });
    }

    closeUploadAvatarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(uploadAvatarModal);
        });
    });

    if (uploadAvatarModal) {
        const backdrop = uploadAvatarModal.querySelector('.modal__backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', function() {
                closeModal(uploadAvatarModal);
            });
        }
    }

    if (uploadAvatarForm) {
        uploadAvatarForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (avatarError) avatarError.textContent = '';

            const formData = new FormData(this);
            const actionUrl = this.getAttribute('data-action-url');

            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (profileAvatar) {
                        profileAvatar.src = data.avatar_url + '?t=' + Date.now();
                    }
                    showNotification('Аватар успешно загружен!', 'success');
                    closeModal(uploadAvatarModal);
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    if (avatarError) avatarError.textContent = data.error || 'Ошибка загрузки';
                    showNotification(data.error || 'Ошибка загрузки', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (avatarError) avatarError.textContent = 'Сетевая ошибка. Попробуйте позже.';
                showNotification('Произошла ошибка. Попробуйте снова.', 'error');
            });
        });
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.classList.add('notification--hidden');
            setTimeout(() => existing.remove(), 300);
        }
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        const icon = type === 'success'
            ? '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>';
        notification.innerHTML = `${icon}<span class="notification__message">${message}</span><button class="notification__close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
        document.body.appendChild(notification);
        const timeoutId = setTimeout(() => {
            notification.classList.add('notification--hidden');
            setTimeout(() => notification.remove(), 300);
        }, type === 'success' ? 3000 : 5000);
        notification.querySelector('.notification__close').addEventListener('click', () => {
            clearTimeout(timeoutId);
            notification.classList.add('notification--hidden');
            setTimeout(() => notification.remove(), 300);
        });
    }


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

    // Обработка блокировки
    const blockBtn = document.querySelector('.chats__block-btn');
    const blockActionModal = document.getElementById('blockActionModal');
    const complaintModal = document.getElementById('complaintModal');
    let currentBlockUserId = null;

    if (blockBtn) {
        blockBtn.addEventListener('click', () => {
            currentBlockUserId = blockBtn.dataset.otherUserId;
            document.getElementById('block-username').textContent = blockBtn.dataset.otherUsername;
            openModal(blockActionModal);
        });
    }

    document.getElementById('blockOnlyBtn')?.addEventListener('click', () => {
        closeModal(blockActionModal);
        sendBlockRequest(currentBlockUserId, 'block');
    });

    document.getElementById('blockAndComplainBtn')?.addEventListener('click', () => {
        closeModal(blockActionModal);
        openModal(complaintModal);
    });

    document.getElementById('submitComplaintBtn')?.addEventListener('click', () => {
        const reason = document.getElementById('complaintReason').value.trim();
        if (!reason) {
            showNotification('Укажите причину жалобы', 'error');
            return;
        }
        closeModal(complaintModal);
        sendBlockRequest(currentBlockUserId, 'block_and_complain', reason);
    });

    function sendBlockRequest(userId, action, complaintReason = '') {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('action', action);
        if (complaintReason) formData.append('complaint_reason', complaintReason);
        formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

        fetch('/block-user/', {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                window.location.href = '/chats/'; // редирект на список чатов
            } else {
                showNotification(data.error, 'error');
            }
        })
        .catch(() => showNotification('Ошибка при блокировке', 'error'));
    }

    const deleteUserBtn = document.querySelector('.public-profile__delete-user-btn');
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            const username = this.dataset.username;
            const deleteUrl = this.dataset.deleteUrl;

            if (!confirm(`ВНИМАНИЕ! Вы собираетесь полностью удалить пользователя ${username}. Его email будет заблокирован для повторной регистрации. Действие необратимо. Продолжить?`)) {
                return;
            }

            function getCSRFToken() {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let cookie of cookies) {
                        cookie = cookie.trim();
                        if (cookie.substring(0, 10) === 'csrftoken=') {
                            cookieValue = decodeURIComponent(cookie.substring(10));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

            fetch(deleteUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    // Через секунду перенаправляем на главную или список пользователей
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    showNotification(data.message || 'Ошибка при удалении', 'error');
                }
            })
            .catch(() => showNotification('Сетевая ошибка', 'error'));
        });
    }
});