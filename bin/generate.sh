#!/bin/bash

SCRPWD="$(cd "$(dirname "$0")" && pwd -P)"
RET=$(pwd)

cd $1

find . -not -path '*\/.*' | sed 's/\.\///' | tail -n +2 | grep -v files > files

echo "Generated files for " `pwd`
ls files

babel-node $SCRPWD/crawl.js $(pwd)

echo "Generated config.json for " `pwd`
ls config.json

cd $RET
