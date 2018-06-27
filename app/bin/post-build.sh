#!/usr/bin/env bash

export PREBODY=$(shasum -b -a 256 ./static/js/pre-body.js | xxd -r -p | base64)
export ENDBODY=$(shasum -b -a 256 ./static/js/end-body.js | xxd -r -p | base64)
export BUNDLE=$(shasum -b -a 256 ./static/js/bundle.min.js | xxd -r -p | base64)

node bin/post-build.js

