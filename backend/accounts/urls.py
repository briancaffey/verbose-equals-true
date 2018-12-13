from django.urls import re_path, path
from rest_framework_jwt.views import (
    obtain_jwt_token,
    refresh_jwt_token,
    verify_jwt_token,
)

from . import views


urlpatterns = [
    re_path(
        r'^auth/obtain_token/',
        obtain_jwt_token,
        name='api-jwt-auth'
    ),
    re_path(
        r'^auth/refresh_token/',
        refresh_jwt_token,
        name='api-jwt-refresh'
    ),
    re_path(
        r'^auth/verify_token/',
        verify_jwt_token,
        name='api-jwt-verify'
    ),
    path(
        'account/',
        views.AccountViewSet.as_view(),
        name='current-user'
    )
]
