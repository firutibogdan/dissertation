FROM node:14

WORKDIR /usr/src/app/express

COPY package*.json ./
COPY file_e00cf25ad42683b3df678c61f42c6bda.txt ./

RUN npm install

EXPOSE 3080

CMD ["npm", "run", "dev"]