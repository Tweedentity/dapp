#!/usr/bin/env bash

cd api
if [[ -n "$SKIP" ]]
then
   echo "Skipping api tests"
else
  npm run test
  if [ $? -ne 0 ]; then
   echo "Tests must pass before commit!"
   exit 1
  fi
fi

cd ../store
rm build/contracts/*
truffle compile
if [[ -n "$SKIP" ]]
then
   echo "Skipping store tests"
else
    truffle test
    if [ $? -ne 0 ]; then
        echo "Tests must pass before commit!"
        exit 1
    fi
fi
scripts/flatten.sh
cd ..
node scripts/copyAbiForApp.js

cd tweedentity-js
if [[ -n "$SKIP" ]]
then
   echo "Skipping api tests"
else
  npm run test
  if [ $? -ne 0 ]; then
   echo "Tests must pass before commit!"
   exit 1
  fi
fi

cd ..
git add -A
export SKIP=
