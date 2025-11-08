#!/bin/bash

sed -i -e "s/git+https:\/\/github.com\/Just-Prog/git+https:\/\/Just-Prog:$GITHUB_TOKEN@github.com\/Just-Prog/g" package.json
echo "-⭐- 已替换 private 库源"
yarn
echo "-👍- 安装完毕"
#pnpm build
#echo "-👍- 构建完毕"
