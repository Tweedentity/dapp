#!/usr/bin/env bash

docker stop qabra-app-debug
docker rm qabra-app-debug

docker stop qabra-app
docker rm qabra-app

source ../.default.env && docker run -it \
  --name qabra-app-debug \
  --link tweedentity-redis:redis \
  -p 9095 \
  -v $PWD:/usr/src/app \
  -v /vol/log/qabra_dapp:/var/log/qabra_dapp \
  -e INFURA_ID=$INFURA_ID \
  -e ETHERSCAN_TWEEDENTITY_API_KEY=$ETHERSCAN_TWEEDENTITY_API_KEY \
  -e VIRTUAL_HOST=qabra.com,www.qabra.com,app.qabra.com,dapp.qabra.com \
  -e LETSENCRYPT_HOST=qabra.com,www.qabra.com,app.qabra.com,dapp.qabra.com \
  -e LETSENCRYPT_EMAIL=admin@qabra.com \
  -w /usr/src/app node:carbon npm run start

