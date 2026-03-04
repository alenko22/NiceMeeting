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
})();