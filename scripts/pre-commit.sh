#!/usr/bin/env bash

(cd store && scripts/pre-commit.sh)
(cd api && scripts/pre-commit.sh)