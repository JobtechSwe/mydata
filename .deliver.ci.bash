#!/bin/bash

CONTEXT=$1
IMAGE="$2:latest"

DOCKERFILE=""
if [ ! -z "$3" ]; then
  DOCKERFILE="-f $3"
fi

docker load -i "docker/$IMAGE-latest.tar" || true
docker pull $IMAGE

docker build -t $IMAGE --cache-from $IMAGE $CONTEXT $DOCKERFILE
docker push $IMAGE

oc rollout latest cv-ci -n mydata
oc rollout latest operator-ci -n mydata

echo "Cache $IMAGE:latest"
docker save $IMAGE:latest -o "docker/$IMAGE-latest.tar"