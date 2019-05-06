#!/bin/bash

CONTEXT=$1
IMAGE=$2
TAG=`node -e 'process.stdout.write(require(process.argv[1]).version)' ./$CONTEXT/package.json`
CACHE_PATH="~/.cache/docker/test/${IMAGE/\//_}"

DOCKERFILE=""
if [ ! -z "$3" ]; then
  DOCKERFILE="-f $3"
fi

docker load -i "$CACHE_PATH/$TAG.tar" || true
docker pull $IMAGE:$TAG

if [ $? == 0 ]; then
  echo "Image exists. Not going to do anything."
  exit 0
fi

docker build -t $IMAGE:$TAG --cache-from $IMAGE:latest-tag $CONTEXT $DOCKERFILE && \
docker tag $IMAGE:$TAG $IMAGE:latest-tag
EXIT_CODE=$?

if [ $EXIT_CODE != 0 ]; then
  echo >&2 "Docker build failed!"
  exit $EXIT_CODE
fi

docker push $IMAGE:latest-tag && \
docker push $IMAGE:$TAG
EXIT_CODE=$?

if [ $EXIT_CODE != 0 ]; then
  echo >&2 "Docker push failed!"
  exit $EXIT_CODE
fi

echo "Cache $IMAGE:$TAG"
rm -fr "$CACHE_PATH/*"
mkdir -p "$CACHE_PATH"
docker save $IMAGE:$TAG -o "$CACHE_PATH/$TAG.tar"
