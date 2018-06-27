#!/usr/bin/env bash

(cd api && scripts/pre-commit.sh)
(cd store && scripts/pre-commit.sh)
git add -A
