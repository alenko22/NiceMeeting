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

    // Запускаем укорачивание при загрузке страницы
    initTextTruncation();
});