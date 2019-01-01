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
git commit -m "save readme.md"
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

- `backend` specifies another service. In docker-compose, a service refers to docker images and the containers that can be run from these images.

- `build: .` specifies that we will be building from a file named `Dockerfile` that is in the same directory as `docker-compose.yml`.

- `command: python3 manage.py runserver 0.0.0.0:8000`

This line tells the Docker container to run the command `python3 manage.py runserver 0.0.0.0:8000`. This command can also be executed from inside the `Dockerfile` used to build the `backend` service. Instead of writing the command here, we can also include an executable script that will run a series of commands. We will do this soon.

> Note: `runserver` starts the Django development server. The development server is not intended for production use; it is for local development only. Later on we will add `gunicorn` to replace Django's `runserver` command.

```yml
volumes:
  - .:/code
```

This will mount our current working directory in the container's `/code` file as a volume. This means that the host machine will share a directory with the container. Also, any changes we make to the volume on our computer (the host machine) will be made inside of the container. For example, when we change and update a file in our Django application (that we will create in the next steps), this files will be watched by the `runserver` command and will restart the development server just as they would if we were developing a Django app on our computer without Docker. This will be useful as it will allow us to develop our app while it runs in our container. We won't have to restart the container each time we make changes to our code.

```yml
ports:
    - "8000:8000"
```

This section will map traffic to the host machine (your computer) on port 8000 to the container's internal 8000 port. This means that if we visit `localhost:8000` on our machine while the container is running, we will be able to connect to the server that is running on `0.0.0.0:8000` inside of the container.

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

This will run a Django command that will create our project. I have changed the names slightly from the ones used in the tutorial for simplicity. We are using `docker-compose` to `run` a command using our `backend` service. We will use `django-admin.py`'s `starproject` command to create a project called `backend` that will live in the current directory (the current directory is specified by the `.` on the end of this command).

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

Our project should now have the following structure:

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
```

```
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

```yaml
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

This will keep Python byte code out of our source code. Also we can prevent python from generating any byte code by adding another line to our backend `Dockerfile`:

```
ENV PYTHONDONTWRITEBYTECODE 1
```

This sets the value of an environment variable in our container called `PYTHONDONTWRITEBYTECODE` equal to `True`.

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

You may choose to add this virual environment through another tool such as `pyenv` which will store data for our virtual environment elsewhere.

Let's add a `.gitignore` to keep the `.env` folder out of source control:

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

This will return the exit code of the last command. If you see `0`, then `flake8` found no errors. If you remove a `# noqa` from the end of one of the long lines, then you will see the linting error printed out, and you will see that the result of `$?` is `1`. `$?` is a special variable that stores the return value of the previously run command.

Now that we have basic testing and linting, we should add code coverage. Django has official recommendations for how to use `coverage.py` with Django projects [here](https://docs.djangoproject.com/en/2.1/topics/testing/advanced/).

Add `pytest` and `pytest-cov` to `requirements.txt`. Next, add a `pytest.ini` file to the top-level `backend` folder:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = backend.settings
python_files = tests.py test_*.py *_tests.py
```

Now restart `docker-compose`:

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
  - lint_test_coverage

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

test:
  stage: lint_test_coverage
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/$POSTGRES_DB"
    DJANGO_SETTINGS_MODULE: "backend.settings-gitlab-ci"
  script:
    - flake8
    - pytest --cov
```

In GitLab's `Settings` > `CI/CD` section, add the following to `Test Coverage Parsing`:

```
^TOTAL\s+\d+\s+\d+\s+(\d+\%)$
```

Notice that our `gitlab-ci.yml` file references `backend.settings-gitlab-ci`. We need to create this file so that we can use special settings in our project that we want to use only for running our tests.

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

At this point, we are going to add some additional packages to Django that will allow us to build a powerful API.

When I say that we will build an API with Django, what I mean is that we will establish a structured set of URLS that we will return responses when we make HTTP requests to these URLs. Before we look at an example of what this means, it is important to know that HTTP requests are split into different types by their method. Here are the different types of HTTP requests methods:

- `GET`: The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
- `HEAD`: The HEAD method asks for a response identical to that of a GET request, but without the response body.
- `POST`: The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
- `PUT`: The PUT method replaces all current representations of the target resource with the request payload.
- `DELETE`: The DELETE method deletes the specified resource.
- `CONNECT`: The CONNECT method establishes a tunnel to the server identified by the target resource.
- `OPTIONS`: The OPTIONS method is used to describe the communication options for the target resource.
- `TRACE`: The TRACE method performs a message loop-back test along the path to the target resource.
- `PATCH`: The PATCH method is used to apply partial modifications to a resource.

We will mostly be using `GET`, `POST`, `DELETE`, `PUT` and `PATCH`. These methods correspond to the actions of a `CRUD` app: `create`, `read`, `update`, `delete`.

- `POST` is similar to `create`
- `GET` is similar to `read`
- `PUT` and `PATCH` are similar to `update`
- `DELETE` is similar to `delete`

Now let's look at a basic example. Let's say our app allows users to read, write, update and delete blog posts.

When a user reads a blog post, we will be accessing data through one of our API's endpoints. Accessing the data will involve an HTTP request that will use a `GET` *HTTP requests method*. For example:

We make a `GET` request to `https://www.our-site.com/api/posts/3/`. The Django ReST Framework will process this requests, fetch a post with an `id` of `3`, and return this post in JSON form. It might look something like this:

```json
{
    "id": 3,
    "title": "My Third Post",
    "content": "Today I wrote my third blog post, ...",
    "draft": false,
    "publish_date": "2050-03-08",
}
```

The [Django ReST Framework](https://www.django-rest-framework.org/) will be responsible for serializing and deserializing our Django models instances (which are python objects) to and from JSON.

It has many powerful features that make it the most popular package for building APIs with Django. Here are some additional features that we will use later:

- `Permissions`: how do we control what users can access what resources.
- `Pagination`: Let's say we have millions of posts and the user wants to browse all of the posts. We will want to send the user one set of posts and let the user click through a list of pages to see more posts. Each time the user clicks on a new page, we make a new get request to the ReST API.

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

This defines default behavior for our Django ReST Framework views. If a user tries to access a post (for example, the user makes a request to `/api/posts/1/`), we check the `DEFAULT_PERMISSION_CLASSES`. This is a tuple of permission classes, and there is only one in the settings we have defined above: `'rest_framework.permissions.IsAuthenticated'`. This checks if a user is authenticated or not. To check if a user is authenticated or not, we check `'DEFAULT_AUTHENTICATION_CLASSES'`. This is also a tuple. We will check the the three values `JSONWebTokenAuthentication`, `SessionAuthentication` and `BasicAuthentication`, one at a time. As soon as one of these classes says that the user is authenticated, we stop checking, and it is determined that the user is authenticated. If it is determined that a user is authenticated, then the user has permission to access the resource in question (`/api/posts/1/`, for example).

We have a little bit more work to do on the backend. Once we build out an authentication system and a basic model like "Blog Posts", we will be ready to set up a user interface that will to login and also get and post data to our backend Django API. Then we will tie the backend and the frontend together with a powerful webserver and reverse proxy: NGINX.

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

class TestAccounts(APITestCase):

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

Decoded, this JWT contains two JSON objects and a signature:

```json
{"typ":"JWT","alg":"HS256"}{"user_id":2,"username":"admin","exp":1538330599,"email":""}Ō稬6QޜY<P
```

The first part of JSON identifies the type of token and the hashing algorithm used. The second part is a JSON representation of the authenticated user, with additional information about when the token expires. The third part is a signature that uses the `SECRET_KEY` of our Django application for security.

We can also try this endpoint in the Django ReST Framework's browseable API by going to `http://0.0.0.0:8000/auth/obtain_token/`. You will see this:

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

Let's restore the original settings for `REST_FRAMEWORK` for now, but remove `BasicAuthentication`:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
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
      - '/app/node_modules'
    ports:
      - "8080:8080"
    networks:
      - main
    depends_on:
      - backend
      - db
    environment:
      - NODE_ENV=development
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

This Dockerfile would work, but there are some small optimizations that we can make to improve our workflow.

Here's the optimized Dockerfile:

```
FROM node:9.11.1-alpine

# make the 'app' folder the current working directory
WORKDIR /app/

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# expose port 8080 to the host
EXPOSE 8080

CMD ["sh", "start_dev.sh"]
```

Notice that at the end of the Dockerfile we are running `start_dev.sh`. Let's create `start_dev.sh` as a script in the top level of the `frontend` folder:

```
#!/bin/bash

# https://docs.npmjs.com/cli/cache
npm cache verify

# install project dependencies
npm install

# run the development server
npm run serve
```

Let's continue looking at `docker-compose.dev.yml`:

```yml
    volumes:
      - ./frontend:/app/:ro
      - '/app/node_modules'
```

After the `build` section, we see that we mount two volumes. **First**, we mount the `frontend` directory from our local machine into `/app/frontend`. `ro` specifies that the mounted volume is read-only. This is fine since we will be editing the files in this volume from our local machine, not from inside of the docker container.

**Second**, we mount `/app/node_modules`. This will make sure that `node_modules` is not overwritten when mounting files into the `frontend` container. You can read more about why this is the case in [this Stack Overflow post](https://stackoverflow.com/questions/30043872/docker-compose-node-modules-not-present-in-a-volume-after-npm-install-succeeds).

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
      - '/app/node_modules'
    ports:
      - "8080:8080"
    networks:
      - main
    depends_on:
      - backend
      - db
    environment:
      - NODE_ENV=development

networks:
  main:
    driver: bridge
```

Let's run docker-compose to bring up the network and the containers:

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

NGINX is a webserver and reverse proxy that will play an important role in our application. NGINX is analogous to the "front desk" in our applicatoin in that it directs traffic to the files or service URLs that we specify.

For example, we will tell NGINX to send all requests that start with `/api` or `/admin` to be sent to our Django container, not our `node` server. This makes sense, because our `node` server won't know what to do with `/api` or `/admin` requests.

If you are familiar with Django's URL routing, I think it is fair to say that NGINX is like a higher-level version of `urls.py` in that it directs traffic based on the properties of the incoming URLs. It will also handle `https`, serving static files, and more. We'll see all of this later, but for now let's just introduce it to our `docker-compose.dev.yml` file so we can use it in local development.

Let's add the following to our `docker-compose.dev.yml` file:

```yml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - backend
    volumes:
      - ./nginx/dev.conf:/etc/nginx/nginx.conf:ro
    networks:
      - main
```

We don't need a `Dockerfile` for this service since we only need the base image: `nginx:alpine`. This means that we don't need to specify a `build` section for the service definition.

Note that we do need to mount a file called `dev.conf` into the container. This will be the NGINX configuration file that we write to tell NGINX how to handle traffic that it receives on port `80`.

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

Now visit `localhost` and you should see the Vue app as well as some logs from the `nginx` service in the docker-compose output with `200` status messages. Remeber, visiting `localhost` in your browser is equivalent to visiting `localhost:80`.

`localhost/admin` should display the Django admin interface.

You might have some other service running on your local machine that is using port 80. If we tried to map port `80` on our host to port `80` in a container while port `80` on our host was in use, the docker engine would tell us that the service is not available and it would not start the container.

Let's commit these changes and then make some additional optimizations.

```
git add .
git commit -m "added nginx service and added configuration file to new nginx directory"
```

One simple optimization we can make is not serving static files from Django. By using a shared volume, we can add Django's static files to the NGINX file system so that it can serve resources directly from it's own container. (Later on we will use a similar technique for adding our production-ready VueJS application to NGINX).

We need to change the following files to do this:

1. Edit `docker-compose.dev.yml`
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

Let's commit our changes:

```
git add .
git commit -m "optimized Django application by serving static files from nginx"
```

## Connecting our backend and frontend

Let's get our backend talking to our frontend. We want to make API calls from our VueJS application that will return data from our Django backend.

Let's keep this as simple as possible and simply list the `Post` objects on the front page of our VueJS application right under the VueJS logo. Also, let's remove the `HelloWorld.vue` component.

To do this, we only need to add the following to the `Home.vue` file:

1. a `fetchPosts` method in the `methods` section of the `script` part of the sigle-file component.

2. a `mounted` method that calls `this.fetchPosts` to load the posts when the component is mounted.

3. `data()` method that will return an object that holds `posts: []`

4. String interpolation in the `template` that will display the `title` and `content` attributes of our posts.

Here's what my `Home.vue` file looks like:

**frontend/src/views/Home.vue**

```html
<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <h3>Posts</h3>
    <div v-for="(post, i) in posts" :key="i">
      <h4>{{ post.title }}</h4>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      posts: [],
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    fetchPosts() {
      fetch('/api/posts/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((json) => {
              this.posts = json;
            });
          }
        });
    },
  },
};
</script>
```

Let's go back to our `REST_FRAMEWORK` settings in `settings.py` and comment out the following line:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
    ),
}
```

