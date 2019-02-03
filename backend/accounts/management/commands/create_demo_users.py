from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.core.files import File
from django.db.utils import IntegrityError
import os


class Command(BaseCommand):
    help = 'Creates demo users'

    def handle(self, *args, **options):

        User = get_user_model()

        demo_users = [
            {
                "username": "andy",
                "avatar": "demo1.png",
                "email": "andy@company.com",
                "is_staff": False,
                "is_active": True,
            },
            {
                "username": "brian",
                "avatar": "demo2.png",
                "email": "brian@company.com",
                "is_staff": False,
                "is_active": True,
            },
            {
                "username": "katie",
                "avatar": "demo3.png",
                "email": "katie@company.com",
                "is_staff": False,
                "is_active": True,
            },
            {
                "username": "nancy",
                "avatar": "demo4.png",
                "email": "nancy@company.com",
                "is_staff": False,
                "is_active": True,
            }
        ]

        for user in demo_users:
            try:
                u = User.objects.create_user(
                    user['username'],
                    user['email'],
                    os.getenv('VUE_APP_DEMO_PASSWORD', 'demopwd123'),
                    is_staff=user['is_staff'],
                )

                avatar = open(
                    os.path.abspath(os.path.join(
                        os.path.dirname(__file__),
                        '..',
                        'img',
                        user['avatar']
                    )), "rb")

                django_file = File(avatar)

                u.profile.avatar.save(
                    user['avatar'], django_file, save=True
                )

                u.save()
                print(f"Created demo user {user['username']}")

            except IntegrityError:
                print(f"Demo user {user['username']} already exists")
