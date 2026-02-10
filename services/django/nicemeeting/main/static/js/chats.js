// static/js/chats.js
document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('message-form');
    const messageTextarea = document.getElementById('message-textarea');
    const messagesContent = document.getElementById('messages-content');
    const chatsListItems = document.querySelectorAll('.chat-item');

    // Авто-ресайз текстареи
    function autoResizeTextarea() {
        if (messageTextarea) {
            messageTextarea.style.height = 'auto';
            messageTextarea.style.height = (messageTextarea.scrollHeight) + 'px';
        }
    }

    // Инициализация авто-ресайза
    if (messageTextarea) {
        autoResizeTextarea();

        messageTextarea.addEventListener('input', function() {
            autoResizeTextarea();

            // Ограничение максимальной высоты
            if (this.scrollHeight > 200) {
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });

        messageTextarea.addEventListener('paste', function() {
            setTimeout(autoResizeTextarea, 0);
        });
    }

    // Отправка сообщения
    if (messageForm) {
        messageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const chatId = this.dataset.chatId;
            const text = messageTextarea.value.trim();

            if (!text) {
                messageTextarea.focus();
                return false;
            }

            // Блокируем кнопку отправки
            const sendBtn = this.querySelector('.chats__send-btn');
            const originalBtnText = sendBtn.innerHTML;
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<span>Отправка...</span>';

            try {
                const formData = new FormData();
                formData.append('text', text);
                formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

                const response = await fetch(`/chats/${chatId}/send/`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Добавляем сообщение в интерфейс
                    addMessageToUI(data.message);

                    // Очищаем поле ввода
                    messageTextarea.value = '';
                    autoResizeTextarea();

                    // Прокручиваем вниз
                    setTimeout(() => {
                        messagesContent.scrollTop = messagesContent.scrollHeight;
                    }, 50);

                    // Обновляем список чатов (имитация)
                    updateChatList(chatId, text, data.message.datetime);
                } else {
                    alert('Ошибка отправки сообщения: ' + JSON.stringify(data.error));
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Произошла ошибка при отправке сообщения');
            } finally {
                // Разблокируем кнопку
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalBtnText;
            }

            return false;
        });
    }

    // Обработчик клика по чату в списке
    chatsListItems.forEach(item => {
        item.addEventListener('click', function() {
            const chatId = this.dataset.chatId;
            window.location.href = `/chats/${chatId}/`;
        });
    });

    // Функция добавления сообщения в интерфейс
    function addMessageToUI(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message--sent';

        // Форматируем время
        const messageTime = new Date(message.datetime);
        const timeString = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        messageDiv.innerHTML = `
            <div class="message__content">
                <p class="message__text">${escapeHtml(message.text)}</p>
                <span class="message__time">${timeString}</span>
            </div>
        `;

        messagesContent.appendChild(messageDiv);
    }

    // Функция обновления списка чатов (визуально)
    function updateChatList(chatId, text, datetime) {
        const chatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (chatItem) {
            const timeElement = chatItem.querySelector('.chat-item__time');
            const messageTextElement = chatItem.querySelector('.chat-item__message-text');

            if (timeElement) {
                const messageTime = new Date(datetime);
                const timeString = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                timeElement.textContent = timeString;
            }

            if (messageTextElement) {
                messageTextElement.textContent = text.length > 30 ? text.substring(0, 30) + '...' : text;
            }

            // Перемещаем чат наверх
            const chatList = chatItem.parentElement;
            chatList.insertBefore(chatItem, chatList.firstChild);
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

    // Функция экранирования HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    // Модальное окно создания чата
    const createChatBtn = document.querySelector('.chats__new-chat-btn');
    const modal = document.getElementById('create-chat-modal');
    const searchInput = document.getElementById('search-user-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchResultsList = document.getElementById('search-results-list');
    const searchResultsEmpty = document.getElementById('search-results-empty');
    const searchResultsLoading = document.getElementById('search-results-loading');
    const searchResultsNotFound = document.getElementById('search-results-not-found');
    const modalCloseBtns = document.querySelectorAll('[data-modal-close]');

    let searchTimeout = null;
    let currentSearchQuery = '';

    // Открытие модального окна
    if (createChatBtn) {
        createChatBtn.addEventListener('click', function() {
            modal.classList.add('active');
            searchInput.focus();
            // Очищаем предыдущий поиск
            searchInput.value = '';
            searchResultsList.innerHTML = '';
            searchResultsEmpty.style.display = 'block';
            searchResultsLoading.style.display = 'none';
            searchResultsNotFound.style.display = 'none';
            searchClearBtn.style.display = 'none';
        });
    }

    // Закрытие модального окна
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal();
        });
    });

    // Закрытие по клику на бэкдроп
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Закрытие по нажатию Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Поиск пользователей
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            currentSearchQuery = query;

            if (query.length === 0) {
                clearSearchResults();
                searchClearBtn.style.display = 'none';
                return;
            }

            searchClearBtn.style.display = 'flex';

            // Очищаем предыдущий таймаут
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Показываем индикатор загрузки
            searchResultsEmpty.style.display = 'none';
            searchResultsNotFound.style.display = 'none';
            searchResultsList.innerHTML = '';
            searchResultsLoading.style.display = 'flex';

            // Запускаем поиск с задержкой
            searchTimeout = setTimeout(() => {
                if (currentSearchQuery === query) {
                    searchUsers(query);
                }
            }, 300);
        });
    }

    // Очистка поиска
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearSearchResults();
            searchClearBtn.style.display = 'none';
            searchInput.focus();
        });
    }

    // Поиск пользователей
    async function searchUsers(query) {
        try {
            const response = await fetch(`/search/users/?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();

            if (data.success) {
                displaySearchResults(data.users);
            } else {
                showError('Ошибка поиска пользователей');
            }
        } catch (error) {
            console.error('Error searching users:', error);
            showError('Произошла ошибка при поиске');
        }
    }

    // Отображение результатов поиска
    function displaySearchResults(users) {
        searchResultsLoading.style.display = 'none';

        if (users.length === 0) {
            searchResultsNotFound.style.display = 'block';
            searchResultsList.innerHTML = '';
            return;
        }

        searchResultsNotFound.style.display = 'none';
        searchResultsList.innerHTML = '';

        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.dataset.userId = user.id;
            userCard.innerHTML = `
                <div class="user-card__avatar">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
                <div class="user-card__info">
                    <h4 class="user-card__name">${escapeHtml(user.full_name || user.username)}</h4>
                    <p class="user-card__username">@${escapeHtml(user.username)}</p>
                </div>
            `;

            userCard.addEventListener('click', function() {
                createChatWithUser(user.id);
            });

            searchResultsList.appendChild(userCard);
        });
    }

    // Создание чата с пользователем
    async function createChatWithUser(recipientId) {
        try {
            const formData = new FormData();
            formData.append('recipient_id', recipientId);
            formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

            const response = await fetch('/chats/create/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Закрываем модальное окно
                closeModal();

                // Перенаправляем на страницу чата
                window.location.href = data.redirect_url;
            } else {
                alert('Ошибка создания чата: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            alert('Произошла ошибка при создании чата');
        }
    }

    // Закрытие модального окна
    function closeModal() {
        modal.classList.remove('active');

        // Очищаем поиск
        if (searchInput) {
            searchInput.value = '';
            clearSearchResults();
            searchClearBtn.style.display = 'none';
        }

        // Очищаем таймаут
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    }

    // Очистка результатов поиска
    function clearSearchResults() {
        searchResultsEmpty.style.display = 'block';
        searchResultsLoading.style.display = 'none';
        searchResultsNotFound.style.display = 'none';
        searchResultsList.innerHTML = '';
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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showError(message) {
        searchResultsLoading.style.display = 'none';
        searchResultsNotFound.textContent = message;
        searchResultsNotFound.style.display = 'block';
        searchResultsList.innerHTML = '';
    }
});