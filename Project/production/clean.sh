#!/bin/bash

docker stop python-api > /dev/null 2>&1
docker stop vue-ui > /dev/null 2>&1
docker stop elm-ui > /dev/null 2>&1
docker stop express-api > /dev/null 2>&1
docker stop clojure-api > /dev/null 2>&1
docker stop db > /dev/null 2>&1

pyt=$(docker container ls -a | grep "python-api" | sed 's/  */ /g' | cut -d' ' -f1)
vue=$(docker container ls -a | grep "vue-ui" | sed 's/  */ /g' | cut -d' ' -f1)
elm=$(docker container ls -a | grep "elm-ui" | sed 's/  */ /g' | cut -d' ' -f1)
exp=$(docker container ls -a | grep "express-api" | sed 's/  */ /g' | cut -d' ' -f1)
clj=$(docker container ls -a | grep "clojure-api" | sed 's/  */ /g' | cut -d' ' -f1)
db=$(docker container ls -a | grep "db" | sed 's/  */ /g' | cut -d' ' -f1)

docker container rm $pyt > /dev/null 2>&1
docker container rm $vue > /dev/null 2>&1
docker container rm $elm > /dev/null 2>&1
docker container rm $exp > /dev/null 2>&1
docker container rm $clj > /dev/null 2>&1
docker container rm $db > /dev/null 2>&1

pyt=$(docker image ls -a | grep "python-api" | sed 's/  */ /g' | cut -d' ' -f3)
vue=$(docker image ls -a | grep "vue-ui" | sed 's/  */ /g' | cut -d' ' -f3)
elm=$(docker image ls -a | grep "elm-ui" | sed 's/  */ /g' | cut -d' ' -f3)
exp=$(docker image ls -a | grep "express-api" | sed 's/  */ /g' | cut -d' ' -f3)
clj=$(docker image ls -a | grep "clojure-api" | sed 's/  */ /g' | cut -d' ' -f3)
db=$(docker image ls -a | grep "db" | sed 's/  */ /g' | cut -d' ' -f3)

docker image rm $pyt > /dev/null 2>&1
docker image rm $vue > /dev/null 2>&1
docker image rm $elm > /dev/null 2>&1
docker image rm $exp > /dev/null 2>&1
docker image rm $clj > /dev/null 2>&1
docker image rm $db > /dev/null 2>&1

exit 0
