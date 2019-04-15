#!/bin/bash

CONTEXT=$1
IMAGE=$2
TAG=`node -e 'process.stdout.write(require(process.argv[1]).version)' ./$CONTEXT/package.json`

docker pull $IMAGE:$TAG

if [ $? == 0 ]; then
  echo "Image exists. Not going to do anything."
  exit 0
fi

docker build -t $IMAGE:$TAG --cache-from $IMAGE:latest-tag $CONTEXT && \
docker tag $IMAGE:$TAG $IMAGE:latest-tag

if [ $? != 0 ]; then
  EXIT_CODE=$?
  echo "Docker build failed!"
  exit $EXIT_CODE
fi

docker push $IMAGE:latest-tag && \
docker push $IMAGE:$TAG

if [ $? != 0 ]; then
  EXIT_CODE=$?
  echo "Docker push failed!"
  exit $EXIT_CODE
fi

echo "Redeploying..."

oc rollout latest operator-test -n mydata
oc rollout latest cv-test -n mydata
