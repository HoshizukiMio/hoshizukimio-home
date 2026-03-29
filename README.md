# hoshizukimio-home

一个基于 Vue 3 + Vite + Tailwind CSS 的个人主页项目，包含动态背景、个人信息卡片、一言、快捷导航，以及通过 APlayer + MetingJS 接入的歌单播放器。

## 功能

- 毛玻璃风格的单页个人主页布局
- 背景图支持 API 随机拉取或本地列表随机切换
- 个人头像、昵称、简介展示
- 一言文案支持远程 API 或本地后备文案
- 快捷导航卡片，图标基于 Iconify
- 实时时钟和日期显示
- 基于 MetingJS 的音乐播放器，支持自建 Meting API

## 技术栈

- Vue 3
- Vite 5
- TypeScript
- Tailwind CSS
- Iconify
- APlayer
- MetingJS

## 本地开发

建议使用 Node.js 18 及以上版本。

```bash
npm install
npm run dev
```

默认开发地址通常为 `http://localhost:5173`。

## 构建

```bash
npm run build
npm run preview
```

## 配置说明

项目的主要内容集中在 `src/config.ts`。

### 个人信息

```ts
author: "你的名字",
description: "描述一下自己",
avatar: "https://..."
```

### 背景图

支持两种模式：

- `mode: "api"`: 从接口拉取背景图
- `mode: "list"`: 从本地配置数组中随机选择

示例：

```ts
background: {
  mode: "api",
  api: "https://api-img.hoshizukimio.com",
  list: []
}
```

### 一言文案

支持远程 API 和本地后备内容：

```ts
hitokoto: {
  enableAPI: true,
  api: "https://v1.hitokoto.cn?c=a&c=b&c=c",
  localQuotes: [
    { text: "心之所向，素履以往。", from: "七堇年" }
  ]
}
```

### 导航链接

```ts
links: [
  { name: "GitHub", url: "https://github.com/", icon: "mdi:github" }
]
```

图标名称使用 Iconify 图标集标识。

### 音乐播放器

播放器基于 MetingJS，自定义配置示例：

```ts
music: {
  api: "https://meting-api.hoshizukimio.com/api",
  server: "netease",
  type: "playlist",
  id: "13606034252",
  autoPlay: false
}
```

#### 支持的常见参数

- `server`: 音乐平台，例如 `netease`、`tencent`、`kugou`
- `type`: 数据类型，例如 `song`、`playlist`、`album`、`artist`
- `id`: 歌曲、歌单或专辑 ID
- `autoPlay`: 是否自动播放

## 部署建议

这是一个纯前端静态项目，可以直接部署到：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- 任意 Nginx 静态站点

部署前执行：

```bash
npm run build
```

然后将 `dist/` 目录发布即可。