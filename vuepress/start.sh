#!/bin/bash

# https://docs.npmjs.com/cli/cache
npm cache verify

# install project dependencies
npm install

# build vuepress files
yarn run docs:build

yarn add http-server

# serve static files with http-server
npm start