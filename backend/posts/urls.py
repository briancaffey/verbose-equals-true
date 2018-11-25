from . import views
from django.urls import path
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'posts', views.PostViewSet)

# the router will match this /posts first
# TODO: combine ViewSet with customized list view
urlpatterns = [
    path('posts/', views.PostList.as_view(), name='posts'),
]
# registers list, create, retrieve, update, partial_update
# and destroy
# https://www.django-rest-framework.org/api-guide/routers/#simplerouter
urlpatterns += router.urls
