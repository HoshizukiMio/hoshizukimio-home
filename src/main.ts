import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { siteConfig } from './config'
import { resolveAssetPath } from './utils/assets'

function applyTitle() {
  const title = siteConfig.title?.trim()

  if (!title) {
    return
  }

  document.title = title
}

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

applyTitle()
applyFavicon()
createApp(App).mount('#app')
