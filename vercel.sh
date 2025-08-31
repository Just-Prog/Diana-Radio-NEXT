#!/bin/bash

sed -i -e "s/git+https:\/\/github.com\/Just-Prog/git+https:\/\/Just-Prog:$GITHUB_TOKEN@github.com\/Just-Prog/g" package.json
echo "-⭐- 已替换 private 库源"
pnpm install --no-frozen-lockfile
echo "-👍- 安装完毕"
pnpm build
