#!/usr/bin/env bash

docker run -it \
  --link tweedentity-redis:redis \
  --rm redis redis-cli -h redis -p 6379
