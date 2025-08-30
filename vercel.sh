#!/bin/bash

sed -i '' -e "s/git@github.com\//$GITHUB_TOKEN@github.com\//g" package.json
echo "-⭐- 已替换 private 库源"
pnpm install
echo "-👍- 安装完毕"