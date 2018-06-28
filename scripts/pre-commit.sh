#!/usr/bin/env bash

(cd api && export $SKIP_TESTS && scripts/pre-commit.sh)
(cd store && export $SKIP_TESTS && scripts/pre-commit.sh)
git add -A
