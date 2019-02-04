FROM python:3.6.8-alpine3.8
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
RUN mkdir /code
RUN apk add postgresql-dev
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
COPY scripts/start*.sh /
ADD . /code/
CMD ["sh", "start_prod.sh"]