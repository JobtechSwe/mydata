#!/bin/bash

CONTEXT=$1
IMAGE="$2:latest"

DOCKERFILE=""
if [ ! -z "$3" ]; then
  DOCKERFILE="-f $3"
fi

docker load -i "docker/$IMAGE-latest.tar" || true
docker pull $IMAGE

docker build -t $IMAGE --cache-from $IMAGE $CONTEXT $DOCKERFILE && \
docker push $IMAGE

if [ $? != 0 ]; then
  EXIT_CODE=$?
  echo "Docker build or push failed!"
  exit $EXIT_CODE
fi

echo "Redeploying..."

oc rollout latest cv-ci -n mydata
oc rollout latest operator-ci -n mydata

echo "Cache $IMAGE:latest"
docker save $IMAGE:latest -o "docker/$IMAGE-latest.tar"