// Простейшая логика показа/скрытия меню + переключение состояния "авторизован/не авторизован"
(function () {
    const isAuth = {value: false}; // менять через демо-кнопки
    const notAuth = document.getElementById('notAuth');
    const isAuthBlock = document.getElementById('isAuth');
    const avatarBtn = document.getElementById('avatarBtn');
    const userMenu = document.getElementById('userMenu');
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.querySelector('.main-nav');

    function renderAuth() {
        if (isAuth.value) {
            notAuth.hidden = true;
            isAuthBlock.hidden = false;
        } else {
            notAuth.hidden = false;
            isAuthBlock.hidden = true;
            userMenu.hidden = true;
            avatarBtn && avatarBtn.setAttribute('aria-expanded', 'false');
        }
    }

    // avatar dropdown
    if (avatarBtn) {
        avatarBtn.addEventListener('click', () => {
            const opened = userMenu.hidden;
            userMenu.hidden = !opened;
            avatarBtn.setAttribute('aria-expanded', String(opened));
        });
    }

    // close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!isAuthBlock.contains(e.target) && !userMenu.hidden) {
            userMenu.hidden = true;
            avatarBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // hamburger toggle for mobile nav
    hamburger.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!expanded));
        mainNav.classList.toggle('open');
    });

    // demo buttons
    document.getElementById('simulateLogin').addEventListener('click', () => {
        isAuth.value = true;
        renderAuth();
    });
    document.getElementById('simulateLogout').addEventListener('click', () => {
        isAuth.value = false;
        renderAuth();
    });

    renderAuth();
})();
