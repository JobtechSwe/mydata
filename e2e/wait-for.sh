#!/bin/sh

echo $0
echo $1
printf "Waiting for $1 to get ready..."

while true; do
  STATUS_CODE=`curl -sL -w "%{http_code}" -I "$1" -o /dev/null`
  printf .
  if [ "$STATUS_CODE" = "200" ]; then
    echo
    exit 0
  fi

  sleep 1
done