Now when we load the Vue app, we should see an error in the developer console saying:

```
GET http://localhost:8001/api/posts/ 401 (Unauthorized)
```

This means that our request is getting to the backend, but since we are not passing a JWT with the header of the request and we are not logged in with session authentication, we are getting a `401 Unauthorized` status code.

We want to be able to


Let's override the default settings by changing the `PostList` view:

**backend/posts/views.py**

```python
from rest_framework.decorators import (
    authentication_classes,
    permission_classes
)

...

class PostList(generics.ListAPIView):
    authentication_classes = ()
    permission_classes = ()
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

When we save `views.py`, we should see the posts displayed in the VueJS app. Let's remove these changes from `views.py` as they would break our tests.

We can keep the changes to `REST_FRAMEWORK`. This will leave an important task for us to handle later: adding authentication to our VueJS applicatoin. Let's commit these changes.

```
git add .
git commit -m "added an api call to frontend VueJS app to list posts"
```

## Production Environment

So far we have been working on our `docker-compose.dev.yml` file that we will use for local development of our application. Let's revisit `docker-compose.yml`. This file will be used t build our production environment. Let's create a new branch called `feature-prod` where we will make changes for our production environment. Let's also merge our current branch, `feature-vue` and create a new minor release.

```
git add .
git commit -m "updated readme"
git checkout develop
git merge feature-vue
git checkout -b release-0.0.3
git checkout master
git merge release-0.0.3 --no-ff
git tag -a 0.0.3
git push --all
git push --tags
```

## Production Environment

Let's think about what we need to change in `docker-compose.dev.yml` for our production environment:

1. `nginx`
  - We need to create `prod.conf` to replace `dev.conf`
  - In `prod.conf`, we need to remove the `frontend` server since we won't be using `frontend` in production
  - In `prod.conf`, we want to serve our VueJS as static files.
  - We need to add a new `Dockerfile` that will use a multi-stage build to get the production-ready VueJS static files into the `nginx` container

2. `backend`
  - We will want to add `gunicorn`, a production-ready webserver that will replace the `runserver` command that we are using for development. We will split `start.sh` into `start_dev.sh` and `start_prod.sh`.
  - We also need to change the `Dockerfile` for backend to copy both `start_dev.sh` and `start_prod.sh`

3. `frontend`
  - We will remove this service for production.

### `nginx`

Let's create a `prod` folder in `nginx` that will live next to `nginx/dev`. Create `prod.conf` in this folder:

**nginx/prod/prod.conf**

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

  server {
    listen 80;
    charset utf-8;

    root /dist/;
    index index.html;

    # frontend
    location / {
      try_files $uri $uri/ @rewrites;
    }

    location @rewrites {
      rewrite ^(.+)$ /index.html last;
    }

    # backend urls
    location ~ ^/(admin|api) {
      proxy_redirect off;
      proxy_pass http://backend;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
    }

    # static files
    location /static {
      autoindex on;
      alias /usr/src/app/static;
    }
  }
}
```

