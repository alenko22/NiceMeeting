(function() {
    'use strict';

    class EventSignUp {
        constructor(button) {
            this.button = button;
            this.eventId = button.dataset.eventId;
            this.signUpUrl = button.dataset.signupUrl;
            this.csrfToken = button.dataset.csrfToken;
            this.isSubmitting = false; // Флаг для предотвращения повторных отправок

            this.init();
        }

        init() {
            this.button.addEventListener('click', (e) => this.handleSignUp(e));
        }

        handleSignUp(e) {
            e.preventDefault();
            e.stopPropagation();

            // Предотвращаем повторные отправки
            if (this.isSubmitting) {
                return;
            }

            this.isSubmitting = true;
            const originalText = this.button.textContent;
            this.button.textContent = 'Отправка...';
            this.button.disabled = true;

            fetch(this.signUpUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify({
                    event_id: this.eventId
                })
            })
            .then(response => response.json())
            .then(data => this.handleResponse(data, originalText))
            .catch(error => this.handleError(error, originalText))
            .finally(() => {
                this.isSubmitting = false;
            });
        }

        handleResponse(data, originalText) {
            if (data.success) {
                this.onSuccess();
            } else {
                this.onFailure(data.error || 'Неизвестная ошибка', originalText);
            }
        }

        handleError(error, originalText) {
            console.error('Error:', error);
            this.onFailure('Произошла ошибка при отправке запроса', originalText);
        }

        onSuccess() {
            // Меняем кнопку
            this.button.textContent = 'Вы записаны';
            this.button.disabled = true;

            // Обновляем счетчик участников
            this.updateParticipantsCount();

            // Показываем уведомление
            alert('Вы успешно записались на мероприятие!');
        }

        updateParticipantsCount() {
            const participantsCountEl = document.querySelector('.event-detail__participants-count');
            if (participantsCountEl) {
                const match = participantsCountEl.textContent.match(/(\d+) из/);
                if (match) {
                    const currentCount = parseInt(match[1]);
                    participantsCountEl.textContent = participantsCountEl.textContent.replace(
                        /(\d+) из/,
                        `${currentCount + 1} из`
                    );
                }
            }
        }

        onFailure(errorMessage, originalText) {
            alert('Ошибка при записи: ' + errorMessage);
            this.button.textContent = originalText;
            this.button.disabled = false;
        }
    }

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        const signUpButton = document.querySelector('[data-event-id]');

        // Проверяем, не инициализирована ли уже кнопка
        if (signUpButton && !signUpButton.dataset.initialized) {
            new EventSignUp(signUpButton);
            signUpButton.dataset.initialized = 'true'; // Помечаем как инициализированную
        }
    });

})();