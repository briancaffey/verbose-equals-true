---
home: true

tagline: Documentation for Verbose Equals True
actionText: Get Started →
actionLink: start/overview/
features:
- title: Free and Open Source
  details: Everything in this project is and always will be free and open source. There is no premium content, paywall or credit card required.
- title: Detailed Explanations
  details: This project aims to have verbose explanations for the code, design decisions and best practices that are used in it's development.
- title: Beginner Friendly
  details: This project aims to be accessible to people with all levels of skill.
footer: MIT Licensed | Copyright © 2018-present Brian Caffey
---

### Quick Start

To run the development version of this application on your computer, you must have `docker` and `docker-compose` installed on your machine. With these programs installed, run the following command:

```sh
docker-compose -f docker-compose.dev.yml up --build
```

### What

`verbose-equals-true` is an open source web application that is built with several popular open source projects including Django, VueJS, Docker, NGINX and [more](https://verbose-equals-true.tk/about/technologies). The goal of this project is to demonstrate how these technologies can be used together to form a modern, productive and enjoyable technology stack.

This is not a project generator or template. Rather, it is a fully implemented application demonstrates typical features of web applications.

Here's a quick analogy that will help you understand the main goals of `verbose-equals-true`: rather than teach you how to paint a painting, this project will teach you how to set up your easel, how to mix your paints, how to clean and put away your brushes. I'll also show you how to frame your finished work, hang it on a wall for people to enjoy and protect it from art thieves. This project leaves the canvas mostly blank, but does offer examples, suggestions and techniques for common things you'll find in most paintings such as sky, water, human faces, animals or fruit.

In practical terms, this project will be heavily focused on initial setup, workflow, development, operations, and security. I will illustrate how to do [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete), user authentication, reverse proxies, databases, etc.

You are currently reading an in-depth guide that explains everything about this project.

### Where

The source code for this project is hosted for free on [`GitLab`](https://gitlab.com/briancaffey/verbose-equals-true). Code for this project runs on a [Digital Ocean](https://www.digitalocean.com/) [Droplet](https://www.digitalocean.com/products/droplets/) that costs $5/month. The site is available at [http://verbose-equals-true.tk](http://verbose-equals-true.tk). `.tk` is the registry for the Government of [Tokelau](https://en.wikipedia.org/wiki/Tokelau), a country in the South Pacific. So far, most of the code for this project has been written in Philadelphia.

### Who

This project currently only has one contributor: [Brian Caffey](https://gitlab.com/briancaffey/verbose-equals-true). I'm a software engineer who enjoys learning and sharing my experiences with different technologies. If you are interested in contributing to this project, I highly encourage you to do so! Detailed instructions on how to contribute to this project can be found [here](https://gitlab.com/briancaffey/verbose-equals-true/blob/master/CONTRIBUTING.md).

### How

I built this project on a Lenovo ThinkPad with the Ubuntu 16.04 LTS (Xenial Xerus) operating system. Although the project uses many different technologies, I use `docker` to develop and run the various parts of the application in containers. Containers are isolated environments that are packaged with the software packages they need in order to run. A visual overview of the containers used in this project can be found [here](https://verbose-equals-true.tk/about/architecture).

All of the code for this project was written using a program called Visual Studio Code, an open source project developed by Microsoft (it runs on Windows, Linux and macOS). The development work-flow I use while working on this project is a big part of what this project aims to make clear, so it will be covered in-depth in the [`guide`](/guide/project-setup/).

This project incorporates many of the lessons and techniques I have learned from reading documentation, surveying similar open source projects, reading blogs, going to tech meetups and talking with really smart software engineers. Most of the work in putting this project together has been done in my free time. While I have made my best effort to document everything I have done, there will always be areas in the documentation that could be further explained. I'm committed to continually improving the both the code and documentation for this project.

### Why

There are lots of reasons why I am working on this project. Primarily, I started this project to teach myself things I don't know in a way that I can get help and feedback from others.

The original motivation for starting this project came out of frustration from working on a poorly documented project with overly complex, homegrown processes for local development and deployment. While I love how writing software lends itself to creativity and original thinking, I think that a herd animal mentality is extremely important for selecting tools, languages, frameworks and workflows, especially when it comes to the productivity and happiness of software engineering teams.

Every software engineer has a different set preferences for tooling, style and development patterns. My goal with this project is not to say that my set of preferences is better than any other set of preferences; it is to demonstrate a **complete** set of preferences clearly and thoroughly.

### When

I started working on this project in the fall of 2018. Software engineering and web development are notorious for moving rapidly. Not only do trends move rapidly, but multiple trends move rapidly in *different directions*.

### Get started

If you are interested and want to learn more, [start here](start/overview/).

### Thank you

Thank you for taking time to read about this project.