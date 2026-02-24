from django.db.models import Avg, Q
from main.models import User, Rating
import datetime


def get_recommendations(user):
    """Получение рекомендаций для пользователя"""

    # Определяем целевой пол (для мужчин - девушки)
    target_sex = 'Женский' if user.sex == 'Мужской' else 'Мужской'

    # Базовый запрос - пользователи противоположного пола
    users = User.objects.filter(sex=target_sex).exclude(id=user.id)

    # Вычисляем возраст пользователя
    today = datetime.date.today()
    user_age = today.year - user.date_birth.year - (
            (today.month, today.day) < (user.date_birth.month, user.date_birth.day)
    ) if user.date_birth else 0

    recommendations = []

    for recommended_user in users:
        score = 0

        if user.interests and recommended_user.interests:
            user_interests = set(user.interests.lower().split(' '))
            rec_interests = set(recommended_user.interests.lower().split(' '))
            common_interests = user_interests.intersection(rec_interests)
            if user_interests:
                score += (len(common_interests) / len(user_interests)) * 20

        if user.date_birth and recommended_user.date_birth:
            rec_age = today.year - recommended_user.date_birth.year - (
                    (today.month, today.day) < (recommended_user.date_birth.month, recommended_user.date_birth.day)
            )
            age_diff = abs(user_age - rec_age)
            if age_diff <= 5:
                score += 20 * (1 - age_diff / 5)

        if user.educational_level and recommended_user.educational_level:
            if user.educational_level == recommended_user.educational_level:
                score += 20

        if user.astral_sign and recommended_user.astral_sign:
            if user.astral_sign == recommended_user.astral_sign:
                score += 20

        avg_rating = Rating.objects.filter(
            rated_user=recommended_user
        ).aggregate(Avg('rating'))['rating__avg'] or 0

        if avg_rating:
            score += min(20, (avg_rating / 5) * 20)

        if score > 0:
            recommendations.append({
                'user': recommended_user,
                'score': score
            })

    # Сортируем по убыванию совместимости
    recommendations.sort(key=lambda x: x['score'], reverse=True)

    # Возвращаем только пользователей (без процентов)
    return [rec['user'] for rec in recommendations[:10]]  # Ограничиваем 10 рекомендациями