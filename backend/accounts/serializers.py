from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class CurrentUserSerializer(serializers.ModelSerializer):

    avatar = serializers.SerializerMethodField()

    def get_avatar(self, obj):
        return obj.profile.avatar.url

    class Meta:
        model = User
        fields = (
            'avatar',
            'username',
            'email',
            'pk',
            'is_staff',
            'is_superuser',
            'is_active'
        )
