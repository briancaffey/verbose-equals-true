# Verbose Equals True

This project will document the development of an application using Docker, Django, NGINX, VueJS and other containerized services. 

Each step of the process will be described in detail with links to relevant documentation and resources used in putting together this application. This project uses official documentation recommendations whenever possible. We will be starting from a fresh installation of `Ubuntu 16.04` and installing everything as we need it.

First you will need to install Docker on your computer. 

## Docker

Follow instructions for installing the community edition of docker on Ubuntu. This can be found [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

After you have installed docker, follow the [post-installation steps for linux](https://docs.docker.com/install/linux/linux-postinstall/). This will prevent us from having to use `sudo` when running docker commands.

You should see `docker` listed in the output of the `groups` command. This means that you have added yourself to the docker group. 

Finally, install `docker-compose` by following the Linux instructions found [here](https://docs.docker.com/compose/install/#install-compose). 

Make sure that docker is correctly configured on your machine by running the following command:

```
docker run hello-world
```

You should see a message saying that Docker is configured correctly.

If you have used docker previously, you may want to remove any old or unused images. Do this with the following commands: 

```bash
docker system prune
docker rmi $(docker images -a -q)
docker rmi $(docker images -f "dangling=true" -q)
docker rm $(docker ps --filter=status=exited --filter=status=created -q)
```

Now we are ready to start developing our application. Let's first create a new project on GitLab where we will push or code. 

Create a new project on GitLab and clone it into a directory where you want the project to live. 

Next, add a `README.md` file to the base directory and commit this file. 

This project will try to adhere to git practices described [here](https://nvie.com/posts/a-successful-git-branching-model/). This article describes a workflow for creating new branches, features and releases. 

Currently we only have a one file (`README.md`) and one branch (`master`). Let's commit our changes to the `README.md` file and then create a new branch with the following commands: 

```
git add .
git commit -m "save readme.md
git checkout -b develop master
```

The last command will create a new branch `develop` from the `master` branch. 

When we crete new branches, we will branch from the `develop` branch. 

Let's follow along with the [official Docker tutorial](https://docs.docker.com/compose/django/) for creating a Django/Postgres application. 

Let's add a `Dockerfile` to the root of our project:

```
 FROM python:3.6
 ENV PYTHONUNBUFFERED 1
 RUN mkdir /code
 WORKDIR /code
 ADD requirements.txt /code/
 RUN pip install -r requirements.txt
 ADD . /code/
```

I'm changing the first line from `python:3` to `python:3.6`, everything else is the same.

This `Dockerfile` will describe the process of settings up a container that will run our Django application. 

Let's look at each line of this file: 

- `FROM python3.6` 

This will use a base image. It means: "We are going to start building an application from a slimmed-down version of Ubuntu that has python 3.6 installed." We won't have to manage python versions on our own computer. (We will actually install python3.6 on our local machine, but we will do so later on.)

- `ENV PYTHONUNBUFFERED 1`

This is an environmental variable we set to format the standard output of python in our container. 

- `RUN mkdir /code`

This will create a new directory called `code` in our docker container at the container's root directory.

- `WORKDIR /code`

This will will set a working directory for our project. It is essentially saying "`cd` into `/code`"

- `ADD requirements.txt /code/`

This will add a copy of a file called `requirements.txt` on our local machine to the `/code/` folder in our container. This is the folder we created with the previous command `RUN mkdir /code`

- `RUN pip install -r requirements.txt`

This will install the requirements listed in `requirements.txt` in our container. Since the Docker container is an isolated environment, we don't need to worry about installing our requirements into a virtual environment. We also don't need to worry about the version of `pip` we will use; this has been handled by our *base image*: `python3.6`. Finally, we know that this command is executed inside the `/code` directory because we set the working directory to be `/code` in the previous `WORKDIR /code` command. 

- `ADD . /code/`

In the final step, we add the code from the directory where the Dockerfile lives to the `/code/` directory inside of the container. When we add the Django project in this directory, it will be added to the container with this command. 

Next, let's create a `requirements.txt` file. Our Dockerfile is expecting this file to exist so it can add it to the container and use it to install the python packages we will use.

**requirements.txt**

```
Django==2.1.3
psycopg2==2.7.5
```

Next, we will add `docker-compose.yml` to our project's root directory. `docker-compose` is a utility that will allow us to create docker containers, docker volumes and docker networks with simple `.yml` files rather than running docker commands for each container/netowrk/volume we want to use. `docker-compose` was not originally intended for use in production, but some people will use it in production. It is no different from running multiple docker commands, or running a scripts that runs several docker command in order. We will talk about deploying to production later on, for now we will only worry about running containers on our local machine. 

Here's `docker-compose.yml`: 

```yml
version: '3'

services:
  db:
    image: postgres
  backend:
    build: .
    command: python3 manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/code
    ports:
      - "8000:8000"
    depends_on:
      - db
```

This `docker-compose.yml` file specifies two services: `db` and `backend` (I renamed `web` to `backend` for clarity as we will add additional services to this file later on. 

Let's look at each line of this file: 

- `version: '3'` specifies the version of `docker-compose` we will be using. 

- `db` starts the definition of a service called `db` that uses the `postgres` base image. This container will run our postgres database in local development. 

- `backend` specifies another service. In docker-compose, a service refers to docker images and the conatiners that can be run from these images. 

- `build: .` specifies that we will be building from a file named `Dockerfile` that is in the same directory as `docker-compose.yml`. 

- `command: python3 manage.py runserver 0.0.0.0:8000` 

This line tells the Docker container to run the command `python3 manage.py runserver 0.0.0.0:8000`. This command can also be executed from inside the `Dockerfile` used to build the `backend` service. Instead of writing the command here, we can also include an executable script that will run a series of commands. We will do this soon. 

```yml
volumes:
  - .:/code
```

This will mount our current working directory in the container's `/code` file as a volume. This means that the host machine will share a folder with the container. Also, any changes we make to the volume on our computer (the host machine) will be made inside of the container. For example, when we change and update a file in our Django application (that we will create in the next in just a few steps), will be watched by the `runserver` command and will restart the development server. This will be useful as it will allow us to develop our app while it runs in our container. We won't have to restart the container each time we make a change to our code.

```yml
ports:
    - "8000:8000"
```

This section will map traffic to host (your computer) on port 8000 to the container's internal 8000 port. This means that if we visit `localhost:8000` on our machine while the container is running, we will be able to connect to the server that is running on `0.0.0.0:8000` inside of the container. I'll cover the differences between `localhost`, `0.0.0.0` and `127.0.0.1` later on in this tutorial. 

```yml
depends_on:
    - db
```

This section tells `docker-compose` that the `backend` service must be started only after the `db` service is started. This section only changes the order in which containers are started. 

`depends_on` will be important as we add lots of interconnected containers to our application. 

Next, we need to create our Django project. To do this, let's follow along with the official tutorial:

```
sudo docker-compose run backend django-admin.py startproject backend .
```

This will run a Django command that will create our project. I have changed the names slightly from the ones used in the tutorial for simplicity. We are using `docker-compose` to `run` a command using our `backend` service. We will use `django-admin.py`'s `starproject` command to create a project called `backend` that will live in the current directory. 

Let's see the files that this command created:

```
ls -al
total 44
drwxrwxr-x 4 brian brian 4096 Oct 27 12:48 .
drwxrwxr-x 5 brian brian 4096 Oct 27 10:32 ..
drwxr-xr-x 2 root  root  4096 Oct 27 12:48 backend
-rw-rw-r-- 1 brian brian  214 Oct 27 12:43 docker-compose.yml
-rw-rw-r-- 1 brian brian  153 Oct 27 11:25 Dockerfile
drwxrwxr-x 8 brian brian 4096 Oct 27 13:06 .git
-rwxr-xr-x 1 root  root   539 Oct 27 12:48 manage.py
-rw-rw-r-- 1 brian brian 9342 Oct 27 13:06 README.md
-rw-rw-r-- 1 brian brian   25 Oct 27 12:47 requirements.txt
```

There are two issues we have to deal with. First, the files that we created are owned by `root` user. This is because docker does things as the root user.

First, let's change the permissions for these files as the tutorial instructs:

```
sudo chown -R $USER:$USER .
```

This commands changes all file in the current directory to be owned by the current user and also changes the group of the files in the current directory to be owned by the current user's group. 

The `-R` flag makes the change in ownership recursively for all folders and files in the current directory. 

```
ls -al
total 44
drwxrwxr-x 4 brian brian 4096 Oct 27 12:48 .
drwxrwxr-x 5 brian brian 4096 Oct 27 10:32 ..
drwxr-xr-x 2 root  root  4096 Oct 27 12:48 backend
-rw-rw-r-- 1 brian brian  214 Oct 27 12:43 docker-compose.yml
-rw-rw-r-- 1 brian brian  153 Oct 27 11:25 Dockerfile
drwxrwxr-x 8 brian brian 4096 Oct 27 13:06 .git
-rwxr-xr-x 1 root  root   539 Oct 27 12:48 manage.py
-rw-rw-r-- 1 brian brian 9342 Oct 27 13:06 README.md
-rw-rw-r-- 1 brian brian   25 Oct 27 12:47 requirements.txt
sudo chown -R $USER:$USER .
[sudo] password for brian:
ls -al
total 44
drwxrwxr-x 4 brian brian  4096 Oct 27 12:48 .
drwxrwxr-x 5 brian brian  4096 Oct 27 10:32 ..
drwxr-xr-x 2 brian brian  4096 Oct 27 12:48 backend
-rw-rw-r-- 1 brian brian   214 Oct 27 12:43 docker-compose.yml
-rw-rw-r-- 1 brian brian   153 Oct 27 11:25 Dockerfile
drwxrwxr-x 8 brian brian  4096 Oct 27 13:14 .git
-rwxr-xr-x 1 brian brian   539 Oct 27 12:48 manage.py
-rw-rw-r-- 1 brian brian 10777 Oct 27 13:14 README.md
-rw-rw-r-- 1 brian brian    25 Oct 27 12:47 requirements.txt
```

The second issue is that we have the files for our Django project mixed in with the docker-compose file that will be used to control many different services that could have their own separate code bases. For this reason, let's take all of the files related to our `backend` service and add them to a folder called `backend` that will live in project's top-level directory. 

```
mkdir back && mv Dockerfile manage.py requirements.txtbackend/ back
mv back backend
```

These two commands make a new directory called `back`, moves all relevant folders and files from the current working directory into that folder, and then renames this folder `backend`. It is OK to have a Django project where the settings folder shares a name name of the root folder of the project. If this confuses you, you are free to use different names. I think it will be simple to use `backend` for the service name, the root folder of the Django project and also the settings folder inside of our project. 

For clarity, our project should now have the following structure: 

```
ls -al
total 36
drwxrwxr-x 4 brian brian  4096 Oct 27 13:18 .
drwxrwxr-x 5 brian brian  4096 Oct 27 10:32 ..
drwxrwxr-x 3 brian brian  4096 Oct 27 13:18 backend
-rw-rw-r-- 1 brian brian   214 Oct 27 12:43 docker-compose.yml
drwxrwxr-x 8 brian brian  4096 Oct 27 13:22 .git
-rw-rw-r-- 1 brian brian 12441 Oct 27 13:22 README.md
```

You might want to install the command line program `tree` to get a quick overview of the project structure: 

```
sudo apt-get install tree
tree
.
├── backend
│   ├── backend
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── docker-compose.yml
└── README.md

2 directories, 9 files
```

Let's finish up this section by doing two more things before we commit our changes. 

First, we need to change the settings in our Django project to connect our Django application to the postgres database in the `db` container. 

Replace the `DATABASES` settings variable with the following: 

**backend/backend/settings.py**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': 'db',
        'PORT': 5432,
    }
}
```

Next, let's replace the `command` part of the `backend` service. When this service starts, we will want to do more than simply `runserver`. We want to collect static files, make migrations, run migrations and finally run the development server. To do all of these things, we will include run a script that will do all of these things. 

The script should live in a file called `scripts` that lives in the `backend` folder in the root directory of our project. 

Let's create a script called `start.sh`:

**start.sh**

```bash
#!/bin/bash

cd backend
python3 manage.py collectstatic --no-input
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000
```

Now we need to give this file executable permissions: 

```
sudo chmod +x backend/scripts/start.sh
```

Next, we need to change a few things in our `docker-compose.yml` file. 

Since we put the `Dockerfile` for the backend service in a folder called `backend`, we need to specify this in our `docker-compose.yml` file: 

```yml
version: '3'

services:
  db:
    image: postgres
  backend:
    build: ./backend
    command: /start.sh
    volumes:
      - .:/code
    ports:
      - "8000:8000"
    depends_on:
      - db
```

Also, we need to add the script to the container in the `Dockerfile`, so let's change the `Dockerfile` as well:

**backend/Dockerfile**

```
FROM python:3.6
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
COPY scripts/start.sh /
ADD . /code/
```

We are almost ready to start our containers with `docker-compose`. Let's make one more small change to `docker-compose.yml` by adding `container_name`. This is for convenience, you'll see why soon. 

**docker-compose.yml**

```yml
version: '3'

services:
  db:
    container_name: db
    image: postgres
  backend:
    container_name: backend
    build: ./backend
    command: /start.sh
    volumes:
      - .:/code
    ports:
      - "8000:8000"
    depends_on:
      - db
```

Now let's run the command to start our containers:

```
docker-compose up --build
```

You might see the following error: 

```
django.core.exceptions.ImproperlyConfigured: You're using the staticfiles app without having set the STATIC_ROOT setting to a filesystem path.
```

And you should see that `makemigrations` and `migrate` were ran before the `runserver` command started the development server. 

Also, you should see:

> The install worked successfully! Congratulations!
> You are seeing this page because DEBUG=True is in your settings file and you have not configured any URLs.

Let's add `STATIC_ROOT` to the end of `backend/backend/settings.py`:

```python
STATIC_ROOT = 'static'
```

Django will create the `static` file in the same directory where `manage.py` lives. We can also create this folder ourselves. Let's do this and put a `.gitignore` file in the `static` folder so that we don't track any of the static files that Django's `collectstatic` command will create. 

**backend/static/.gitignore**

```
*
!.gitignore
```

Now we can restart the container to see if it collects static files. Press `ctrl+c` in the terminal where you ran `docker-compose`, and then run the command again:

```
docker-compose up --build
```

We should see `admin` in the `static` file. These are the static files needed for Django's built-in admin. 

Let's write a simple test to make sure that our backend is working. 

**backend/backend/tests.py**

```python
from django.contrib.auth.models import User
from django.test import TestCase

class TestDatabase(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='user',
            email='user@foo.com',
            password='pass'
        )
        user.save()
        user_count = Users.objects.all().count()
        self.assertEqual(user_count, 1)
```

To run this test, we have a few options. We could run:

```
docker-compose run backend python3 backend/manage.py test backend
```

Or you could use `docker exec` to execute a command in a named container using the following:

```
docker exec -i backend python3 backend/manage.py test backend
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.089s

OK
Destroying test database for alias 'default'...
```

Or we could shell into the `backend` container while the `backend` and `db` containers are both running and run `./manage.py test backend` directly in the container. 

`docker-compose run` is probably the easiest to use.

Before we commit our changes, let's add `.gitignore` to the top-level backend folder:

**.gitignore**

```
__pycache__
```

This will keep Python byte code out of our source code. 

We have now changed several files. Let's commit these changes: 

```
git add .
git checkout -b feature-django
git commit -m "added django project that works with docker-compose"
```

Let's stay on the `feature-django` feature branch and some additional components to the Django portion of our site. First, let's ensure that we are writing well-formatted code by using linting. 

Let's add `flake8` to our `requirements.txt` file. This package will be used to do our code linting. 

You can read more about `flake8` [here](https://gitlab.com/pycqa/flake8). 

We also want to create a virtual environment on our local machine so that VSCode can do linting while we work in VSCode. 

We can add this with `virtualenv`: 

```
$ virtualenv -p python3.6 .env
```

Let's also add a `.gitignore` to keep the `.env` folder out of source control: 

**.gitignore**

```
.env
```

Now let's activate the virtual environment in our VSCode terminal: 

```
source .env/bin/activate
pip install -r backend/requirements.txt
```

Now let's run `flake8`:

```
$ flake8 backend/
backend/backend/tests.py:4:1: E302 expected 2 blank lines, found 1
backend/backend/settings.py:92:80: E501 line too long (91 > 79 characters)
backend/backend/settings.py:95:80: E501 line too long (81 > 79 characters)
backend/backend/settings.py:98:80: E501 line too long (82 > 79 characters)
backend/backend/settings.py:101:80: E501 line too long (83 > 79 characters)
```

Let's add a new line in `backend/backend/tests.py` and also add `# noqa` to the end of the long lines in settings so `flake8` will ignore these lines. 

Let's run `flake8 backend` in our local machine and we should see no errors. To confirm this, run:

```
echo $?
```

This will return the exit code of the last command. If you see `0`, then `flake8` found no errors. If you remove a `# noqa` from the end of one of the long lines, then you will see the linting error printed out, and you will see that the result of `$?` is `1`. 

Now that we have basic testing and linting, we should add code coverage. Django has official recommendations for how to use `coverage.py` with Django projects [here](https://docs.djangoproject.com/en/2.1/topics/testing/advanced/). 

Add `coverage` to `requirements.txt`, and restart `docker-compose`:

We can't run this command locally because it depends on running tests which requires our database.

Now, let's shell into the `backend` container: 

```
docker exec -it backend /bin/bash
```

```
root@3246d185a19c:/code# cd backend
root@3246d185a19c:/code/backend# coverage run --source='.' manage.py test backend
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.081s

OK
Destroying test database for alias 'default'...
root@3246d185a19c:/code/backend# coverage report
Name                  Stmts   Miss  Cover
-----------------------------------------
backend/__init__.py       0      0   100%
backend/settings.py      19      0   100%
backend/tests.py          8      0   100%
backend/urls.py           3      0   100%
backend/wsgi.py           4      4     0%
manage.py                 9      2    78%
-----------------------------------------
TOTAL                    43      6    86%
root@3246d185a19c:/code/backend#
```

Let's ignore `backend/wsgi.py` and `manage.py` by adding these to a new file that will live in the root of our Django application:

**.coveragerc**

```
[run]
omit =
    backend/wsgi.py
    manage.py
```

Now we see the following results: 

```
root@3246d185a19c:/code/backend# coverage run --source='.' manage.py test backend
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.083s

OK
Destroying test database for alias 'default'...
root@3246d185a19c:/code/backend# coverage report
Name                  Stmts   Miss  Cover
-----------------------------------------
backend/__init__.py       0      0   100%
backend/settings.py      19      0   100%
backend/tests.py          8      0   100%
backend/urls.py           3      0   100%
-----------------------------------------
TOTAL                    30      0   100%
root@3246d185a19c:/code/backend#
```

Now that we have linting, testing and code coverage, we should add continuous integration to our project. Since we are using GitLab, using continuous integration is as simple as adding one file to the root of our project that is called `gitlab-ci.yml`:

```yml
# Official framework image. Look for the different tagged releases at:
# https://hub.docker.com/r/library/python
image: python:3.6

stages:
  - test

# Pick zero or more services to be used on all builds.
# Only needed when using a docker container to run your tests in.
# Check out: http://docs.gitlab.com/ce/ci/docker/using_docker_images.html#what-is-a-service
services:
  - postgres:latest

variables:
  POSTGRES_DB: postgres

# This folder is cached between builds
# http://docs.gitlab.com/ce/ci/yaml/README.html#cache
cache:
  paths:
  - ~/.cache/pip/

before_script:
  - pip install -r backend/requirements.txt

runtest:
  stage: test
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/$POSTGRES_DB"
  script:
  - python3 backend/manage.py test --settings backend.settings-gitlab-ci
  - flake8 backend
  - cd backend
  - coverage run --source='.' manage.py test backend --settings backend.settings-gitlab-ci
  - coverage report

coverage:
  stage: test
  script:
    - cd backend
    - coverage run --source='.' manage.py test backend --settings backend.settings-gitlab-ci
    - coverage report -m
  coverage: '/TOTAL.+ ([0-9]{1,3}%)/'
```

Notice that this file references `backend.settings-gitlab-ci`. We need to create this file so that we can use special settings in our project that we want to use only for running our tests. 

Next to `backend/backend/settings.py`, let's create `settings-gitlab-ci.py`:

```python
from .settings import * # noqa

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ci',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'postgres',
        'PORT': '5432',
    },
}
```

Now let's commit our changes and push our code to GitLab: 

```
git add .
git commit -m "added testing, linting, coverage and CI"
git push -u origin feature-django
```

Now let's commit our code and merge these changes into the master branch. 

To do this, let's first merge the feature branch into develop, and then create a release branch from the develop branch, and then merge this branch into the master branch:

```
git checkout develop
git merge feature-django
git checkout -b release-0.0.1
git checkout master
git merge release-0.0.1 --no-ff
git tag -a 0.0.1
git push --all
```

## Django ReST Framework

At this point, we are going to add some additional packages to Django that will allow us to build a powerful API. The [Django ReST Framework](https://www.django-rest-framework.org/) will be responsible for serializing and deserializing our Django models instances to and from JSON. It has many powerful features that make it the most popular package for building APIs with Django. 

In addition to the Django ReST Framework, we will install another package for using JSON Web Tokens for authentication and permission control. This package is called [`djangorestframework_jwt`](https://github.com/GetBlimp/django-rest-framework-jwt) and it is maintained by a company called [Blimp](https://github.com/GetBlimp). 

Before we start, let's go back to the `feature-django` branch to continue our work with the backend Django service:

```
git checkout feature-django
```

First let's add these packages to `requirements.txt`:

```python
djangorestframework
django-filter
djangorestframework-jwt
```

Next, we will need to add the following to `INSTALLED_APPS`:

```python

    'rest_framework',

```

Then we can add the following to `settings.py` after `DATABASES`:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}
```

We have a little bit more work to do on the backend. Once we build out an authentication system and a basic model like "Blog Posts", we will be ready to set up a front end that will get and post data to our backend Django API. Then we will tie the backend and the frontend together with a powerful webserver and reverse proxy: NGINX.

First, we need a new Django app to organize our project's users. Let's create a new app called `accounts`. We will need to issue a `startapp` command to the `backend` container, change permissions on those files, and then add the name of the app to `INSTALLED_APPS` so our project becomes aware of it. We will also need to create API endpoints. Let's do this all step-by-step.

First, let's make the app:

```
docker exec -it backend python3 backend/manage.py startapp accounts
```

Set permissions on the files in the `accounts` app: 

```
sudo chown -R $USER:$USER .
```

Now let's hook up our `accounts` app to the rest of our Django project. Add `'accounts'` to `INSTALLED_APPS` and add the following to the `urls.py` file in `backend`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('accounts.urls')),
    path('admin/', admin.site.urls),
]
```

Add `urls.py` to `accounts` and add the following: 

Now, to the `urls.py` file in the `accounts` app, add the following: 

```python
from django.urls import re_path
from rest_framework_jwt.views import (
    obtain_jwt_token,
    refresh_jwt_token,
    verify_jwt_token,
)

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
]
```

The first route will return a JSON response containing a special token when we send a POST request with the correct `username` and `password`. Actually, `djangorestframework_jwt` supports `AbstractBaseUser`, so we should be able to authenticate with any combination of credentials, but we will only be looking at the standard user model for now. 

Let's write a test to see how this works in action. In `accounts/tests.py`, add the following:

```python
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


from django.contrib.auth.models import User

class AccountsTests(APITestCase):

    def test_obtain_jwt(self):

        # create an inactive user
        url = reverse('api-jwt-auth')
        u = User.objects.create_user(username='user', email='user@foo.com', password='pass')
        u.is_active = False
        u.save()

        # authenticate with username and password
        resp = self.client.post(url, {'email':'user@foo.com', 'password':'pass'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        
        # set the user to activate and attempt to get a token from login
        u.is_active = True
        u.save()
        resp = self.client.post(url, {'username':'user', 'password':'pass'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in resp.data)
        token = resp.data['token']

        # print the token
        print(token)
```

We can run this test like this: 

```
docker exec -it backend python3 backend/manage.py test accounts
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InVzZXIiLCJleHAiOjE1NDA2ODg4MjMsImVtYWlsIjoidXNlckBmb28uY29tIn0.9nXmNoF0dX-N5yh33AXX6swT5zDchosNI0-bcsdSUEk
.
----------------------------------------------------------------------
Ran 1 test in 0.173s

OK
Destroying test database for alias 'default'...
```

Our test passes, and we can see the JWT printed out at the end of the test. Here's a JWT, decoded:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNTM4MzMwNTk5LCJlbWFpbCI6IiJ9.rIHFjBmbqBHnqKwCNlHenImMtQSmzFkbGLA8pddQ6AY
```

Decoded, this JWT contains the following information: 

```json
{"typ":"JWT","alg":"HS256"}{"user_id":2,"username":"admin","exp":1538330599,"email":""}Ō稬6QޜY<P
```

The first part of JSON identifies the type of token and the hashing algorithm used. The second part is a JSON representation of the authenticated user, with additional information about when the token expires. The third part is a signature that uses the `SECRET_KEY` of our Django application for security.

We can also try this enpoint in the Django ReST Framework's browseable API by going to `http://0.0.0.0:8000/auth/obtain_token/`. You will see this:

```
HTTP 405 Method Not Allowed
Allow: POST, OPTIONS
Content-Type: application/json
Vary: Accept

{
    "detail": "Method \"GET\" not allowed."
}
```

This makes sense, because this endpoint only accepts POST requests. From the browseable API, we can make a POST request using our superuser account. Below this message, you will see a form that allows us to enter a username and password. 

Let's create a superuser and do a quick check that this is working inside of the browsable API: 

```
docker exec -it backend python3 backend/manage.py createsuperuser
Username (leave blank to use 'root'): admin
Email address:
Password:
Password (again):
Superuser created successfully.
```

Entering our username and password for the user we created in the browsable API login form, we can see that a token is return in the respsonse body.

Let's remove `tests.py` from `backend/backend`. This test is no longer needed since the `accounts` tests test similar functionality. Also, let's edit the `gitlab-ci.yml` file to just run `./manage.py test accounts`:

```yml
runtest:
  stage: test
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/$POSTGRES_DB"
  script:
  - python3 backend/manage.py test --settings backend.settings-gitlab-ci
  - flake8 backend
  - cd backend
  - coverage run --source='.' manage.py test accounts --settings backend.settings-gitlab-ci
  - coverage report

coverage:
  stage: test
  script:
    - cd backend
    - coverage run --source='.' manage.py test accounts --settings backend.settings-gitlab-ci
    - coverage report -m
  coverage: '/TOTAL.+ ([0-9]{1,3}%)/'
```

Let's also tweak our `.coveragerc` file:

```ini
[run]
omit =
    backend/*
    accounts/apps.py
    manage.py
```

Let's pause here and commit our work.

```
flake8 backend
docker-compose run backend 
git add .
git commit -m "added drf, jwt and authentication tests"
git push
```