Now let's look at `nging/prod/Dockerfile`:

```
# build stage
FROM node:9.11.1-alpine as build-stage
WORKDIR /app/
COPY frontend/package.json /app/
RUN npm cache verify
RUN npm install
COPY frontend /app/
RUN npm run build

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY nginx/prod/prod.conf /etc/nginx/nginx.conf
COPY backend/static /usr/src/app/static/
COPY --from=build-stage /app/dist /dist/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

This uses a multi-stage build. In the build stage, we start with a `node` container that builds our static files for the VueJS application. Then, in the production stage, files from the `node` container are mounted into the `nginx` container that the production stage uses. A multi-stage build like this is the official recommendation for Dockerizing VueJS applications.

For the `backend`, let's start with `requirements.txt`:

```python
...
gunicorn==19.8
...
```

Let's use `gunicorn` in `backend/scripts/stat_prod.sh`:

```sh
#!/bin/bash

cd backend
python3 manage.py collectstatic --no-input
python3 manage.py makemigrations
python3 manage.py migrate --no-input
gunicorn backend.wsgi -b 0.0.0.0:8000
```

Be sure to make this file executable, as well as `start_dev.sh`. Also, in `docker-compose.dev.yml`, change the `backend` command from `/start.sh` to `/start_dev.sh`.

Let's change the `backend` Dockerfile:

```
FROM python:3.6
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
COPY scripts/start*.sh /
ADD . /code/
```

We only changed `start.sh` to `start*.sh`. This will `COPY` both of our shell scripts used to start Django. This way we don't need two separate Dockerfiles for `backend`.

Let's test the environment by running:

```
docker-compose up --build
```

This seems to work fine: we can access both the VueJS app and the Django application's admin site.

Let's commit our changes.

```
git add .
git commit -m "completed basic production environment"
```

Now let's merge this branch and create a new minor release:

```
git add .
git commit -m "updated readme"
git checkout develop
git merge feature-prod
git checkout -b release-0.0.4
git checkout master
git merge release-0.0.4 --no-ff
git tag -a 0.0.4
git push --all
git push --tags
```

## Celery and Redis

Let's create a new branch called `feature-celery` where we will add Celery to our application. Adding celery and redis will allow us to process tasks asynchronously.

To add celery to our project we will need to do the following:

- Add `celery` and `redis` services to our docker-compose files
- Add `celery` and `redis` to our `requirements.txt`
- Add `celery` settings in `settings.py`
- Add `celery_app.py` to our Django application
- Test `celery` and `redis` with a sample task

Add the following to both `docker-compose.yml` and `docker-compose.dev.yml`:

```yml
  redis:
    image: redis:alpine
    container_name: redis
    networks:
      - main

  celery:
    build: ./backend
    container_name: celery
    command: bash -c 'celery worker --app=backend.celery_app:app --loglevel=info'
    volumes:
      - ./backend:/code
    depends_on:
      - db
      - redis
    networks:
      - main
```

Now add the following to `requirements.txt`:

```
celery==4.2
redis==2.10.5
```

Add the following to our Django settings (`settings.py`):

```python
# Celery Configuration

CELERY_BROKER_URL = 'redis://redis:6379'
CELERY_RESULT_BACKEND = 'redis://redis:6379'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
```

Now add `celery_app.py` next to `settings.py` in Django:

```python
import os
from celery import Celery
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print("Doing async task")
    time.sleep(2)
    print("Task is done")
```

Let's test that this sample task is processed in our celery worker. In the `posts` app, let's add a function and map it to a url pattern. We will call the task inside the function body:

**backend/posts/views.py**

```python
from backend.celery_app import debug_task

from rest_framework import generics
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

...

@api_view()
@authentication_classes([])
@permission_classes([])
def celery_test_view(request):
    debug_task.delay()
    return Response({"message": "Your task is being processed!"})
```

**backend/posts/urls.py**

```python
from django.urls import path

from . import views

urlpatterns = [
    ...
    path('celery-test/', views.celery_test_view, name='celery-test')
]
```

Now let's test this sample task. Run:

```
docker-compose -f docker-compose.dev.yml up --build
```

Now navigate to `/api/posts/celery-test/`. You should see the JSON response returned right away, and two seconds later you should see the `"Task is done"` message printed out in the `celery` service logs. Also verify that celery tasks are working in the production environment:

```
docker-compose up --build
```

Let' make on more optimization for our development environment as it relates to celery. If you have worked with Celery and Django before, you know that making changes to celery requires that celery is restarted. We can add a Django management command that will restart celery when changes to our `backend` codebase are saved.

Django managment commands should be put in Django apps. Let's make a new Django app called `core` following the same steps we took while creating our `posts` app. `core` will serve as an app to put things that are not directly related to any other app logic.

Next, let's add a file called `watch_celery.py`:

*`backend/core/management/commands/watch_celery.py`*:

```python
"""
This command allows for celery to be reloaded when project
code is saved. This command is called in
`docker-compose.dev.yml` and is only for use in development

https://avilpage.com/2017/05/how-to-auto-reload-celery-workers-in-development.html
"""

import shlex
import subprocess

from django.core.management.base import BaseCommand
from django.utils import autoreload


def restart_celery():
    cmd = 'pkill -9 celery'
    subprocess.call(shlex.split(cmd))
    cmd = 'celery worker --app=backend.celery_app:app --loglevel=info'
    subprocess.call(shlex.split(cmd))


class Command(BaseCommand):

    def handle(self, *args, **options):
        print('Starting celery worker with autoreload...')
        autoreload.main(restart_celery)
```

Now let's change the `command` part of the `celery` service in `docker-compose.dev.yml`:

```yml
    command: bash -c 'python3 manage.py watch_celery'
```

We can verify that this works by changing the text returned by our `celery-test-view` function, and we can also see that the celery service is restarted when we save change changes to our `backend` code.

We will not change the `celery` `command` for `docker-compose.yml`, because we won't be editing code in our production app.

Let's add one more container that will help us monitor Celery tasks: `flower`.

Add the following to both `docker-compose.yml` and `docker-compose.dev.yml`:

```yml
  flower:
    image: mher/flower
    container_name: flower_dev_vet
    command: flower --url_prefix=flower
    environment:
      - CELERY_BROKER_URL=redis://redis:6379
      - FLOWER_PORT=5555
    ports:
      - 5555:5555
    networks:
      - main
    depends_on:
      - celery
      - redis
```

And then add the following to `dev.conf` and `prod.conf` NGINX configurtion files:

```
  upstream flower {
    server flower:5555;
  }

