FROM node:10

ENV METEOR_ALLOW_SUPERUSER=true
ENV ROOT_URL="http://0.0.0.0:3000"

RUN curl "https://install.meteor.com/" | sh

WORKDIR /usr/src/app/meteor
COPY package*.json ./

RUN meteor npm install

EXPOSE 3000
CMD ["meteor"]