#!/bin/bash

# https://docs.npmjs.com/cli/cache
npm cache verify

# install project dependencies
npm install

npm install -D @vuepress/plugin-google-analytics @vuepress/plugin-pagination @vuepress/last-updated@next

# build vuepress files
yarn run docs:build

yarn add http-server

# serve static files with http-server
npm start