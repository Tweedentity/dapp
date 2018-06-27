#!/usr/bin/env bash

# curl https://raw.githubusercontent.com/jwilder/nginx-proxy/master/nginx.tmpl > /vol/proxy/templates/nginx.tmpl

docker stop nginx
docker rm nginx

docker run -d \
  --name proxy \
  --restart unless-stopped \
  -p 80:80 \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  jwilder/nginx-proxy
