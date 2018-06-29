#!/usr/bin/env bash

cd api

if [[ -n "$SKIP_TESTS" ]]
then

   echo "Skipping tests"

else

  npm run test

  if [ $? -ne 0 ]; then
   echo "Tests must pass before commit!"
   exit 1
  fi
fi

cd ../store

rm -rf build
truffle compile

if [[ -n "$SKIP_TESTS" ]]
then

   echo "Skipping tests"

else

    truffle test

    if [ $? -ne 0 ]; then
        echo "Tests must pass before commit!"
        exit 1
    fi

fi

scripts/flatten.sh

cd ..

git add -A
