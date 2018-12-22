#!/bin/bash

# build vuepress files
yarn run docs:build

# https://docs.npmjs.com/cli/cache
npm cache verify

# install project dependencies
npm install

# run the development server
http-server /app/docs/.vuepress/dist -p 8002