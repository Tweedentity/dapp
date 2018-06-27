#!/usr/bin/env bash

# curl https://raw.githubusercontent.com/jwilder/nginx-proxy/master/nginx.tmpl > /vol/etc/nginx/templates/nginx.tmpl

docker stop nginx
docker rm nginx

docker stop nginx-gen
docker rm nginx-gen

docker stop nginx-letsencrypt
docker rm nginx-letsencrypt

docker rmi nginx jwilder/docker-gen jrcs/letsencrypt-nginx-proxy-companion

docker run -d \
  --name nginx \
  --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -v /etc/nginx/conf.d  \
  -v /etc/nginx/vhost.d \
  -v /usr/share/nginx/html \
  -v /vol/etc/nginx/certs:/etc/nginx/certs:ro \
  --label com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy \
  nginx

docker run -d \
    --name nginx-gen \
    --restart unless-stopped \
    --volumes-from nginx \
    -v /vol/etc/nginx/templates/nginx.tmpl:/etc/docker-gen/templates/nginx.tmpl:ro \
    -v /var/run/docker.sock:/tmp/docker.sock:ro \
    --label com.github.jrcs.letsencrypt_nginx_proxy_companion.docker_gen \
    jwilder/docker-gen \
    -notify-sighup nginx -watch -wait 5s:30s /etc/docker-gen/templates/nginx.tmpl /etc/nginx/conf.d/default.conf

docker run -d \
    --name nginx-letsencrypt \
    --restart unless-stopped \
    --volumes-from nginx \
    -v /vol/etc/nginx/certs:/etc/nginx/certs:rw \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    jrcs/letsencrypt-nginx-proxy-companion
