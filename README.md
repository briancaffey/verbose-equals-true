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

## Sample Model

Now that we have a working user authentication system, let's create a simple "Blog Post" model in a new app called `posts`. I'm going to borrow code from [this Django Rest Framework tutorial](https://wsvincent.com/django-rest-framework-tutorial/). 

Create a `posts` app in our Django project through `docker exec` as we did before:

```
docker exec -it backend python3 backend/manage.py startapp posts
sudo chown -R $USER:$USER .
mv posts/ backend/
```

Next, add `posts` to `INSTALLED_APPS`, and link up the urls in `backend` with: 

**backend/backend/urls.py**

```python
urlpatterns = [
  ...
  path('api/posts/', include('posts.urls')),
]
```

Now we can add the model: 

**backend/posts/models.py**

```python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

Next let's register this app with the Django admin: 

**backend/posts/admin.py**

```python
from django.contrib import admin
from . models import Post

admin.site.register(Post)
```

Then add a serializer for this model by creating `serializers.py` in the `posts` folder: 

**backend/posts/serializers.py**

```python
from rest_framework import serializers
from . import models


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        fields = ('id', 'title', 'content', 'created_at', 'updated_at',)
        model = models.Post

```

We will need to add `urls.py` to `posts` with the following: 

**backend/posts/urls.py**

```python
from django.urls import path

from . import views

urlpatterns = [
    path('', views.PostList.as_view(), name='posts'),
    path('<int:pk>/', views.PostDetail.as_view(), name='post-detail'),
]
```

Finally, we will add two views that we mapped to endpoints in the code above:

**backend/posts/views.py**

```python
from rest_framework import generics

from .models import Post
from .serializers import PostSerializer


class PostList(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class PostDetail(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

Now, let's add some Post objects in the Django admin. Before we do this, we will need to make migrations run the migrations:

```
docker exec -it backend python3 backend/manage.py makemigrations
Migrations for 'posts':
  backend/posts/migrations/0001_initial.py
    - Create model Post
```

And then run migrations:

```
docker exec -it backend python3 backend/manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, posts, sessions
Running migrations:
  Applying posts.0001_initial... OK
```

Now we can add some `Post` objects.

Go back to the browsable api and visit `/api/posts/`. You should see the posts you created in admin. 

Earlier we configured `REST_FRAMEWORK` in `backend/backend/settings.py`. Let's see what happens when we remove session and basic authentication:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        # 'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
    ),
}
```

Now, when we visit `/api/posts/` again, we should see:

```json
HTTP 401 Unauthorized
Allow: GET, HEAD, OPTIONS
Content-Type: application/json
Vary: Accept
WWW-Authenticate: JWT realm="api"

{
    "detail": "Authentication credentials were not provided."
}
```

Let's restore the original settings for `REST_FRAMEWORK` for now:

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

Before we start working on our frontend, let's write some tests to make sure that access to our posts is limited to requests that come with a valid token. 

**posts/tests.py**

```python
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from rest_framework import status

from rest_framework_jwt.settings import api_settings


class TestPosts(TestCase):
    """Post Tests"""

    def test_get_posts(self):
        """
        Unauthenticated users should not be able to access posts via APIListView
        """
        url = reverse('posts')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_header_for_token_verification(self):
        """
        https://stackoverflow.com/questions/47576635/django-rest-framework-jwt-unit-test
        Tests that users can access posts with JWT tokens
        """

        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        user = User.objects.create_user(username='user', email='user@foo.com', password='pass')
        user.is_active = True
        user.save()
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)

        verify_url = reverse('api-jwt-verify')
        credentials = {
            'token': token
        }

        resp = self.client.post(verify_url, credentials, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
```

Let's add a `.flake8` file to `/backend` so that flake8 will ignore migration files:

**backend/.flake8***

```
[flake8]
exclude =
    */migrations/*
```

More information on configuring flake8 can be found [here](http://flake8.pycqa.org/en/3.1.1/user/configuration.html).

Let's commit our changes: 

```
git add .
git commit -m "added posts model, permission tests for post model"
git push
```

Our automated tests are passing. Let's merge these changes into the `develop` branch. We will leave our `backend` service for now and start working on the frontend of our application. 

```
git checkout develop
git merge feature-django
git checkout -b release-0.0.2 develop
git checkout master
git merge release-0.0.2
git tag -a 0.0.2
git push --all --tags
```

## Frontend

Let's create a new feature branch to start work on our frontend:

```
git checkout -b feature-vue develop
```

This will make a new branch called `feature-vue` that will branch off of the `develop` branch.

What we want to do next is add a `frontend` folder to the base of our project that will contain all of our code for the frontend VueJS application. One way to do this is to create a `nodejs` container and use Vue CLI 3, a command line tool for starting VueJS applications. When we create the container, let's mount the `frontend` and run `/bin/sh` so we can run commands at the terminal inside our `nodejs` container. 

Run the following command from the base of our project:

```
mkdir frontend
docker run --rm -it -v ~/gitlab/verbose-equals-true/frontend:/code node:9.11.1-alpine /bin/sh
```

We are now in the nodejs container. From here we can install `vue` and `vue-cli-3` and create our Vue application. Run the following commands inside the container:

```
# cd code
# npm i -g vue @vue/cli
# vue create .
```

Here's the full output:

```
docker run --rm -it -v ~/gitlab/verbose-equals-true/frontend:/code node:9.11.1-alpine /bin/sh
Unable to find image 'node:9.11.1-alpine' locally
9.11.1-alpine: Pulling from library/node
605ce1bd3f31: Pull complete
7cc38010b685: Pull complete
88a635599bc5: Pull complete
Digest: sha256:f8f6c69cce180a9a7c9fa685c86671b1e1f2ea7cc5f9a0dbe99d30cc7a0b6cbe
Status: Downloaded newer image for node:9.11.1-alpine
/ # cd code/
/code # npm i -g vue @vue/cli
/usr/local/bin/vue -> /usr/local/lib/node_modules/@vue/cli/bin/vue.js

> protobufjs@6.8.8 postinstall /usr/local/lib/node_modules/@vue/cli/node_modules/protobufjs
> node scripts/postinstall


> nodemon@1.18.5 postinstall /usr/local/lib/node_modules/@vue/cli/node_modules/nodemon
> node bin/postinstall || exit 0

Love nodemon? You can now support the project via the open collective:
 > https://opencollective.com/nodemon/donate

npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.4 (node_modules/@vue/cli/node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.4: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

+ @vue/cli@3.0.5
+ vue@2.5.17
added 631 packages in 43.452s
/code # vue create .
```

After you run `vue create .`, you will be prompted to make decisions for your Vue Project. Let's choose the following options: 

- Create the project in the current folder? `Y`
- Please pick a preset: `Manually select features`
- Check the features needed for your project: (select all except for TypeScript)
  - Babel
  - PWA
  - Router
  - Vuex
  - CSS Pre-processors
  - Linter /Formatter
  - Unit Testing
  - E2E Testing
- User history mode for router? `Y`
- Pick a CSS pre-processor `Sass/SCSS`
- Pick a linter / formatter config: `ESLint + Airbnb config`
- Pick additional lint features: `Lint on save`
- Pick a unit testing solution: `Jest`
- Pick a E2E testing solution: `Nightwatch (Selenium-based)`
- Where do you prefer placing config for Babel, PostCSS, ESLint, etc.? `In package.json`
- Save this as a preset for future projects? `N`
- Pick the package manager to use whne installing dependencies: `Use NPM`

Notice that the router options gave us a message: `Requires proper server setup for index fallback in production`. We will address this later on when we integrate our frontend with our backend and webserver. 

You should now see that the the project was created inside of the `frontend` folder. Let's change permissions for these files since they were created by docker as root:

```
sudo chown -R $USER:$USER .
```

Let's make one small but important change to the `.gitignore` file that was generated when we created the Vue application:

```
node_modules/*
!node_modules/.gitkeep
```

Inside of `.gitkeep`, let's include the following link for reference: 

```
https://www.git-tower.com/learn/git/faq/add-empty-folder-to-version-control
```

We are now almost ready to start developing our Vue app. But before we do that, we need to talk about environments. One of the main reasons for using docker is so that we can have the same environment for local development, staging servers, testing, and production (and perhaps even other environments such as a `debug` environment).

A VueJS app is nothing more than a `collection of static files`. However, when we develop our VueJS app, we will be working with `.vue` files that take advantage of modern Javascript features (ES6). When we run `npm run build`, the `.vue` files and other files are bundled into a `collection of static files` that are delivered to the browser, so they don't include `.vue` files; they only `.html`, `.js` and `.css` files.

We also want to take advantage of hot-reloading. This is a feature of modern Javascript frameworks and tools like webpack that allows us to view the changes we make in our app in the browser as we save changes in our code editor. This means that we can make changes to `.vue` files, and then we will be able to see changes instantly in a browser that is showing us a preview. This "preview" is started by running `npm run serve`. This is the mode that we will use as we develop our app. It is not using the `collection of static files` that we will use in production, but the application's behavior when using `npm run serve` is very similar to the application that we get when we generate the `collection of static files`. 

Since docker is all about maintaining the same environment between development, testing, staging/QA and prodcution, we need to be careful when we start introducing different environments. It wouldn't be practical to run `npm run build` after every change we made while developing our app; this command takes some time to generate the `collection of static files`. So although it is breaking a core principle of docker, using different environments for local development and production is necessary for our application. 

What this means is that we will ultimately need two different versions of our existing `docker-compose.yml` file: 

1. One that serves a `collection of static files` for production, and 
2. One that offers us hot reloading during our development process via a `nodesj` server

We actually *will also* be able to use verion `1` during local development, but our changes won't be reflected immediately. We'll see all of this in action very soon. 

Before we split our `docker-compose.yml` into a development version and a production version, let's commit our changes. 

```
git add .
git commit -m "added vuejs app in frontend"
```

Next, let's create `docker-compose.dev.yml`: 

```
cp docker-compose.yml docker-compose.dev.yml
```

We will need to introduce two new services in `docker-compose.dev.yml`: `frontend` and `nginx`. We will also introduce a [network](https://docs.docker.com/network/) that will help our services communicate through the docker engine. (We'll explore this soon).

### Networks

There are several types of networks that docker supports, but we will use one called "user-defined bridge networks". 

> User-defined bridge networks are best when you need multiple containers to communicate on the same Docker host. We will add these to `docker-compose.dev.yml` after we add the `frontend` and `nginx` services. 

More information on docker networks can be found [here](https://docs.docker.com/network/).

### `frontend` service

`frontend` will use a `node` base image and it will run `npm run serve` so that we can watch for changes to files in our project and see the result instantly. 

Here's what the service will look like in `docker-compose.dev.yml`:

```yml
  frontend:
    build:
      context: ./frontend
    volumes:
      - ./frontend:/app/frontend:ro
    ports:
      - "8080:8080"
    networks:
      - main
    depends_on:
      - backend
      - db
```

For this service, we will be looking for a `Dockerfile` in `frontend`. We know this from the `build/context` part of the service definition:

```yml
    build:
      context: ./frontend
```

Let's create this `Dockerfile`, and then continue looking at the `frontend` service in `docker-compose.dev.yml`. 

### `frontend` Dockerfile

```
FROM node:9.11.1-alpine

# make the 'app' folder the current working directory
WORKDIR /app/

# copy package.json to the /app/ folder
COPY package.json ./

# https://docs.npmjs.com/cli/cache
RUN npm cache verify

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# expose port 8080 to the host
EXPOSE 8080

# run the development server
CMD ["npm", "run", "serve"]
```

This Dockerfile says: 

- `FROM node:9.11.1-alpine` Use the base image of `node:9.11.1-alpine`,
- `WORKDIR /app/` In the container, create a folder in the root of the filesystem called `/app` and move into this directory
- `COPY package.json ./` Copy `package.json` from our local machine into `/app` (not `/`) in the container
- `RUN npm install` Install the dependencies into `node_modules`,
- `COPY . .` Copy over all of the files from our project to `.`, which is `/app` since we set that as `WORKDIR`,
- `WORKDIR /app/frontend` Change into the folder `/app/frontend` in the container
- `EXPOSE 8080` Expose port `8080` in the container
- `CMD ["npm", "run", "serve"]` Run `npm run serve` in the container

Let's continue looking at `docker-compose.dev.yml`. After the `build` section, we see that we are mounting the `frontend` directory from our local machine into `/app/frontend`. `ro` specifies that the mounted volume is read-only. This is fine since we will be editing the files in this volume from our local machine, not from inside of the docker container. 

Next, we see that the service definition for `frontend` lists `main` under networks. This means that the service shares a network with other services that are also on the `main` network. We will see why this is the case soon. 

The `depends_on` section specifies that `db` and `backend` must start before `frontend` is started. 

Let's run `docker-compose` with our new `docker-compose.dev.yml` to do a quick test: 

Let's add a `networks` section to the very bottom of `docker-compose.dev.yml`: 

```yml
networks: 
  main:
    driver: bridge
```

Our `docker-compose.dev.yml` file should now look like this: 

```yml
version: '3'

services:
  db:
    container_name: db
    image: postgres
    networks:
      - main

  backend:
    container_name: backend
    build: ./backend
    command: /start.sh
    volumes:
      - .:/code
    ports:
      - "8000:8000"
    networks:
      - main
    depends_on:
      - db

  frontend:
    container_name: frontend
    build:
      context: ./frontend
    volumes:
      - ./frontend:/app/frontend:ro
    ports:
      - "8080:8080"
    networks:
      - main
    depends_on:
      - backend
      - db

networks: 
  main:
    driver: bridge
```

Let's start this file with the following command:

```
docker-compose -f docker-compose.dev.yml up --build
```

We should now be able to see both the Vue application and the Django application by visiting: 

- `localhost:8000/admin` for Django
- `localhost:8080` for Vue

Let's commit our changes before we add `nginx`. 

```
git add .
git commit -m "added docker-compose.dev.yml and a dockerfile for frontend"
```

## NGINX

At this point it makes sense to introduce NGINX. 

NGINX is a webserver and reverse proxy that will play an important role in our application. NGINX is analogous to the "front desk" in our applicatoin in that it directs traffic to the files or service URLs that specifies. 

For example, we will tell NGING to send all requests that start with `/api` or `/admin` to be sent to our Django server, not our `node` server. This makes sense, because our `node` server won't know what to do with `/api` or `/admin` requests.

If you are familiar with Django's URL routing, I think it is fair to say that NGINX is like a higher-level version of `urls.py` in that it directs traffic based on the properties of the incoming URLs. It will also handle `https`, serving static files, and more. We'll see all of this later, but for now let's just introduce it to our `docker-compose.dev.yml` file so we can use it in local development. 

Let's add the following to our `docker-compose.dev.yml` file: 

```yml
  nginx:
    image: nginx:alpine
    ports:
      - "8001:80"
    depends_on:
      - backend
    volumes:
      - ./nginx/dev.conf:/etc/nginx/nginx.conf:ro
    networks:
      - main
```

We don't need a `Dockerfile` for this service since we only need the base image: `nginx:alpine`. This means that we don't need to specify a `build` section for the service definition. 

Note that we do need to mount a file called `dev.conf` into the container. This will be the NGINX configuration file that we write to tell NGINX how to handle traffic that it receives on port `8001`. 

Let's make a top-level folder called `nginx`, and inside that folder create a file called `dev.conf` with the following content: 

**nginx/dev.conf**

```
user  nginx;
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  include /etc/nginx/mime.types;
  client_max_body_size 100m;

  upstream backend {
    server backend:8000;
  }

  upstream frontend {
    server frontend:8080;
  }

  server {
    listen 80;
    charset utf-8;

    # frontend urls
    location / {
    proxy_redirect off;
    proxy_pass http://frontend;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    }

    # frontend dev-server
    location /sockjs-node {
      proxy_redirect off;
      proxy_pass http://frontend;
      proxy_set_header X-Real-IP  $remote_addr;
      proxy_set_header X-Forwarded-For $remote_addr;
      proxy_set_header Host $host;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }

    # backend urls
    location ~ ^/(admin|api|static) {
      proxy_redirect off;
      proxy_pass http://backend;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
    }
  }
}
```

Now visit `localhost:8001` and you should see the Vue app as well as some logs from the `nginx` service in the docker-compose output with `200` status messages. 

`localhost:8001/admin` should display the Django admin interface. 

I chose to map port `8001` to NGINX's port `80` somewhat arbitrarily. You might have some other service running on your local machine that is using port 80. If we tried to map port `80` on our host to port `80` in a container while port `80` on our host was in use, the docker engine would tell us that the service is not available and it would not start the container. 

Let's commit these changes and then make some additional optimizations.

```
git add .
git commit -m "added nginx service and added configuration file to new nginx directory"
```

One simple optimization we can make is not serving static files from Django. By using a shared volume, we can add Django's static files to the NGINX file system so that it can serve resources directly from it's own container. (Later on we will use a similar technique for adding our production-ready VueJS application to NGINX).

We need to change the following files to do this: 

1. Edit `docker-commpose.dev.yml`
2. Move `nginx/dev.conf` to `nginx/dev/dev.conf`
3. Edit `nginx/dev/dev.conf`
4. Add `nginx/dev/DockerfileDev`

In `docker-compose.dev.yml`, we will need to do the following:

- Add a `django-static` volume:

```yml
volumes:
  django-static:
```

- Change the `build` section of the `backend` container: 

```yml
    build:
      context: .
      dockerfile: nginx/dev/Dockerfile
```

- Mount `django-static` in the `backend` container:

```yml
    volumes:
      - .:/code
      - django-static:/backend/static
```

- Mount `django-static` in the `nginx` container:

```yml
    volumes:
      - ./nginx/dev/dev.conf:/etc/nginx/nginx.conf:ro
      - django-static:/usr/src/app/static
```

In `nginx/dev/dev.conf` we need to do the following: 

- remove `static` from the `location ~ ^/(admin|api|static)` location block
- create a new `static` block right after the `(admin|api)` location block as follows:

```
    # static files
    location /static {
      autoindex on;
      alias /usr/src/app/static;
    }
```

Finally, add `nginx/dev/Dockerfile`: 

```
FROM nginx:1.13.12-alpine
COPY nginx/dev/dev.conf /etc/nginx/nginx.conf
COPY backend/static /usr/src/app/static/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

When we restart docker-compose, we should now see that our static files are served from NGINX directly. 

Let's add a script to clear images and containers from docker: 

**reset_docker.sh**

```bash
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

docker system prune -f
docker rmi $(docker images -f "dangling=true" -q)
docker rmi $(docker images -a -q)
docker rm $(docker ps --filter=status=exited --filter=status=created -q)
```

Let's commit our changes: 

```
git add .
git commit -m "optimized Django application by serving static files from nginx"
```
