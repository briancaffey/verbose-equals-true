#!/bin/bash

# https://docs.npmjs.com/cli/cache
npm cache verify

# install project dependencies
npm install

# build vuepress files
yarn run docs:build

npm ls

pwd

ls

yarn add http-server

# run the development server
http-server /app/docs/.vuepress/dist -p 8002