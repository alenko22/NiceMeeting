document.addEventListener('DOMContentLoaded', function() {
    const agreementCheckbox = document.getElementById('agreementCheckbox');
    const completeProfileBtn = document.getElementById('completeProfileBtn');
    const startSurveyBtn = document.getElementById('startSurveyBtn');

    // Обновление состояния кнопок
    function updateButtonsState() {
        const isAgreed = agreementCheckbox.checked;

        startSurveyBtn.disabled = !isAgreed;

        completeProfileBtn.disabled = !isAgreed;
    }

    // Обработчик изменения чекбокса
    agreementCheckbox.addEventListener('change', updateButtonsState);

    // Инициализация состояния кнопок
    updateButtonsState();
});