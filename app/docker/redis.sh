#!/usr/bin/env bash

docker run \
  --name tweedentity-redis \
  --restart unless-stopped \
  -v /vol/data/tweedentity-redis:/data \
  -d redis redis-server --appendonly yes

