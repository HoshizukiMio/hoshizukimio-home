export const siteConfig = {
  // Personal Info
  author: "星月澪",
  description: "二次元 | 开发者",
  avatar: "https://avatars.githubusercontent.com/u/164364793?v=4", // Placeholder avatar
  
  // Background Settings
  background: {
    // Mode can be 'api' (fetches from an API URL) or 'list' (picks randomly from the list below)
    mode: "api",
    
    // Used if mode is 'api'
    api: "https://api-img.hoshizukimio.com",
    
    // Used if mode is 'list'
    list: [
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1920&auto=format&fit=crop"
    ]
  },
  
  // Hitokoto / Quotes
  hitokoto: {
    enableAPI: true, // If true, fetches from the api URL below. If false, uses local quotes.
    api: "https://v1.hitokoto.cn?c=a&c=b&c=c", // Custom Hitokoto API URL
    localQuotes: [
      { text: "心之所向，素履以往。", from: "七堇年" },
      { text: "There is always light behind the clouds。", from: "小妇人" },
      { text: "星空之下，皆是梦想。", from: "原创" }
    ]
  },

  // Social / Project Links
  // Using Iconify icon names (e.g., from Material Design Icons 'mdi:')
  links: [
    { name: "GitHub", url: "https://github.com/", icon: "mdi:github" },
    { name: "Blog", url: "https://example.com/", icon: "mdi:post-outline" },
    { name: "Twitter", url: "https://twitter.com/", icon: "mdi:twitter" },
    { name: "Bilibili", url: "https://bilibili.com/", icon: "ri:bilibili-line" },
    { name: "Email", url: "mailto:hello@example.com", icon: "mdi:email-outline" },
  ],

  // Music Player (MetingJS)
  music: {
    // Meting API URL. Keep empty "" or undefined to use MetingJS default API.
    // Self-hosted See Here: "https://github.com/metowolf/Meting-API"
    api: "https://meting-api.hoshizukimio.com/api",
    server: "netease", // netease, tencent, kugou, xiami, baidu
    type: "playlist",  // song, playlist, album, search, artist
    id: "13606034252",     // Playlist ID
    autoPlay: false
  }
};
