# build stage
FROM node:10.14.2-jessie as build-stage
WORKDIR /app/
COPY frontend/package.json /app/
RUN npm cache verify
RUN npm install
COPY frontend /app/
RUN npm run build

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY nginx/prod/prod.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist /dist/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
