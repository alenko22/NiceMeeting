(function () {
    const isAuthBlock = document.getElementById('isAuth');
    const avatarBtn = document.getElementById('avatarBtn');
    const userMenu = document.getElementById('userMenu');
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.querySelector('.main-nav');

    // Avatar dropdown
    if (avatarBtn && userMenu) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const opened = !userMenu.hidden;
            userMenu.hidden = opened;
            avatarBtn.setAttribute('aria-expanded', String(!opened));
        });
    }

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (isAuthBlock && userMenu && !isAuthBlock.contains(e.target) && !userMenu.hidden) {
            userMenu.hidden = true;
            if (avatarBtn) {
                avatarBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Hamburger toggle for mobile nav
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!expanded));
            mainNav.classList.toggle('open');
        });
    }

    // Close mobile nav when clicking on a link
    if (mainNav) {
        mainNav.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                mainNav.classList.remove('open');
                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // Close menus on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (userMenu && !userMenu.hidden) {
                userMenu.hidden = true;
                if (avatarBtn) {
                    avatarBtn.setAttribute('aria-expanded', 'false');
                }
            }
            if (mainNav && mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    }
    // ========== PUSH-УВЕДОМЛЕНИЯ ==========
    (function () {
        // Получаем VAPID-ключ из глобальной переменной
        const vapidPublicKey = window.vapidPublicKey;

        // Функция преобразования base64 в Uint8Array (для VAPID)
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        // Получение CSRF-токена из куки
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

        // Функция подписки на push
        async function subscribeToPush() {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.log('Push не поддерживается');
                return false;
            }

            try {
                const registration = await navigator.serviceWorker.ready;
                let subscription = await registration.pushManager.getSubscription();

                if (!subscription && vapidPublicKey) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                    });

                    // Отправляем подписку на сервер
                    const response = await fetch('/api/push/subscribe/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCSRFToken()
                        },
                        body: JSON.stringify(subscription)
                    });

                    if (!response.ok) {
                        throw new Error('Не удалось сохранить подписку');
                    }
                    console.log('Push подписка сохранена');
                } else if (subscription) {
                    console.log('Уже подписаны');
                }
                return true;
            } catch (error) {
                console.error('Ошибка подписки на push:', error);
                return false;
            }
        }

        // Инициализация: запрос разрешения, если включены push-уведомления
        if (window.userSettings && window.userSettings.push_notifications) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        subscribeToPush();
                    }
                });
            } else if (Notification.permission === 'granted') {
                subscribeToPush();
            }
        }
    })();
})();