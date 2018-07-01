#!/usr/bin/env bash

rm flattened/*

contracts=(
"UidCheckerForTwitter"
"UidCheckerForReddit"
"Datastore"
"StoreManager"
"OwnershipClaimer"
"TweedentityRegistry"
)

for c in "${contracts[@]}"
do
  truffle-flattener "store/contracts/$c.sol" > "store/flattened/$c-flattened.sol"
done
