# Start Here

## High Level Overview

Let's start with a high level overview of what this documentation will cover.

### A simple, easily reproducible development environment

We need to be able to get to work quickly. New developers need to be able to start working as soon as possible. There should be minimal "maintenance" or "tricks" involved with making changes to any part of the application.

If a developer's computer is lost or damaged, the developer should able to be back up on another machine in as little time as possible.

### One command to start the project locally for development

When a developer starts working on this project, there should **one command** that runs the project locally where changes to the code are reflected in the local application.

### Continuous Integration

As multiple developers start working on different parts of the project at the same time, they should be able to verify that changes they introduce to the codebase pass automated tests that run both logical tests and code formatting tests.

### Clear, logical separation of project components

As the project grows in size, the directory structure should help to separate each part of the project into logical subsections.

### Well defined procedures for common development tasks

The project will document how common tasks should be done. Examples include adding dependencies to different parts of the application (`node`, `python`, etc.), adding database tables, fields and migrations. The git workflow and branch-naming conventions should also be well defined and made clear.