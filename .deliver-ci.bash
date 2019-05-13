#!/bin/bash

CONTEXT=$1
IMAGE="$2"

DOCKERFILE=""
if [ ! -z "$3" ]; then
  DOCKERFILE="-f $3"
fi
CACHE_DIR="$HOME/.cache/docker/${IMAGE/\//_}"

docker load -i "$CACHE_DIR/latest.tar" || true
docker pull $IMAGE

docker build -t $IMAGE --cache-from $IMAGE $CONTEXT $DOCKERFILE && \
docker push $IMAGE

EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo >&2 "Docker build or push failed!"
  exit $EXIT_CODE
fi

echo "Save cache $CACHE_DIR/latest.tar"
mkdir -p "$CACHE_DIR"
docker save $IMAGE:latest -o "$CACHE_DIR/latest.tar"
