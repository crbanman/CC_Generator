#!/bin/bash

build() {
  echo 'building react'
  
  rm -rf dist/*
  rm -rf build/*
  
  export INLINE_RUNTIME_CHUNK=false
  export GENERATE_SOURCEMAP=false
  
  react-scripts build
  
  mkdir -p dist
  cp -r build/* dist
  
  mv dist/index.html dist/popup.html
}

build