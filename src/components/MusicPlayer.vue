<template>
  <div class="glass rounded-3xl p-6 sm:p-8 w-full hover:shadow-lg transition-shadow duration-300">
    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 drop-shadow-md">
      <Icon icon="mdi:music" class="text-2xl" />
      <span>音乐 / Music</span>
    </h2>
    <div class="player-wrapper overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm shadow-inner">
      <meting-js
        :api="metingApi"
        :server="siteConfig.music.server"
        :type="siteConfig.music.type"
        :id="siteConfig.music.id"
        :autoplay="siteConfig.music.autoPlay"
        theme="#2980b9"
        order="random"
        list-folded="true"
      >
      </meting-js>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { siteConfig } from '@/config';

const METING_API_QUERY = 'server=:server&type=:type&id=:id&r=:r';

function resolveMetingApiUrl(api?: string) {
  const trimmed = api?.trim();

  if (!trimmed) {
    return undefined;
  }

  const hasTemplatePlaceholders =
    trimmed.includes(':server') &&
    trimmed.includes(':type') &&
    trimmed.includes(':id');

  const hasExplicitQueryParams =
    /(?:\?|&)server=/.test(trimmed) &&
    /(?:\?|&)type=/.test(trimmed) &&
    /(?:\?|&)id=/.test(trimmed);

  if (hasTemplatePlaceholders || hasExplicitQueryParams) {
    return trimmed;
  }

  const separator = trimmed.includes('?')
    ? trimmed.endsWith('?') || trimmed.endsWith('&')
      ? ''
      : '&'
    : '?';

  return `${trimmed}${separator}${METING_API_QUERY}`;
}

const metingApi = computed(() => resolveMetingApiUrl(siteConfig.music.api));
</script>

<style scoped>
.player-wrapper {
  width: 100%;
}
:deep(.aplayer) {
  margin: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #333 !important; /* Aplayer defaults to dark text */
}
/* For dark mode text inside aplayer */
:deep(.aplayer .aplayer-info .aplayer-music .aplayer-title) {
  color: #fff !important;
}
:deep(.aplayer .aplayer-info .aplayer-music .aplayer-author) {
  color: #ccc !important;
}
:deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time) {
  color: #ccc !important;
}
:deep(.aplayer .aplayer-list ol li) {
  border-top: 1px solid rgba(255,255,255,0.1) !important;
}
:deep(.aplayer .aplayer-list ol li:hover) {
  background: rgba(255,255,255,0.2) !important;
}
:deep(.aplayer .aplayer-list ol li .aplayer-list-title) {
  color: #fff !important;
}
:deep(.aplayer .aplayer-list ol li .aplayer-list-author) {
  color: #ccc !important;
}

/* Hide lyrics completely */
:deep(.aplayer-lrc) {
  display: none !important;
}
/* Prevent the player from creating extra height for hidden lyrics */
:deep(.aplayer.aplayer-withlrc .aplayer-info) {
  padding-bottom: 0 !important;
}
</style>