...

    # flower
    location /flower/ {
        rewrite ^/flower/(.*)$ /$1 break;
        proxy_pass http://flower/;
        proxy_set_header Host $host;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
```

Once we have verified that tasks are also working for our production environment and that we can view the flower dashboard when we visit `/flower` in the browser, let's commit our changes and make a new minor release for our new celery feature.

```
git add .
git commit -m "added celery and redis"
git checkout develop
git merge feature-celery
git checkout -b release-0.0.5
git checkout master
git merge release-0.0.5
git tag -a 0.0.5
git push --all
git push --tags
```

## Portainer

As we add more services to our application, it will be helpful to have a GUI tool to monitor all of the docker containers, volumes and networks on our host machine. We will use [`portainer`](https://portainer.io/) for this.

> Portainer is an open-source lightweight management UI which allows you to easily manage your docker hosts or swarm clusters.

Add the following to both `docker-compose.yml` and `docker-compose.dev.yml`:

```yml
  portainer:
    image: portainer/portainer
    container_name: portainer
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    ports:
      - 9000:9000

volumes:
  django-static:
  portainer-data:
```

Using NGINX, we can make our portainer container accessible when we visit the route `/portainer`. Here's how we do this in our NGINX configuration file:

Inside of the `http` block, add the following:

```
  upstream portainer {
      server portainer:9000;
  }
```

Inside of the `server` block that is inside of the `http` block, add the following:

```
    # portainer
    location /portainer/ {
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_pass http://portainer/;
    }
    location /portainer/api/websocket/ {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_pass http://portainer/api/websocket/;
    }
```

Also, let's give our containers more precise names so the names don't conflict with any other containers we have running on our local development machine in different projects. In both docker-compose files, change the `container-name` for each service so that they have names specific to their role:

For each container I will append either `_prod_vet` or `_dev_vet` to specify if the container is for development or production. `vet` will be used to denote the name of the current project we are working on (short for `verbose equals true`).

I'm doing this to resolve container name conflicts on my local machine with other containers in similar projects. You might not have this issue on your local machine, but it won't hurt to give detailed names to your containers.

**Note**: We will only use one `portainer` container name as this container is meant to monitor all of the containers on our host. It would not make sense to include multiple `portainer` containers because they will all report the same information.

Before we commit our work, run the two different environments and confirm that you can access `portainer` by navigating to `localhost:9000` and `/portainer`.

```
docker-compose up
```

## Vue Authentication

At this point we are ready to start working on our frontend VueJS application in more detail. To start, we will want to do the following:

- Install additional packages to be used with our VueJS application:
  - [`axios`](https://github.com/axios/axios): a Promise based HTTP client for the browser and node.js
  - [`element-ui`](https://element.eleme.io/#/en-US): a Vue 2.0 based component library for developers, designers and product managers

- Remove the boilerplate code that was autogenerated

- Build out a basic layout with a side menu and nav bar.

- Build in authentication so only authenticated users can see our app using `axios` and `element-ui`
  - All other users will be redirected to the `login` page

To begin, let's install `axios` and `element-ui`. To install these packages, we can add the package name and version to `dependencies` in `package.json`.

**package.json**

```json
  "dependencies": {
    "element-ui":"^2.4.8",
    "axios":"^0.17.1",
    ...
  }
```

Now, when we run `npm run install` in either the development or production environment, we will install these packages with `npm` and have access to them from our Vue application.

Let's launch the development environment and see this in action:

```
docker-compose -f docker-compose.dev.yml up --build
```

Let's globally import `Element UI` as recommmended in the [official documentation](https://element.eleme.io/#/en-US/component/quickstart#import-element). In `main.js`, add the following code:

**frontend/src/main.js**

```js
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
```

Now we can use Element UI components anywhere in our project without having to import them in each file where they are used.

Let's commit our changes and then start on implementing our authentication system.

```
git add .
git commit -m "added element ui and axios libraries"
```

Let's start with an example of authentication in VueJS using JWTs from [sqreen.io](https://blog.sqreen.io/authentication-best-practices-vue/), a company that specializes in automated security for web apps. The code for the authentication example is available [here](https://github.com/sqreen/vue-authentication-example/tree/master/src).

Let's compare the structure of the `src` directories in our project and the sqreen.io example:

Our project's `src`:

```
.
├── App.vue
├── components
├── main.js
├── registerServiceWorker.js
├── router.js
├── store.js
└── views
    ├── About.vue
    └── Home.vue
```

sqreen.io's `src`:

```
.
├── App.vue
├── components
│   ├── account
│   │   └── index.vue
│   ├── footer
│   │   └── index.vue
│   ├── home
│   │   ├── fakeFeed.js
│   │   ├── feedItem.vue
│   │   └── index.vue
│   ├── lib
│   │   ├── center-container.vue
│   │   └── loading.vue
│   ├── login
│   │   └── index.vue
│   └── navigation
│       └── index.vue
├── main.js
├── router
│   └── index.js
├── store
│   ├── actions
│   │   ├── auth.js
│   │   └── user.js
│   ├── index.js
│   └── modules
│       ├── auth.js
│       └── user.js
└── utils
    └── api.js
```

Let's rearrange our Vue app so that it has the same files structure as the sqreen app. Leave blank files in the folders you create as placeholders and we will fill them in in a way that works with our Django backend and the Element UI component library.

Remove the `router.js` and `store.js` files in the root of our project.

Let's start with the `main.js` file. We first import `Vue`, `App`, `router` and `store`. We can leave these import statements as they are in our `main.js`. We moved these files, but we also renamed them to `index.js`, so importing the name of the parent folder will import the `index.js` file by default.

Next let's import `Loading` and `CenterContainer` and then register these components globally:

```js
import Loading from 'components/lib/loading'
import CenterContainer from 'components/lib/center-container'

Vue.component('loading', Loading)
Vue.component('center-container', CenterContainer)
```

Now let's look at `App.vue`, the component we pass into the `template` of our Vue instance. Here's the template:

```html
<template>
  <div id="app">
    <navigation/>
    <div class="main-container">
      <center-container>
        <router-view/>
      </center-container>
    </div>
    <sqreen-footer/>
  </div>
</template>
```

This template makes use of the `center-container` and `router-view` components that we imported in `main.js`. It also uses the `navigation` and `sqreen-footer` that we specify in the `components` property. `<router-view>` will display the component that corresponds to the current route. We will look at the routes file shortly.

This template will make it difficult to not show the `navigation` and `footer` components. Later we may want to change the template here to include only `router-view`. Then, we can include any layout depending on the current route. Changing this will be easy, but let's move on for now.

```html
<script>
import Navigation from 'components/navigation'
import { USER_REQUEST } from 'actions/user'
import SqreenFooter from './components/footer/index.vue'

export default {
  components: {
    SqreenFooter,
    Navigation },
  name: 'app',
  created: function () {
    if (this.$store.getters.isAuthenticated) {
      this.$store.dispatch(USER_REQUEST)
    }
  }
}
</script>
```

The script section imports two components and an `action` from the `store`. Let's talk about the store after we have a look at the `router` file:

**src/router/index.js**

```js
import Vue from 'vue'
import Router from 'vue-router'
import Home from 'components/home'
import Account from 'components/account'
import Login from 'components/login'
import store from '../store'

Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next()
    return
  }
  next('/')
}

const ifAuthenticated = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next()
    return
  }
  next('/login')
}

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/account',
      name: 'Account',
      component: Account,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      beforeEnter: ifNotAuthenticated,
    },
  ],
})
```

Here we are importing the Router, registering it to Vue, defining functions that will be called before the `/account` and `/login` routes are visited. We see this in the `beforeEnter` property in the `routes` attribute in the `Router` we are instantiating to be used in our application.

Let's start with the `/login` route.

If we visit `/login`, we will first run the `ifNotAuthenticated` function. This function checks the `store` for the value of `store.getters.isAuthenticated`. Let's look at what this getter does:

**src/store/modules/auth.js**

```js
const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
}
```

If there is a token in the `state`, `isAuthenticated` returns `true`. In this case, `ifNotAuthenticated` will redirect to `/`. If there is not token, we call `next()`. Next will then render our `Login` component.

`ifNotAuthenticated` is a global guard. You can read more about global guards in the [Vue Router documentation](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-guards).

We do something similar with the `/account` route. Before we access this route, we run `ifAuthenticated`. This function redirects to `/login` if there is no token in storage.

Let's now look at the `Login` component:

```html
<template>
  <div>
    <form class="login" @submit.prevent="login">
      <h1>Sign in</h1>
      <label>User name</label>
      <input required v-model="username" type="text" placeholder="Snoopy"/>
      <label>Password</label>
      <input required v-model="password" type="password" placeholder="Password"/>
      <hr/>
      <button type="submit">Login</button>
    </form>
  </div>
</template>
```

This is a fairly standard login form for Vue. Notice how we place the `@submit` action on the form, not the `button` in the form.

```js
<script>
  import {AUTH_REQUEST} from 'actions/auth'

  export default {
    name: 'login',
    data () {
      return {
        username: '',
        password: '',
      }
    },
    methods: {
      login: function () {
        const { username, password } = this
        this.$store.dispatch(AUTH_REQUEST, { username, password }).then(() => {
          this.$router.push('/')
        })
      }
    },
  }
