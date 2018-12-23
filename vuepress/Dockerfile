FROM node:alpine
WORKDIR /app/
COPY ./vuepress/package.json .
COPY ./vuepress/start.sh .
COPY ./vuepress/docs .
EXPOSE 8082
EXPOSE 8002
RUN ls -al
RUN pwd