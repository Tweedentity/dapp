#!/usr/bin/env bash

npm run test

if [ $? -ne 0 ]; then
 echo "Tests must pass before commit!"
 exit 1
fi
