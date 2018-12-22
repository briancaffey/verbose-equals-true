FROM node:alpine
WORKDIR /app/
COPY ./vuepress/package.json .
COPY ./vuepress/docs/ ./docs/
EXPOSE 8082
EXPOSE 8002
RUN npm install
RUN yarn run docs:build