</script>
```

In the `script` section we import `AUTH_REQUEST` from `actions/auth`. In `methods`, we define the `login` method that is called when the form is submitted. We dispatch the `AUTH_REQUEST` with the `username` and `password` as arguments to this action.

Let's look at `AUTH_REQUEST`:

```js
  [AUTH_REQUEST]: ({commit, dispatch}, user) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST)
      apiCall({url: 'auth', data: user, method: 'POST'})
      .then(resp => {
        localStorage.setItem('user-token', resp.token)
        // Here set the header of your ajax library to the token value.
        // example with axios
        // axios.defaults.headers.common['Authorization'] = resp.token
        commit(AUTH_SUCCESS, resp)
        dispatch(USER_REQUEST)
        resolve(resp)
      })
      .catch(err => {
        commit(AUTH_ERROR, err)
        localStorage.removeItem('user-token')
        reject(err)
      })
    })
  }
```

This method might look a little bit strange if you are not familiar with ES6. `[AUTH_REQUEST]:` is simply the name of the attribute. The arguments section `({commit, dispatch}, user)` uses destructuring assignment. You can read more about that [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Syntax).

`commit` and `dispatch` are part of `context`. In short, `commit` and `dispatch` together will allow us to change the global state. Let's see how this works. The function returns a Promise, and right away we see `commit(AUTH_REQUEST)`. This may seem confusing because we are already in the body of a function called `AUTH_REQUEST`.

In Vue, you *`commit`* **`mutations`** and you *`dispatch`* **`actions`**. Committing a mutation is a synchronous action. It happens right away, and doesn't need to wait for a response from a remote server. Dispatching actions is an asynchronous event.

Back in the `login` method, we dispathed an action:

```js
this.$store.dispatch(AUTH_REQUEST, { username, password })
```

Inside this action, we can commit a mutation. In `src/store/modules/auth.js`, we have an object called `mutations`, and one of the properties of this object is `AUTH_REQUEST`. This is the function that is called when we *commit* the `AUTH_REQUEST` **mutation** inside of the `AUTH_REQUEST` action. Here's what the mutation looks like:

```js
  [AUTH_REQUEST]: (state) => {
    state.status = 'loading'
  },
```

It simply set the state's status to `loading`. This makes sense for a synchronous **mutation**. This will update the template where we have a `<v-if>` in the `Home` component:

```html
<loading v-if="loading"/>
```

This will display the spinner. We want to display the loading spinner while we wait for our Promise to resolve. Right after we turn on the loading spinner, we call `apiCall({url: 'auth', data: user, method: 'POST'})`.

The `apiCall` function is imported from `utils/api`. This function simulates a `POST` request to a server, and when it is resolved it returns the following:

```js
{ token: 'This-is-a-mocked-token' }
```

So the mock `apiCall` doesn't actually check the username or password. It assumes that whatever we entered is the correct username/password for the mock user.

Then, save this token returned be `apiCall` in `localStorage`. You can view local storage by opening the Chrome developer console's Application tab. Each unqiue domain will have it's own local storage where the key value data pairs can be saved for a given website.

After we set the token in `localStorage`, we see the following:

```js
        // Here set the header of your ajax library to the token value.
        // example with axios
        // axios.defaults.headers.common['Authorization'] = resp.token
```

Let's uncomment this code and set the axios header with the returned token:

```js
        axios.defaults.headers.common['Authorization'] = resp.token
```

Next, we commit the `AUTH_SUCCESS` mutation which does the following:

```js
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success'
    state.token = resp.token
    state.hasLoadedOnce = true
```

Setting the state's status to `success` will remove the loading spinner. Also, we will see the list of Posts displayed:

```html
    <div v-if="isAuthenticated">
      <feed-item v-for="(feed, index) in fakeFeed" :key="index" :feed="feed"/>
    </div>
```

`isAuthenticated` is a computed property in our `Home` component and it is made available by calling:

```js
...mapGetters(['isAuthenticated', 'authStatus']),
```

`mapGetters` is a utility that will allow us to use Vues getters as if they are getters of the `Home` component.

Once again, `isAuthenticated` does the following: `isAuthenticated: state => !!state.token`.

This will return true, because we now have a token in our state, so we will see the posts displayed in the `Home` component.

Now that we have seen a little bit of the authentication process, let's go back to `App.vue` and look at the `created` function:

```js
  created: function () {
    if (this.$store.getters.isAuthenticated) {
      this.$store.dispatch(USER_REQUEST)
    }
  }
```

If the user `isAuthenticated`, we will *`dispatch`* the `USER_REQUEST` **`action`**.

Let's look at the `USER_REQUEST` action:

```js
  [USER_REQUEST]: ({commit, dispatch}) => {
    commit(USER_REQUEST)
    apiCall({url: 'user/me'})
      .then(resp => {
        commit(USER_SUCCESS, resp)
      })
      .catch(resp => {
        commit(USER_ERROR)
        // if resp is unauthorized, logout, to
        dispatch(AUTH_LOGOUT)
      })
  },
```

This makes another mock request, but this time we are making a `GET` request to `user/me`. This will return the following:

```js
  'user/me': { 'GET': { name: 'doggo', title: 'sir' } }
```

Then, we *`commit`* the `UESR_SUCCESS` **`mutation`** (synchronous action). Let's look at the `USER_SUCCESS` mutation:

```js
  [USER_SUCCESS]: (state, resp) => {
    state.status = 'success'
    Vue.set(state, 'profile', resp)
  },
```

This function will set the status to success and then set the state's `profile` value to be the user's profile that is returned by the mock API.

Changing the profile state will change the Navigation bar to display the user's profile information. This is because of the `v-if` on the `<li>` tag in the nav bar:

```html
      <li v-if="isProfileLoaded">
        <router-link to="/account">{{name}}</router-link>
      </li>
```

`isProfileLoaded` is a getter that will react to changes in the global state because we include it in the list we pass to `mapGetters` which is then spread into the component's `computed` property.


```js
      ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded']),
```

There's a lot to unpack with this authentication system, so I won't cover every file and function that plays a role, but it may be helpful if you can think about the process of login in to the site on the browser and think about what should be happening in the code. This will give you a more inuitive understanding of the code. For example. Think about what happens when the user is logged in in one tab and then opens a new tab to the `/accounts` route. Will the user be signed in automatically? How?

Once you have replicated this project in you local machine, make sure that you can log in and log out. Also, open up the `Application` tab in the Chrome developer console and verify that we are saving the mock token to local storage.

Let's pause here and commit our changes.

```
git add .
git commit -m "added mock authentication example from sqreen.io"
```

## Replace mock login API with Django API

Now that we have a functioning mock login system, let's think about what we need to do in order to use the JWT auth system we made previously in Django.

We will want to:

- Replace `apiCall` in `src/utils/api.js` with a `POST` request using `axios`
- Add a protected `/posts` route that we will only be able to see if we are logged in.

### axios

First, let's import axios in `api.js` and create an axios instance:

```js
import axios from 'axios';

// create an axios instance
const service = axios.create({
  baseURL: 'localhost',
})
```

Next we want to add a request interceptor to `service` that will add our token to the request header (if a token exists) before each request is sent out. Here's an example from axios's [github page](https://github.com/axios/axios):

```js
// Add a request interceptor
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });
```

In our code, we can add the following:

```js
import axios from 'axios';
import store from '../store';

const apiCall = axios.create({
  baseURL: 'localhost',
});

// request interceptor
apiCall.interceptors.request.use(
  config => {
    // Do something before each request is sent
    if (store.getters.token) {
      // Attach a token to the header
      config.headers['JWT'] = store.token
    }
    return config
  },
  error => {
    // Do something with the request error
    Promise.reject(error)
  }
)

