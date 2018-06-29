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
  truffle-flattener "contracts/$c.sol" > "flattened/$c-flattened.sol"
done
