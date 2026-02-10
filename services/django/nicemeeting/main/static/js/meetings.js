document.addEventListener('DOMContentLoaded', function() {
    updateAllCountdowns();
    setInterval(updateAllCountdowns, 60000); // Обновляем каждую минуту
});

function updateAllCountdowns() {
    const countdownElements = document.querySelectorAll('.meetings__countdown');

    countdownElements.forEach(element => {
        const datetimeStr = element.getAttribute('data-datetime');
        if (!datetimeStr) return;

        const meetingTime = new Date(datetimeStr);
        const now = new Date();
        const diffMs = meetingTime - now;

        const valueElement = element.querySelector('.meetings__countdown-value');
        if (!valueElement) return;

        if (diffMs <= 0) {
            valueElement.textContent = 'Началось';
            valueElement.style.color = '#4CAF50';
            return;
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let countdownText = '';

        if (diffDays > 0) {
            countdownText = `${diffDays} дн. ${diffHours} ч.`;
        } else if (diffHours > 0) {
            countdownText = `${diffHours} ч. ${diffMinutes} мин.`;
        } else {
            countdownText = `${diffMinutes} мин.`;
        }

        valueElement.textContent = countdownText;

        // Меняем цвет в зависимости от времени до встречи
        if (diffHours < 24 && diffDays === 0) {
            valueElement.style.color = '#ff9800';
        }
        if (diffHours < 2 && diffDays === 0) {
            valueElement.style.color = '#f44336';
        }
    });
}