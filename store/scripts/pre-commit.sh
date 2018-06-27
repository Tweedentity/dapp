#!/usr/bin/env bash

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

npm run flatten
