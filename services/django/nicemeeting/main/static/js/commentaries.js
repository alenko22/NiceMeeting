document.addEventListener('DOMContentLoaded', function() {
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

            // Устанавливаем родительский комментарий
            parentInput.value = commentId;

            // Меняем заголовок формы
            formTitle.textContent = `Ответить @${authorName}`;

            // Меняем текст кнопки
            submitBtn.textContent = 'Отправить ответ';

            // Показываем кнопку отмены
            cancelBtn.style.display = 'inline-block';

            // Фокус на текстовое поле
            textarea.focus();

            // Прокручиваем к форме
            document.getElementById('main-comment-form').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Обработка кнопки отмены
    cancelBtn.addEventListener('click', function() {
        // Очищаем форму
        parentInput.value = '';
        textarea.value = '';

        // Возвращаем оригинальные тексты
        formTitle.textContent = 'Оставить комментарий';
        submitBtn.textContent = 'Опубликовать';

        // Скрываем кнопку отмены
        cancelBtn.style.display = 'none';
    });

    // Автофокус на поле комментария при загрузке
    if (!parentInput.value) {
        textarea.focus();
    }

    // Плавная прокрутка к форме при клике на кнопку комментирования
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
});