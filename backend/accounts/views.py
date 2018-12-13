# from django.shortcuts import render

# Create your views here.
from django.contrib.auth import get_user_model
from .serializers import CurrentUserSerializer
from .permissions import UserAccountViewPermission
from rest_framework.views import APIView
from rest_framework.response import Response

User = get_user_model()


class AccountViewSet(APIView):
    queryset = User.objects.all()
    permission_classes = (UserAccountViewPermission,)

    def get(self, request, format=None):
        user = request.user

        serializer = CurrentUserSerializer(
            user, many=False
        )

        return Response(serializer.data)
