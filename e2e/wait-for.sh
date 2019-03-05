#!/bin/bash

echo $0
echo $1
echo -n "Waiting for $1 to get ready..."

while true; do
  STATUS_CODE=`curl -sL -w "%{http_code}" -I "$1" -o /dev/null`
  echo -n .
  if [ "$STATUS_CODE" = "200" ]; then
    echo
    exit 0
  fi

  sleep 1
done

