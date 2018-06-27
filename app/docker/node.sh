#!/usr/bin/env bash

docker stop tweedentity-app-debug
docker rm tweedentity-app-debug

docker stop tweedentity-app
docker rm tweedentity-app

source ../.default.env && docker run -d \
  --name tweedentity-app \
  --link tweedentity-redis:redis \
  -p 9095 \
  --restart unless-stopped \
  -v $PWD:/usr/src/app \
  -v /vol/log/tweedentity_app:/var/log/tweedentity_app \
  -e INFURA_ID=$INFURA_ID \
  -e ETHERSCAN_TWEEDENTITY_API_KEY=$ETHERSCAN_TWEEDENTITY_API_KEY \
  -e NODE_ENV=production \
  -e VIRTUAL_HOST=tweedentity.com,www.tweedentity.com,com,app.tweedentity.com,dapp.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com,app.tweedentity.com,dapp.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -w /usr/src/app node:carbon npm run start

