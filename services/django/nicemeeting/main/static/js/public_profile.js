// static/js/public_profile.js

document.addEventListener('DOMContentLoaded', function() {

    // Обработка клика по кнопке удаления
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

            // Показать подтверждение
            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
                deletePost(deleteUrl, postElement);
            }
        });
    });

    // Функция отправки запроса на удаление
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
                // Удалить карточку поста с анимацией
                postElement.style.opacity = '0';
                postElement.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    postElement.remove();
                    alert('Пост успешно удалён!');
                }, 300);
            } else {
                alert(data.error || 'Ошибка при удалении поста');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Произошла ошибка при удалении. Проверьте консоль.');
        });
    }

    // Функция получения CSRF токена
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