FROM node:14

ENV METEOR_ALLOW_SUPERUSER=true
ENV ROOT_URL="http://0.0.0.0:3000"

RUN curl "https://install.meteor.com/" -k | sh

WORKDIR /usr/src/app/meteor
COPY package*.json ./
COPY file_e00cf25ad42683b3df678c61f42c6bda.txt /

RUN meteor npm install

EXPOSE 3000
CMD ["meteor"]