export default apiCall
```

Now let's use this new `apiCall`. When a user logs in, the login form calls the `login` method. This dispatches `AUTH_REQUEST`. Here's our new `AUTH_REQUEST` in `src/store/modules/auth.js` (with comments):

```js
  [AUTH_REQUEST]: ({commit, dispatch}, user) => { //define `AUTH_REQUEST` action
    return new Promise((resolve, reject) => { // return a Promise
      commit(AUTH_REQUEST) // commit `AUTH_REQUEST` mutation; displays the Loading spinner or message
      apiCall.post( // use our new apiCall
        '/api/auth/obtain_token/', // the login endpoint for our Django backend
        user // this contains { username: "admin", password: "password" }, our form data
      )
      .then(resp => { // response comes back from the backend
        // console.log(resp); // log the output of the response for debuging
        localStorage.setItem('user-token', resp.data.token) // save the token returned in the response to localStorage
        commit(AUTH_SUCCESS, resp) // remove the loading spinner, save the token to our store
        dispatch(USER_REQUEST) // get the logged in user's profile information
        resolve(resp) // resolve the promise
      })
      .catch(err => { // handle a bad request
        // console.log("Incorrect username/password"); // handle a bad password
        console.log(err.status); // log the repsonse
        commit(AUTH_ERROR, err) // set auth status to error
        localStorage.removeItem('user-token') // remove `user-token` from localStorage
        reject(err) // reject the promise
      })
    })
  },
```

Our login form doesn't show any message if we submit an invalid username/password combination, so we will have to handle this later.

One other things to mention is that we have not implemented a user profile, so we don't have anything for `USER_REQUEST`. Recall that `USER_REQUEST` originally made a mock request to get user profile data. We can keep this mocked for now with this:

```js
const actions = {
  [USER_REQUEST]: ({commit, dispatch}) => {
    commit(USER_SUCCESS, {"name":"Brian", "title":"Admin"})
    // apiCall({url: 'user/me'})
    //   .then(resp => {
    //     commit(USER_SUCCESS, resp)
    //   })
    //   .catch(resp => {
    //     commit(USER_ERROR)
    //     // if resp is unauthorized, logout, to
    //     dispatch(AUTH_LOGOUT)
    //   })
  },
}
```

We can come back to this once we implement a user profile. Let's review the changes we made to sqreen.io authentication implementation. We have changed five files:

- `src/components/login/index.vue`
- `src/components/navigation/index.vue`
- `src/store/modules/auth.js`
- `src/store/modules/users.js`
- `src/utils/api.js`

### `src/components/login/index.vue` (1 area to change)

Change `data` to default to `admin`/`password` for the login form:

```js
    data () {
      return {
        username: 'admin',
        password: 'password',
      }
    },
```

### `src/components/navigation/index.vue` (2 areas to change)

Remove `{{ name }}` from the template. I have replaced it with `Welcome`:

```html
      <li v-if="isProfileLoaded">
        <router-link to="/account">Welcome</router-link>
      </li>
```

Remove `name` from computed properties:

```js
    computed: {
      ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded']),
      ...mapState({
        authLoading: state => state.auth.status === 'loading',
        // name: state => `${state.user.profile.title} ${state.user.profile.name}`,
      })
    },
```

### `src/store/modules/auth.js` (3 areas to change)

Replace the original `apiCall` with our new call to the Django backend:

```js
      apiCall.post(
        '/api/auth/obtain_token/',
        user
      )
```

When we set `localStorage`, set the token to `resp.data.token`, not `resp.token`:

```js
        localStorage.setItem('user-token', resp.data.token)
```

Similarly, in `AUTH_SUCCESS`, set token in our state to `resp.data.token`, not `resp.token`:

```js
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success'
    state.token = resp.data.token
    state.hasLoadedOnce = true
  },
```

### `src/store/modules/users.js` (2 areas to change)

Remove the `apiCall` from the `USER_ACTION`, commit the `USER_SUCCESS` *mutation* with mock data and comment out the rest of the function:

```js
const actions = {
  [USER_REQUEST]: ({commit, dispatch}) => {
    commit(USER_SUCCESS, {"name":"User", "title":"Admin"})
    // apiCall({url: 'user/me'})
    //   .then(resp => {
    //     commit(USER_SUCCESS, resp)
    //   })
    //   .catch(resp => {
    //     commit(USER_ERROR)
    //     // if resp is unauthorized, logout, to
    //     dispatch(AUTH_LOGOUT)
    //   })
  },
}
```

Add `state.status = ""` to `AUTH_LOGOUT`:

```js
  [AUTH_LOGOUT]: (state) => {
    state.profile = {},
    state.status = ""
  }
```

### `src/utils/api.js`

Replace the mock API call with our own API to the Django backend using `axios`. Here we also add an interceptor so that each request attaches the token to it's header before it is sent:

```js
import axios from 'axios';
import store from '../store';

/* eslint no-unused-vars: ["error", { "args": "none" }] */
const apiCall = axios.create();

apiCall.interceptors.request.use(
  config => {
    // Do something before each request is sent
    if (store.getters.token) {
      // Attach a token to the header
      config.headers['JWT'] = store.token
    }
    return config
  },
  error => {
    // Do something with the request error
    Promise.reject(error)
  }
)

export default apiCall;
```

At this point we can commit our changes:

```
git add .
git commit -m "integrated our own backend into the sqreen.io authentication example"
```

## Accessing Posts from the VueJS frontend

Now that we have our authentication system in place, we should be able to make requests to protected routes. Let's replace the mock data with `Posts` from our backend.

Let's leave the `fakeFeed` in place for now, and add another tab to the navigation bar that is only visible when the user is logged in. This tab will display a list of our Posts.

To do this, we will need to do the following:

- Add a link to `Posts` in the `navigation` component with a `v-if` directive that is true when the user is logged in
- Modify our existing `Post` component that will fetch posts from our backend and display them with our new `apiCall`
- Add a `getter` method called `getToken` to `src/store/modules/auth.js`
- Add a route that will display a Posts component if the user is authenticated (and will redirect to `/login` if the)
- Modify `apiCall` in `utils/api.js`

Let's start with `src/components/navigation/index.vue`. Add a `router-link` for our posts in the second unordered list:

```html
      <li v-if="isAuthenticated">
        <router-link to="/posts">Posts</router-link>
      </li>
```

This will only be displayed if the user `"isAuthenticated"`.

Now let's add a component that will display posts. In the components folder, create a file called `index.vue`:

```html
<template>
  <div class="home">
    <h3>Posts</h3>
    <div v-for="(post, i) in posts" :key="i">
      <h4>{{ post.title }}</h4>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>

<script>

import apiCall from '@/utils/api';

