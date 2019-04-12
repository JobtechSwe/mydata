#!/bin/bash

CONTEXT=$1
IMAGE="$2:latest"

docker pull $IMAGE
docker build -t $IMAGE --cache-from $IMAGE $CONTEXT
docker push $IMAGE