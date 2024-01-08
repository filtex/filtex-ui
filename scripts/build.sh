#!/bin/bash

npm version $VERSION
npm i --production=false
npm i -g rimraf
npm i -g rollup
npm run build