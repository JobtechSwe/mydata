#!/bin/bash

CONTEXT=$1
IMAGE=$2
TAG=`node -e 'process.stdout.write(require(process.argv[1]).version)' ./$CONTEXT/package.json`

docker pull $IMAGE:$TAG

if [ $? == 0 ]; then
  echo "Image exists. Not going to do anything."
  exit 0
fi

docker build -t $IMAGE:$TAG --cache-from $IMAGE:latest-tag $CONTEXT
docker push $IMAGE:$TAG

docker tag $IMAGE:$TAG $IMAGE:latest-tag
docker push $IMAGE:latest-tag

- oc rollout latest cv-test -n mydata
- oc rollout latest operator-test -n mydata