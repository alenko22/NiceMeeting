document.addEventListener('DOMContentLoaded', function() {
    // ========== СЛАЙДЕР ==========
    const slider = {
        container: document.querySelector('.slider__container'),
        track: document.querySelector('.slider__track'),
        slides: document.querySelectorAll('.slider__slide'),
        prevBtn: document.querySelector('.slider__btn-prev'),
        nextBtn: document.querySelector('.slider__btn-next'),
        dots: document.querySelectorAll('.slider__dot'),
        currentIndex: 0,
        slideCount: 0,
        slideWidth: 0,
        autoPlayInterval: null,
        autoPlayDelay: 5000
    };

    function initSlider() {
        if (!slider.container) return;

        slider.slideCount = slider.slides.length;

        // Установка ширины трека
        updateSliderWidth();

        // Обработчики кнопок
        if (slider.prevBtn) {
            slider.prevBtn.addEventListener('click', () => goToSlide(slider.currentIndex - 1));
        }
        if (slider.nextBtn) {
            slider.nextBtn.addEventListener('click', () => goToSlide(slider.currentIndex + 1));
        }

        // Обработчики точек
        slider.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Автопрокрутка
        startAutoPlay();

        // Остановка автопрокрутки при наведении
        slider.container.addEventListener('mouseenter', stopAutoPlay);
        slider.container.addEventListener('mouseleave', startAutoPlay);

        // Адаптивность
        window.addEventListener('resize', updateSliderWidth);
    }

    function updateSliderWidth() {
        if (!slider.container) return;

        slider.slideWidth = slider.container.clientWidth;
        slider.track.style.width = `${slider.slideWidth * slider.slideCount}px`;

        slider.slides.forEach(slide => {
            slide.style.width = `${slider.slideWidth}px`;
        });

        updateSlidePosition();
    }

    function goToSlide(index) {
        if (index < 0) index = slider.slideCount - 1;
        if (index >= slider.slideCount) index = 0;

        slider.currentIndex = index;
        updateSlidePosition();
        updateDots();
        resetAutoPlay();
    }

    function updateSlidePosition() {
        const offset = -slider.currentIndex * slider.slideWidth;
        slider.track.style.transform = `translateX(${offset}px)`;
    }

    function updateDots() {
        slider.dots.forEach((dot, index) => {
            if (index === slider.currentIndex) {
                dot.classList.add('slider__dot-active');
            } else {
                dot.classList.remove('slider__dot-active');
            }
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        slider.autoPlayInterval = setInterval(() => {
            goToSlide(slider.currentIndex + 1);
        }, slider.autoPlayDelay);
    }

    function stopAutoPlay() {
        if (slider.autoPlayInterval) {
            clearInterval(slider.autoPlayInterval);
            slider.autoPlayInterval = null;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // ========== ВКЛАДКИ ==========
    const tabs = {
        tabs: document.querySelectorAll('.tabs__tab'),
        contents: document.querySelectorAll('.tabs__content'),
        activeClass: 'tabs__tab_active'
    };

    function initTabs() {
        if (tabs.tabs.length === 0) return;

        tabs.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('aria-controls');

                // Скрываем все вкладки
                tabs.contents.forEach(content => {
                    content.hidden = true;
                });

                // Убираем активный класс у всех кнопок
                tabs.tabs.forEach(t => {
                    t.classList.remove(tabs.activeClass);
                    t.setAttribute('aria-selected', 'false');
                });

                // Показываем выбранную вкладку
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.hidden = false;
                }

                // Добавляем активный класс к кнопке
                tab.classList.add(tabs.activeClass);
                tab.setAttribute('aria-selected', 'true');
            });
        });
    }

    // Инициализация компонентов
    initSlider();
    initTabs();
});