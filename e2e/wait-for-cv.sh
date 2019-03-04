#!/bin/sh

echo -n "Waiting for cv to get ready..."

while true; do
  MEOW=`curl -sL -w "%{http_code}" -I "http://localhost:4001/health" -o /dev/null`
  echo -n .
  if [ "$MEOW" = "200" ]; then
    echo
    exit 0
  fi

  sleep 1
done

