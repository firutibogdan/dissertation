FROM node:14

RUN apt update
RUN apt upgrade -y
RUN apt install -y curl

RUN curl -L -o elm.gz https://github.com/elm/compiler/releases/download/0.19.1/binary-for-linux-64-bit.gz
RUN gunzip elm.gz
RUN chmod +x elm
RUN mv elm /usr/local/bin/

WORKDIR /usr/src/app/elm

RUN npm install elm-live
RUN npm install commander

EXPOSE 8000

CMD ["./node_modules/elm-live/bin/elm-live.js", "src/Main.elm", "--host=0.0.0.0", "--proxy-prefix=/api", "--proxy-host=http://clojure-api:3000"]