from posts.models import Post
from django.core.management.base import BaseCommand

import factory


class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Post
    title = factory.Faker('name')
    content = factory.Faker('bs')


class Command(BaseCommand):
    help = 'Creates dummy Posts to seed the database'

    def handle(self, *args, **options):
        posts = Post.objects.all()
        if not posts:
            for i in range(1000):
                post = PostFactory()
                post.save()
            print("Created posts")
        else:
            print("Not creating posts")
