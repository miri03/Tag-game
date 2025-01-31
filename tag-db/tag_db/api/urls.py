from django.urls import path

from .views import get_history, add_Score, delete_history, update_winner, getUserHistory

urlpatterns = [
    path('matchHistory/', get_history, name='get_history'),
    path('addScore/', add_Score, name='add_Score'),
    path('delete_history/', delete_history, name='delete_history'),
    path('update_winner/', update_winner, name='update_winner'),
    path('getUserHistory/', getUserHistory, name='getUserHistory')
]
