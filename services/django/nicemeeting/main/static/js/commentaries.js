document.addEventListener('DOMContentLoaded', function() {
    // ===== СУЩЕСТВУЮЩАЯ ЛОГИКА (ответы, отмена, прокрутка) =====
    const commentForm = document.getElementById('comment-form');
    const parentInput = document.getElementById('id_parent_comment');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const textarea = document.getElementById('id_text');

    // Кнопки "Ответить"
    const replyButtons = document.querySelectorAll('.post-comments__comment-reply');
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.getAttribute('data-comment-id');
            parentInput.value = commentId;
            const authorName = this.getAttribute('data-author');

            formTitle.textContent = `Ответить @${authorName}`;
            submitBtn.textContent = 'Отправить ответ';
            cancelBtn.style.display = 'inline-block';
            textarea.focus();

            document.getElementById('main-comment-form').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Кнопка "Отмена" ответа
    cancelBtn.addEventListener('click', function() {
        parentInput.value = '';
        textarea.value = '';
        formTitle.textContent = 'Оставить комментарий';
        submitBtn.textContent = 'Опубликовать';
        cancelBtn.style.display = 'none';
    });

    // Автофокус на поле комментария
    if (!parentInput.value) {
        textarea.focus();
    }

    // Прокрутка к форме при клике на кнопку "Комментировать" в карточке поста
    const commentBtn = document.querySelector('.post-comments__post-comment-btn');
    if (commentBtn) {
        commentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('main-comment-form').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            textarea.focus();
        });
    }

    // ===== НОВАЯ ФУНКЦИЯ: УКОРАЧИВАНИЕ ДЛИННЫХ ТЕКСТОВ =====
    function initTextTruncation() {
        const textElements = document.querySelectorAll(
            '.post-comments__post-text, .post-comments__comment-text'
        );
        const MAX_LINES = 4; // должно совпадать с CSS-свойством -webkit-line-clamp

        textElements.forEach(el => {
            // Пропускаем уже обработанные
            if (el.hasAttribute('data-truncation-processed')) return;

            el.classList.add('comment-text');

            // Вычисляем высоту одной строки (line-height) в пикселях
            const computedStyle = window.getComputedStyle(el);
            const fontSize = parseFloat(computedStyle.fontSize);
            let lineHeight = computedStyle.lineHeight;
            if (lineHeight === 'normal') {
                lineHeight = fontSize * 1.2; // приблизительное значение
            } else {
                lineHeight = parseFloat(lineHeight);
            }

            // Полная высота содержимого (без учёта CSS-обрезания)
            const fullHeight = el.scrollHeight;
            const threshold = lineHeight * MAX_LINES;

            // Если текст не превышает порог – ничего не делаем
            if (fullHeight <= threshold) return;

            // Помечаем, чтобы не обрабатывать повторно
            el.setAttribute('data-truncation-processed', 'true');
            el.classList.add('comment-text--truncated');

            // Создаём обёртку для кнопки
            const wrapper = document.createElement('div');
            wrapper.className = 'comment-toggle-wrapper';

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'comment-toggle-btn';
            toggleBtn.textContent = 'Читать дальше';

            el.parentNode.insertBefore(wrapper, el.nextSibling);
            wrapper.appendChild(toggleBtn);

            toggleBtn.addEventListener('click', () => {
                if (el.classList.contains('comment-text--truncated')) {
                    // Раскрыть текст
                    el.classList.remove('comment-text--truncated');
                    el.classList.add('comment-text--expanded');
                    toggleBtn.textContent = 'Скрыть';
                } else {
                    // Свернуть обратно
                    el.classList.add('comment-text--truncated');
                    el.classList.remove('comment-text--expanded');
                    toggleBtn.textContent = 'Читать дальше';
                }
            });
        });
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

    document.querySelectorAll('.post-comments__comment-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const commentId = this.dataset.commentId;
            const deleteUrl = this.dataset.deleteUrl;

            if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

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
                    // Удаляем DOM-элемент комментария
                    const commentElement = this.closest('.post-comments__comment');
                    if (commentElement) commentElement.remove();
                    showNotification('Комментарий удалён', 'success');
                    // Обновить счётчик комментариев (опционально)
                    const commentsCountSpan = document.querySelector('.post-comments__comments-title');
                    if (commentsCountSpan) {
                        let count = parseInt(commentsCountSpan.textContent.match(/\d+/)?.[0] || 0);
                        count--;
                        commentsCountSpan.textContent = `Комментарии (${count})`;
                    }
                } else {
                    showNotification('Ошибка при удалении', 'error');
                }
            })
            .catch(() => showNotification('Сетевая ошибка', 'error'));
        });
    });

    // Запускаем укорачивание при загрузке страницы
    initTextTruncation();
});