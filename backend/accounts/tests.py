from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


from django.contrib.auth.models import User


class TestAccounts(APITestCase):

    def test_obtain_jwt(self):

        # create an inactive user
        url = reverse('api-jwt-auth')
        u = User.objects.create_user(
            username='user',
            email='user@foo.com',
            password='pass'
        )
        u.is_active = False
        u.save()

        # authenticate with username and password
        resp = self.client.post(
            url,
            {'email': 'user@foo.com', 'password': 'pass'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # set the user to active and attempt to get a token from login
        u.is_active = True
        u.save()
        resp = self.client.post(
            url,
            {'username': 'user', 'password': 'pass'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in resp.data)
        token = resp.data['token']

        # print the token
        print(token)
