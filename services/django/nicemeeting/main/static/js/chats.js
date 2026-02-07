// static/js/chats.js
document.addEventListener('DOMContentLoaded', function() {
    const chatsList = document.querySelector('.chats__list-items');
    const messagesContent = document.querySelector('.chats__messages-content');
    const messageForm = document.querySelector('.chats__message-form');
    const messageInput = document.querySelector('.chats__message-input');
    const sendBtn = document.querySelector('.chats__send-btn');
    const newChatBtn = document.querySelector('.chats__new-chat-btn');

    // Обработчик отправки сообщения
    if (messageForm) {
        messageForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const chatId = this.dataset.chatId;
            const text = messageInput.value.trim();

            if (!text) return;

            try {
                const response = await fetch(`/chats/${chatId}/send/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: new URLSearchParams({
                        'text': text
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Добавляем сообщение в интерфейс
                    addMessageToUI(data.message, true);
                    messageInput.value = '';

                    // Прокручиваем вниз
                    messagesContent.scrollTop = messagesContent.scrollHeight;
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });
    }

    // Обработчик создания нового чата
    if (newChatBtn) {
        newChatBtn.addEventListener('click', function() {
            const recipientId = prompt('Введите ID пользователя для создания чата:');

            if (recipientId) {
                createNewChat(recipientId);
            }
        });
    }

    // Функция добавления сообщения в интерфейс
    function addMessageToUI(message, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'message--sent' : 'message--received'}`;

        const time = new Date(message.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        if (!isSent) {
            messageDiv.innerHTML = `
                <div class="message__avatar">
                    <div class="message__avatar-img" style="background: linear-gradient(135deg, var(--accent), var(--accent-2));">
                        <span class="message__avatar-letter">${message.sender.charAt(0)}</span>
                    </div>
                </div>
                <div class="message__content">
                    <p class="message__text">${message.text}</p>
                    <span class="message__time">${time}</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message__content">
                    <p class="message__text">${message.text}</p>
                    <span class="message__time">${time}</span>
                </div>
            `;
        }

        messagesContent.appendChild(messageDiv);
    }

    // Функция создания нового чата
    async function createNewChat(recipientId) {
        try {
            const response = await fetch('/chats/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: new URLSearchParams({
                    'recipient_id': recipientId
                })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = data.redirect_url;
            } else {
                alert('Ошибка создания чата: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            alert('Произошла ошибка при создании чата');
        }
    }

    // Вспомогательная функция для получения CSRF токена
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

    // Обработчик клика по чату в списке
    if (chatsList) {
        chatsList.addEventListener('click', function(e) {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem) {
                const chatId = chatItem.dataset.chatId;
                window.location.href = `/chats/${chatId}/`;
            }
        });
    }
});