FROM node:10

WORKDIR /usr/src/app/angular

COPY package*.json ./

RUN npm install

EXPOSE 4200

CMD ["npm", "run", "start"]