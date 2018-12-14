from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'pk',
            'is_staff',
            'is_superuser',
            'is_active'
        )
