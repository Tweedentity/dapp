#!/usr/bin/env bash

git pull
(cd app && npm run build && docker/node.sh)

