import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { siteConfig } from './config'
import { resolveAssetPath } from './utils/assets'

function applyFavicon() {
  const favicon = resolveAssetPath(siteConfig.favicon)

  if (!favicon) {
    return
  }

  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  link.href = favicon
}

applyFavicon()
createApp(App).mount('#app')