export default {
  name: 'home',
  data() {
    return {
      posts: [],
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
      fetchPosts(){
          apiCall.get(
            '/api/posts',
            ).then(
          resp => {
            this.posts = resp.data
          }
      ).catch(err=>{
          console.log(err);
          console.log("Handle bad credentials here");
      })
    }
  },
};
</script>
```

In `src/store/modules/auth.js`, add a `getToken` getter method:

```js
const getters = {
  getToken: state => state.token,
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
}
```

Next, open `src/router/index.vue`, and add import the `Posts` component:

```js
import Posts from '../components/posts';
```

Then add a `Posts` route to the list of `routes`:

```js
    {
      path: '/posts',
      name: 'Posts',
      component: Posts,
      beforeEnter: ifAuthenticated,
    },
```

This route will be similar to `/accounts`. It will redirect the use to the `/login` route if the user is noth authenticated.

Finally, let's modify `apiCall` in `utils/api.js`. Use the following:

```js
import axios from 'axios';
import store from '../store';

/* eslint no-unused-vars: ["error", { "args": "none" }] */
const apiCall = axios.create();

apiCall.interceptors.request.use(
  config => {
    // Do something before each request is sent
    if (store.getters.isAuthenticated) {
      // Take the token from the state and attach it to the request's headers
      config.headers.Authorization = `JWT ${store.getters.getToken}`;
    }
    return config
  },
  error => {
    // Do something with the request error
    Promise.reject(error)
  }
)

export default apiCall;
```

There is still more work to do in this login section, but we will come back to this section later.

Let's commit our changes.

```
git add .
git commit -m "enabled posts from backend to be accessed from the Vue frontend"
```

## Using Element UI

At this point let's use some Element UI components to improve the navbar, login form and posts list.

For the navbar, let's use the `NavMenu` component. Replace our navigation bar with this code:

```html
<template>
  <div>
    <el-menu
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
    >
      <el-menu-item
        route="/"
        index="home"
      >
      Home
      </el-menu-item>
      <el-menu-item
        v-if="isAuthenticated"
        index="account"
        route="/account"
      >
      Account
      </el-menu-item>
      <el-menu-item
        v-if="isAuthenticated"
        index="posts"
        route="/posts"
      >
      Posts
      </el-menu-item>
      <el-menu-item
        route="/logout"
        index="logout"
        @click="logout"
        style="float:right;"
        v-if="isAuthenticated"
      >
      Logout
      </el-menu-item>
      <el-menu-item
        index="login"
        route="/login"
        style="float: right;"
        v-if="!isAuthenticated && !authLoading"
      >
      Login
      </el-menu-item>
    </el-menu>
  </div>
</template>
```

Next, let's use `el-form` component to replace our login form in `components/login/index.vue`:

```html
<template>
  <div>
    <h1>Sign In</h1>
    <el-form v-loading="loading">
      <el-input :value="username"></el-input>
      <el-input type="password" :value="password"></el-input>
      <el-button
        style="float: right;"
        type="primary"
        @click.native.prevent="login"
      >
        Login
      </el-button>
    </el-form>
  </div>
</template>
```

We also need to import `mapGetters` from `vuex`:

```js
  import { mapGetters } from 'vuex';
```

Finally, add the following `computed` property that will make use of `mapGetters`:

```js
    computed: {
      ...mapGetters(['isAuthenticated', 'authStatus']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      }
    }
```

For styling, add the following to the end of `components/login/index.vue`:

```html
<style>
  .login {
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 10px;
  }
  .el-input {
    margin-bottom: 5px;
  }
</style>
```

Let's commit our changes:

```
git add .
git commit -m "used element UI componenets for navigation and form"
```

## Posts table

Let's improve the way we are displaying our posts, and also add the ability to update and delete posts. We can use the `el-table` component which will allow us to easily create a table where our posts will be displayed.

Here's an overview of the functionality we will add:

- display the post `id`, `title`, `content`, `created_at` and `updated_at` fields in columns
- customize the text of the column headers
- format the `created_at` and `updated_at` fields to display the date and time in the format of
`MM/DD/YYYY HH:MM:SS`
- By default, display 10 posts at a time, and let the user click through pages of posts, and also let the user set the number of posts that display at one time.
- Let the user sort the posts by `id`, `title`, `content`, `created_at` and `updated_at` fields. Changing the ordering will make a new request to the backend.
- Each row in the table will have a two buttons that that will allow the user to `edit` or `delete` the post on the given row.
- The delete button will present a confirmation box that the user must click on to delete the given post.
- When a post is update or delete, update the user with a message the displays at the top of the screen.

Here's the single file component, `src/components/posts/index.vue`:

```html
<template>
  <div class="home">
    <h3>Posts</h3>
    <el-table
      border
      fit
      stripe
      v-loading="loading"
      :data="posts"
      @sort-change="sortChange"
      style="width: 100%">
      <el-table-column
        class="selection-col"
        fixed="left"
        type="selection">
      </el-table-column>
      <el-table-column
        fixed="left"
        label="ID"
        prop="id"
        sortable="custom"
        width="100">
          <template slot-scope="scope">
            <el-button>
              {{ scope.row.id }}
            </el-button>
          </template>
      </el-table-column>
      <el-table-column
        label="Title"
        prop="title"
        max-width="400"
        min-width="100"
        sortable="custom">
      </el-table-column>
      <el-table-column
        fit
        label="Content"
        prop="content"
        sortable="custom">
      </el-table-column>
      <el-table-column
        fit
        label="Created On"
        prop="created_at"
        sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.created_at | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        fit
        label="Updated On"
        prop="updated_at"
        sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.updated_at | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        prop="id"
        width="180">
        <template slot-scope="scope">
          <div class="actions">
            <el-button
              @click="handleEdit(scope.row)"
              icon="el-icon-edit"
              type="primary">
            </el-button>
            <el-button
              @click="handleDelete(scope.row.id)"
              icon="el-icon-delete"
              type="danger">
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      :page-size="paginationLimit"
      class="pagination"
      @current-change="change_page"
      :current-page.sync="listQuery.page"
      @size-change="handlePaginationSizeChange"
      :page-sizes="[5, 10, 20, 50, 100, 200, 300, 500, 1000]"
      layout="sizes, prev, pager, next, total"
      :total="count">
    </el-pagination>

    <el-dialog title="Edit Post" :visible.sync="dialogFormVisible">
      <el-form @keypress.enter.prevent="updatePost" v-loading="post_form_loading" :model="form">
        <el-form-item label="Title" :label-width="formLabelWidth">
          <el-input
            @keypress.enter.prevent="updatePost"
            v-model="form.title"
            autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item
          label="Content"
          :label-width="formLabelWidth">
          <el-input
            @keypress.enter.prevent="updatePost"
            v-model="form.content"
            placeholder="Please select a zone"
            type="textarea">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updatePost">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import apiCall from '@/utils/api';

export default {
  name: 'home',
  data() {
    return {
      post_form_loading: false,
      form: {},
      loading: true,
      posts: [],
      count: 0,
      paginationLimit: 10,
      listQuery: {
        page: 1,
      },
      ordering: [],
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        id: null,
        title: '',
        content: '',
      },
      formLabelWidth: '120px'
    };
  },
  mounted() {
    this.fetchPosts();
  },
  computed: {
    params: function () {
      return {
        limit: this.paginationLimit,
        offset: (this.listQuery.page - 1) * this.paginationLimit,
        ordering: this.ordering.join(','),
      };
    }
  },
  filters: {
    formatDate(d){
      const today = new Date(d);
      const time = today.toTimeString('en-US').split(' ')[0];
      const date = today.toLocaleDateString('en-US').split(' ')[0];
      return date + ' ' + time;
    }
  },
  methods: {
    handlePaginationSizeChange(value){
      this.paginationLimit = value;
      this.fetchPosts();
    },
    updatePost(){
      apiCall.patch(`api/posts/${this.form.id}/`, {
          'title':this.form.title,
          'content':this.form.content,
        })
        .then(_ => {
          this.dialogFormVisible = false;
          this.$message(`Post ${this.form.id} updated!`)
          this.fetchPosts();
        }
      ).catch((err) => {
        console.log(err);
      })
    },
    sortChange(c){
      this.ordering = [];
      const order = c.order == 'ascending' ? '' : '-';
      const prop = c.prop;
      const newOrder = order + prop;
      this.ordering.push(newOrder);
      this.fetchPosts();
    },
    handleEdit(post){
      this.dialogFormVisible = true;
      this.form.id = post.id;
      this.form.title = post.title;
      this.form.content = post.content;
    },
    handleDelete(id){
      this.$confirm(`Delete post ${id}?`)
        .then(_ => {
          apiCall.delete(`api/posts/${id}/`)
            .then(_ => {
              this.$message(`Post ${id} deleted.`);
              this.fetchPosts();
              }
            ).catch(
              this.$message(`Post ${id} not deleted.`)
            )
          }
        )
        .catch(_ => {
          this.$message(`Post ${id} not deleted.`);
        });
      this.fetchPosts();
    },
    change_page(){
      this.fetchPosts();
    },
    fetchPosts() {
      this.loading = true;
      apiCall.get(
        '/api/posts', {
          params: this.params,
        }
      ).then(
        resp => {
          this.posts = resp.data.results;
          this.count = resp.data.count;
          this.loading = false;
        }
      ).catch(err => {
        console.log(err);
        console.log('Handle bad credentials here');
    });
    },
  },
};
</script>

