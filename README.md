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
