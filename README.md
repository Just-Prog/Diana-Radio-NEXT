<p align="center">
    <img src="docs/intro_1.png" width="90%"/>
</p>
<h1 align="center" style="color: #e799b0">Diana Radio 嘉然电台FM.307</h3>

<h3 align="center" style="color: #e799b0">An alternative frontend project for NCM Podcast</h4>

<h3 align="center">
    Powered by <img src="docs/next.svg"/>
</h4>

## 先决条件

支持 Node.JS 运行时的环境、Redis 数据库(必需)、某音乐平台 API 库备份（必需，自备）

## 本地启动&构建

安装所需依赖：

> 请在此过程中自备某音乐平台的 API 库备份并自行替换 `package.json` 的存储库地址。
> 如有 Vercel 平台部署需求请一并修改 `vercel.sh` 内的替换脚本内容。

```bash
pnpm i
```

启动开发服务器:

```bash
pnpm dev
```

默认的开发环境地址为 [http://localhost:3000](http://localhost:3000)

如需构建:

```bash
pnpm build
```

如需部署至 Vercel 等云函数平台请根据平台文档操作，对接 Redis Cloud 等 Redis/Valkey 数据库提供商，并修改环境变量 `REDIS_URL` 与 `GITHUB_TOKEN`以供程序接入数据库与平台编译拉取 API 库使用。

## 鸣谢

> Bilibili [@嘉心糖周报](https://space.bilibili.com/247210788)
> 云音乐播客 [@嘉心糖周报](https://music.163.com/#/user/home?id=8437701424)
