document.addEventListener('DOMContentLoaded', function() {
    // Кэш для сохранённых оценок
    const savedRatings = JSON.parse(localStorage.getItem('savedRatings')) || {};

    // Отслеживаем уже отправленные оценки и кнопки в процессе отправки
    const submittedRatings = new Set();
    const processingButtons = new Set();

    // Восстанавливаем сохранённые оценки
    restoreSavedRatings();

    // Обработчик кнопок сохранения
    document.querySelectorAll('.rating-system__btn-submit').forEach(button => {
        // Удаляем старые обработчики (на всякий случай)
        button.replaceWith(button.cloneNode(true));
    });

    // Назначаем новые обработчики
    document.querySelectorAll('.rating-system__btn-submit').forEach(button => {
        button.addEventListener('click', function(event) {
            const userId = this.dataset.userId;

            // Проверяем, не в процессе ли уже отправки
            if (processingButtons.has(userId)) {
                console.log('Запрос уже в процессе для пользователя', userId);
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }

            // Проверяем, не отправляли ли уже оценку
            if (submittedRatings.has(userId)) {
                alert('Оценка уже отправлена!');
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }

            // Добавляем в список обрабатываемых
            processingButtons.add(userId);

            // Сохраняем оценку
            saveRating(userId, this);

            // Предотвращаем дальнейшую обработку
            event.preventDefault();
            event.stopImmediatePropagation();
            return false;
        }, { once: true }); // Обработчик сработает только один раз
    });

    // Обработчик радиокнопок (визуальный фидбек)
    document.querySelectorAll('.rating-system__rating-option').forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.classList.add('rating-system__rating-option--hover');
        });

        option.addEventListener('mouseleave', function() {
            this.classList.remove('rating-system__rating-option--hover');
        });
    });

    // Функция сохранения оценки
    function saveRating(userId, button) {
        const ratingInput = document.querySelector(`input[name="rating-${userId}"]:checked`);
        const commentInput = document.getElementById(`comment-${userId}`);

        if (!ratingInput) {
            alert('Пожалуйста, поставьте оценку от 1 до 9');
            processingButtons.delete(userId);
            return;
        }

        const rating = ratingInput.value;
        const comment = commentInput.value.trim();

        // Немедленно блокируем кнопку
        button.disabled = true;
        button.textContent = 'Отправка...';
        button.classList.add('submitting');

        // Отправляем на сервер
        submitRatingToServer(userId, rating, comment, button);
    }

    // Отправка данных на сервер
    function submitRatingToServer(userId, rating, comment, button) {
        const rateUrl = button.dataset.rateUrl;

        console.log('Отправка запроса на сервер для пользователя:', userId);

        fetch(rateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                user_id: userId,
                rating: rating,
                comment: comment
            })
        })
        .then(response => {
            console.log('Получен ответ:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Данные ответа:', data);

            // Удаляем из списка обрабатываемых
            processingButtons.delete(userId);

            if (data.success) {
                showSuccessMessage('Оценка успешно сохранена!');
                // Маркируем карточку как оценённую
                markCardAsRated(userId, button);
                submittedRatings.add(userId);

                // Сохраняем в localStorage
                savedRatings[userId] = {
                    rating: rating,
                    comment: comment,
                    timestamp: new Date().toISOString(),
                    submitted: true
                };
                localStorage.setItem('savedRatings', JSON.stringify(savedRatings));
            } else {
                // Если ошибка, разблокируем кнопку
                button.disabled = false;
                button.textContent = 'Сохранить оценку';
                button.classList.remove('submitting');
                showErrorMessage(data.error || 'Ошибка при сохранении оценки');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Разблокируем кнопку при ошибке сети
            processingButtons.delete(userId);
            button.disabled = false;
            button.textContent = 'Сохранить оценку';
            button.classList.remove('submitting');
            showErrorMessage('Произошла ошибка при отправке данных');
        });
    }

    // Маркировка карточки как оценённой
    function markCardAsRated(userId, button) {
        const card = document.querySelector(`.rating-system__card[data-user-id="${userId}"]`);
        if (card) {
            card.classList.add('rating-system__card--rated');
            button.disabled = true;
            button.textContent = 'Оценено ✓';
        }
    }

    // Восстановление сохранённых оценок
    function restoreSavedRatings() {
        Object.keys(savedRatings).forEach(userId => {
            const ratingData = savedRatings[userId];
            const rating = ratingData.rating;
            const comment = ratingData.comment;
            const wasSubmitted = ratingData.submitted || false;

            const ratingInput = document.querySelector(`input[name="rating-${userId}"][value="${rating}"]`);
            const commentInput = document.getElementById(`comment-${userId}`);
            const button = document.querySelector(`.rating-system__btn-submit[data-user-id="${userId}"]`);

            if (ratingInput) {
                ratingInput.checked = true;
            }

            if (commentInput) {
                commentInput.value = comment;
            }

            // Маркируем как оценённую только если оценка была отправлена на сервер
            if (wasSubmitted && button) {
                markCardAsRated(userId, button);
                submittedRatings.add(userId);
            }
        });
    }

    // Вспомогательные функции
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

    function showSuccessMessage(message) {
        // Можно заменить на более красивый toast-уведомление
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 3s ease;
        `;

        document.body.appendChild(notification);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function showErrorMessage(message) {
        alert('Ошибка: ' + message);
    }
});