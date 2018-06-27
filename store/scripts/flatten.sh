#!/usr/bin/env bash

rm flattened/*

contracts=(
"TwitterUidChecker"
"RedditUidChecker"
"TweedentityStore"
"TweedentityManager"
"TweedentityClaimer"
"TweedentityRegistry"
)

for c in "${contracts[@]}"
do
  truffle-flattener "contracts/$c.sol" > "flattened/$c-flattened.sol"
done
