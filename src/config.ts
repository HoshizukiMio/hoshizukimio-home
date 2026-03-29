const currentYear = new Date().getFullYear();

export const siteConfig = {
  // 个人信息
  author: "星月澪",
  description: "二次元 | 开发者",
  avatar: "https://avatars.githubusercontent.com/u/164364793?v=4", // 头像地址
  favicon: "./favicon.ico",
  
  // 背景设置
  background: {
    // 小于该宽度时使用手机端背景配置
    breakpoint: 768,

    desktop: {
      // 模式可选 'api'（从接口获取图片）或 'list'（从下面的列表中随机选择）
      mode: "list",

      // 当模式为 'api' 时使用
      api: "https://img-api.hoshizukimio.com",

      // 当模式为 'list' 时使用
      // 列表项可以是远程图片 URL，或 public/ 下的图片
      list: [
        "./background.webp"
      ]
    },

    mobile: {
      mode: "list",
      list: [
        "https://raw.githubusercontent.com/HoshizukiMio/HoshizukiMio/main/assets/banner.png"
      ]
    }
  },
  
  // 一言
  hitokoto: {
    enableAPI: true, // 为 true 时从下面的接口获取；为 false 时使用本地文案
    api: "https://v1.hitokoto.cn?c=a&c=b&c=c", // 自定义一言接口地址
    localQuotes: [
      { text: "所以……我来成为神明！", from: "丰川祥子" },
      { text: "欢迎来到Ave Mujica的世界", from: "BanG Dream! Ave Mujica" }
    ]
  },

  // 链接
  // 使用 Iconify 图标名称（例如 Material Design Icons 的 'mdi:' 前缀）
  links: [
    { name: "GitHub", url: "https://github.com/", icon: "mdi:github" },
    { name: "Blog", url: "https://blog.example.com/", icon: "mdi:post-outline" },
    { name: "Telegram", url: "https://t.me/", icon: "mdi:telegram" },
    { name: "Bilibili", url: "https://space.bilibili.com/", icon: "ri:bilibili-line" },
    { name: "Email", url: "mailto:hello@example.com", icon: "mdi:email-outline" },
  ],

  // 音乐播放器（MetingJS）
  music: {
    // Meting API 基础地址或完整模板地址
    // 基础地址示例："https://your-domain.com/api"
    // 模板地址示例："https://your-domain.com/api?server=:server&type=:type&id=:id&r=:r"
    // 留空 "" 或 undefined 时使用 MetingJS 默认 API
    // 推荐自建
    // 自建服务说明见："https://github.com/metowolf/Meting-API"
    api: "https://meting-api.hoshizukimio.com/api", 
    server: "netease", // 可选：netease、tencent、kugou、xiami、baidu
    type: "playlist",  // 可选：song、playlist、album、search、artist
    id: "13606034252",     // 歌单 ID
    autoPlay: false
  },

  // 页脚
  footer: {
    enabled: true,
    items: [
      `© ${currentYear} 星月澪`
    ]
  }
};
