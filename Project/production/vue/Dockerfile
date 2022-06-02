FROM node:14

WORKDIR /usr/src/app/vue

COPY package*.json ./

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "serve"]