<style>
.el-table, .cell {
  word-break:normal !important;
}
.actions{
  text-align: center;
}
.home {
  width: 90%
}
.pagination {
  margin-top:20px
}
.selection-col {
  text-align: center;
}
</style>
```

To make this work, we need to make a few changes to our backend:

- Create a `PostViewSet` class that subclasses from `viewsets.ModelViewSet`. This will provide us with a standard set of create/retrieve/update/destroy style actions.

- Register the `PostViewSet` to our our `urlpatterns` for the `posts` app.

- Create a `PostList` view that we will use to provide data for our `el-table` component.

- Add this `PostList` view to `urlpatterns`.

- Update our `REST_FRAMEWORK` defaults in `settings.py`

First, let's update `REST_FRAMEWORK` settings. It should now look like this:

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.LimitOffsetPagination',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
    ),
}
```

We added:

```python
    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.LimitOffsetPagination',
```

This will provide pagination for our `PostList` view, which we will define as this:

*`backend/posts/views.py`*

```python
# imports
from rest_framework import filters

...

class PostList(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = (
        filters.OrderingFilter,
    )
    ordering_fields = '__all__'
```

We added `filter_backends` and `ordering_fields` properties which will allow us to sort our posts on the frontend.

In the same file, let's add the `PostViewSet`:

```python
# imports
from rest_framework import viewsets

...

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

This is an efficient way to include `GET`, `PATCH` and `DELETE` HTTP request methods for our `Post` data.

Now, let's hook these views up to our `urlpatterns`. Here is the new `urls.py` file for out `posts` app:

*`backend/posts/urls.py`*

```python
from . import views
from django.urls import path
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'posts', views.PostViewSet)

# the router will match this /posts first
urlpatterns = [
    path('posts/', views.PostList.as_view(), name='posts'),
]
# registers list, create, retrieve, update, partial_update
# and destroy
# https://www.django-rest-framework.org/api-guide/routers/#simplerouter
urlpatterns += router.urls
```

We could continue to add additional features to our table. Here are some ideas:

- Text search for `title` and `content` fields
- Add calendar widgets to let the user filter by `created_at` and `updated_at`
- Adding a Boolean field to our `Post` model such as `published`, and allow the user to filter by published, unpublished or all posts.
- Add a many to many relationship to our `Post` model such as a `Category` or `Tag` model (or both), and allow the user to filter by a posts categories or tags.

Here are some additional features we could add to the table:

- Export filtered and sorted data to Excel/CSV/PDF
- Bulk upload Posts through CSV, Excel files
- Bulk actions such as deleting multiple selected posts

We can add these features later. For now let's step back and think about what we currently have in this project and also think about what area we can work on next.

## Recap

We have two environments that are defined by our two `docker-compose` files:

- `docker-compose.yml` (8 containers)
- `docker-compose.dev.yml` (7 containers)

We have a `backend` container for our Django API that handles authentication and API resources that are saved in the `db` container that runs a Postgres server where our application data is stored.

Our Django application also does asynchronous processing with which runs in a separate container. This container looks for messages in the `redis` container which serves as our message queue. The `backend` container passes serialized messages to our queue. What exactly are messages? Messages are functions with arguments that are registered in our Django application as celery tasks.

The `celery` container is essentially a clone of our Django application, but instead of running `runserver` or `gunicorn` it runs celery. This command looks for messages that enter the queue and it processes these messages by executing the functions with the arguments they are passed. We can observe this process in `flower`, another container that acts as a celery monitoring tool.

We have a `frontend` container that is only used for local development. This runs the development server for our VueJS application. It takes care of hot-reloading, so we can see our changes take place on the browser immediately on each save.

In production we use a multi-stage build process to build the production-ready static files that make up our Vue application, and we add these files to the `nginx` container which serves them (`index.html`, `javascript` and `css` files).

The VueJS application uses `axios` to make HTTP requests to our Django API. `nginx` routes any request that starts with `/api` to the Django application.

`nginx` also routes traffic starting with `/admin` to Django so that we can access the Django admin. `/flower` and `/portainer` are also mapped to their respective containers so we can map both celery tasks and docker containers, volumes and networks that make up our application.

Our development workflow uses GitLab to handle continuous integration. Each time we push code to GitLab, the `gitlab-ci.yml` initiates the CI pipeline which runs automated tests, code linting and it also generates a code coverage report that GitLab captures to show how much of our code is tested.

That's a high-level overview of what we have put together so far. Here are the next areas I would like to work on:

### Django/Backend

- Implement a custom User model with AbstractBaseUser. Many interesting starter projects I have seen tend to start with this type of user model. To extend the user model I typically create a OneToOne relationship between the User model and Profile model with any additional data I would like to store on the user. This will give us a finer level of control for customizations we might want to add to our user model later, such as permissions.
- Implemented functional tests with Selenium. I will also need to figure out how to run these tests in GitLab. From what I have seen, there are several ways to implement this and I'm not sure which way will be the most appropriate for this project.
- Add more complex models and model relationships, demonstrate how to use the Postgres JSON field
- Implement multi-tenancy using `django-tenant-schemas`. I would like to be able to create new instances of the site that will be available at subdomains.
- Use media for storing user profile images and other types of file data, such as CSV or Excel files.
- `wait-for-it.sh`: Several similar projects using docker and Django use a `wait-for-it.sh` script to help with container startup. These are usually fairly lengthy bash scripts that I have not yet had time to look into, but I haven't seen any reason so far as to why I would need to implement `docker-compose` in this way.

### VueJS/Frontend

- I quickly implemented the Element UI navigation menu, but I have found that the active tab of the navigation menu does not stay in sync with the current route when the browser's back button and forward buttons are pressed.
- **Testing**: I have configured Jest and Nightwatch for testing, but I haven't used these yet. Also, I would need to add these tests to GitLab CI.
- **Linting**: I planned to use Airbnb javascript linting, but it is hard to stay on top of these rules, so I basically gave up by adding `/* eslint-disable */` to all of my `.js` and `.vue` files.
- Work with file uploads. For example, I would like to allow users to upload profile images that will be displayed in the navigation menu.
- **Vuex**: I am only using Vuex for authentication, which is based on an example I found from sqreen.io. I would like to use Vuex for more parts of the application.
- **Nuxt**: I hear about Nuxt everywhere in the Vue community. I've tried it and I like the ideas behind it. I don't want to make this project more complicated than it needs to be, but using Nuxt and doing server-side rendering is on my radar for new things to add to this project.
- **Responsiveness**: The Element UI framework is not a mobile-first component library, so there is some extra work that I would need to do to make the experience for this application on mobile. I would like to use CSS grid for the layout rather than using the row/column system that Element UI supports.

### NGINX/Webserver

- **HTTPS**: I haven't implemented HTTPS yet. I am trying to implement automated certificate renewal using Let's Encrypt and Certbot. I have also been considering using `traefik`, a new reverse-proxy written in Go that is well suited for use with docker, microservices and container orchestration tools.

### GitLab/CI/CD/Deployment

I'm really happy with GitLab so far, and I would like to focus more on how I can use it to automate deployments to staging and production environments.

I have deployed this project on DigitalOcean by manually installing and running `docker-compose`. I still have lots to learn about the various options for deployment. I have experience with Digital Ocean, Heroku and AWS. There are interesting managed container services from Amazon and Google. Before going into depth on any one option, I would like to better understand the pros and cons of each option for various use cases: personal projects, projects for work, etc.

- `docker-in-docker`: I have seen lot's of CI/CD setups that use `docker-in-docker` and `docker-compose` for CI. This seems like a better approach than testing individual containers, and it should simplify the implementation of functional testing with selenium, and the integration of various containers used in my application.

### License

I need to research which type of license to add to this project, and how to include the licenses of various open source tools I have used.

From what I have read, I should include an MIT License that references the other MIT License authors or project names.