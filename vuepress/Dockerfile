FROM node:alpine
WORKDIR /app/
COPY ./vuepress/package.json .
COPY ./vuepress/start.sh .
RUN mkdir docs
COPY ./vuepress/docs ./docs
EXPOSE 8082
EXPOSE 8002
RUN ls -al
RUN pwd