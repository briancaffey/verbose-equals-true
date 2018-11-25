from .models import Post
from .serializers import (
    PostSerializer,
)

from backend.celery_app import debug_task

from rest_framework import filters
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class PostList(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = (
        filters.OrderingFilter,
    )
    ordering_fields = '__all__'


class PostDetail(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


@api_view()
@authentication_classes([])
@permission_classes([])
def celery_test_view(request):
    debug_task.delay()
    return Response({"message": "Your task is being processed!"})
