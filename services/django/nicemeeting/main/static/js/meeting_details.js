document.addEventListener('DOMContentLoaded', function() {
    // ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ==========
    const editMeetingBtn = document.getElementById('editMeetingBtn');
    const editMeetingModal = document.getElementById('editMeetingModal');
    const closeEditMeetingModalBtns = document.querySelectorAll('#closeEditMeetingModal, #closeEditMeetingModalBtn');
    const editMeetingForm = document.getElementById('editMeetingForm');

    if (editMeetingBtn) {
        editMeetingBtn.addEventListener('click', function() {
            openModal(editMeetingModal);
        });
    }

    closeEditMeetingModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(editMeetingModal);
        });
    });

    if (editMeetingModal) {
        editMeetingModal.querySelector('.modal__backdrop').addEventListener('click', function() {
            closeModal(editMeetingModal);
        });
    }

    if (editMeetingForm) {
        editMeetingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const meetingId = this.dataset.meetingId;
            const datetimeInput = this.querySelector('.edit-meeting-form__datetime-input');
            const datetimeError = this.querySelector('.edit-meeting-form__datetime-error');

            // Валидация
            if (!datetimeInput.value) {
                datetimeError.textContent = 'Укажите дату и время';
                return;
            }

            fetch(`/meeting/${meetingId}/edit/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Встреча успешно обновлена!', 'success');
                    closeModal(editMeetingModal);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    if (data.errors && data.errors.datetime) {
                        datetimeError.textContent = data.errors.datetime;
                    }
                    showNotification(data.message || 'Ошибка при обновлении', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка', 'error');
            });
        });
    }

    // ========== МОДАЛЬНОЕ ОКНО УДАЛЕНИЯ ==========
    const deleteMeetingBtn = document.getElementById('deleteMeetingBtn');
    const deleteMeetingModal = document.getElementById('deleteMeetingModal');
    const closeDeleteMeetingModalBtns = document.querySelectorAll('#closeDeleteMeetingModal, #closeDeleteMeetingModalBtn');
    const confirmDeleteMeetingBtn = document.getElementById('confirmDeleteMeetingBtn');

    if (deleteMeetingBtn) {
        deleteMeetingBtn.addEventListener('click', function() {
            openModal(deleteMeetingModal);
        });
    }

    closeDeleteMeetingModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(deleteMeetingModal);
        });
    });

    if (deleteMeetingModal) {
        deleteMeetingModal.querySelector('.modal__backdrop').addEventListener('click', function() {
            closeModal(deleteMeetingModal);
        });
    }

    if (confirmDeleteMeetingBtn) {
        confirmDeleteMeetingBtn.addEventListener('click', function() {
            const meetingId = document.querySelector('.edit-meeting-form').dataset.meetingId;

            fetch(`/meeting/${meetingId}/delete/`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Встреча отменена!', 'success');
                    closeModal(deleteMeetingModal);
                    setTimeout(() => {
                        window.location.href = '/meetings/';
                    }, 1500);
                } else {
                    showNotification(data.message || 'Ошибка при отмене встречи', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка', 'error');
            });
        });
    }

    // ========== КНОПКА "В КАЛЕНДАРЬ" ==========
    const addToCalendarBtn = document.getElementById('addToCalendarBtn');
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', function() {
            showNotification('Функция добавления в календарь будет доступна в ближайшее время', 'info');
        });
    }

    // ========== КНОПКА "НАПИСАТЬ УЧАСТНИКАМ" ==========
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', function() {
            showNotification('Переход в чат с участниками будет доступен в ближайшее время', 'info');
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
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;

        const icon = type === 'success' ?
            '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>' :
            type === 'error' ?
            '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>' :
            '<svg class="notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg>';

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

        setTimeout(() => {
            notification.classList.add('notification--hidden');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, type === 'success' ? 3000 : 5000);

        notification.querySelector('.notification__close').addEventListener('click', () => {
            notification.classList.add('notification--hidden');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
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
});