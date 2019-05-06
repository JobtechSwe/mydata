#!/bin/bash

CONTEXT=$1
IMAGE="$2"

DOCKERFILE=""
if [ ! -z "$3" ]; then
  DOCKERFILE="-f $3"
fi

docker load -i "~/.cache/docker/$IMAGE-latest.tar" || true
docker pull $IMAGE

docker build -t $IMAGE --cache-from $IMAGE $CONTEXT $DOCKERFILE && \
docker push $IMAGE

EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo >&2 "Docker build or push failed!"
  exit $EXIT_CODE
fi

echo "Cache $IMAGE:latest"
mkdir -p "~/.cache/docker/jobtechswe"
docker save $IMAGE:latest -o "~/.cache/docker/$IMAGE-latest.tar"
