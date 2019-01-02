from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
import os


class Command(BaseCommand):
    help = 'Creates a default superuser for local development'

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.all():
            print("Creating default user")
            User.objects.create_superuser(
                'admin',
                'admin@company.com',
                os.getenv('ADMIN_PASSWORD', 'adminpwd123'),
            )
            print(
                """
                Default user created:
                username: 'admin'
                email: 'admin@company.com'
                password: 'password'
                """)
        else:
            print("Not creating default user")
