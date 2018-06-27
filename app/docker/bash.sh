#!/usr/bin/env bash

host=tweedentity-app

if [[ $1 != '' ]]; then
  host=$1
fi

docker exec -it $host bash
