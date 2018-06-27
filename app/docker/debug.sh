#!/usr/bin/env bash

docker stop tweedentity-app-debug
docker rm tweedentity-app-debug

docker stop tweedentity-app
docker rm tweedentity-app

source ../.default.env && docker run -it \
  --name tweedentity-app-debug \
  --link tweedentity-redis:redis \
  -p 9095 \
  -v $PWD:/usr/src/app \
  -v /vol/log/tweedentity_dapp:/var/log/tweedentity_dapp \
  -e INFURA_ID=$INFURA_ID \
  -e ETHERSCAN_TWEEDENTITY_API_KEY=$ETHERSCAN_TWEEDENTITY_API_KEY \
  -e VIRTUAL_HOST=tweedentity.com,www.tweedentity.com,app.tweedentity.com,dapp.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com,app.tweedentity.com,dapp.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -w /usr/src/app node:carbon npm run start

