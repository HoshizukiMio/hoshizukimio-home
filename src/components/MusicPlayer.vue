<template>
  <div class="glass w-full rounded-[2rem] p-5 transition-shadow duration-300 hover:shadow-lg sm:p-8">
    <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold drop-shadow-md sm:text-xl">
      <Icon icon="mdi:music" class="text-2xl" />
      <span>音乐 / Music</span>
    </h2>
    <div
      ref="playerWrapper"
      class="player-wrapper relative min-h-[5.5rem] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm shadow-inner"
      :aria-busy="playerState === 'loading'"
    >
      <div
        v-if="playerState === 'loading'"
        class="absolute inset-0 z-10 flex min-h-[5.5rem] items-center justify-center bg-slate-900/35 px-4 text-sm text-white/75"
        role="status"
        aria-live="polite"
      >
        正在加载音乐播放器…
      </div>

      <div
        v-else-if="playerState === 'error'"
        class="absolute inset-0 z-10 flex min-h-[5.5rem] flex-col items-center justify-center gap-3 bg-slate-900/55 px-4 text-center"
        role="alert"
      >
        <span class="text-sm text-white/80">音乐播放器暂时无法加载</span>
        <button
          type="button"
          class="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="retryPlayer"
        >
          重新加载
        </button>
      </div>

      <meting-js
        v-if="shouldRenderPlayer"
        :key="playerKey"
        :api="metingApi"
        :server="siteConfig.music.server"
        :type="siteConfig.music.type"
        :id="siteConfig.music.id"
        :autoplay="siteConfig.music.autoPlay"
        theme="#2980b9"
        order="random"
        list-folded="true"
        list-max-height="260px"
      >
      </meting-js>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { siteConfig } from '@/config';
import { loadMusicAssets } from '@/utils/musicAssets';

const METING_API_QUERY = 'server=:server&type=:type&id=:id&r=:r';
const PLAYER_LOAD_TIMEOUT = 20000;

type PlayerState = 'loading' | 'ready' | 'error';

const playerWrapper = ref<HTMLElement | null>(null);
const playerState = ref<PlayerState>('loading');
const shouldRenderPlayer = ref(false);
const playerKey = ref(0);
let playerObserver: MutationObserver | null = null;
let playerLoadTimer: number | null = null;
let isUnmounted = false;
let isStartingPlayer = false;

type MetingElement = HTMLElement & {
  aplayer?: unknown;
  lock?: boolean;
};

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

function setAttributeIfChanged(element: Element, name: string, value: string) {
  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
}

function handleKeyboardClick(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  event.preventDefault();
  (event.currentTarget as HTMLElement).click();
}

function enhanceKeyboardControl(element: HTMLElement, label: string) {
  setAttributeIfChanged(element, 'aria-label', label);

  if (element.tagName !== 'BUTTON') {
    setAttributeIfChanged(element, 'role', 'button');
    setAttributeIfChanged(element, 'tabindex', '0');
  }

  if (element.dataset.keyboardControl !== 'true') {
    element.dataset.keyboardControl = 'true';
    element.addEventListener('keydown', handleKeyboardClick);
  }
}

function handlePlaylistKeydown(event: KeyboardEvent) {
  const item = event.currentTarget as HTMLElement;
  const list = item.closest('ol');
  const items = list
    ? Array.from(list.querySelectorAll<HTMLElement>('li[role="option"]'))
    : [];
  const currentIndex = items.indexOf(item);

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    item.click();
    return;
  }

  let nextIndex = currentIndex;
  if (event.key === 'ArrowDown') {
    nextIndex = Math.min(currentIndex + 1, items.length - 1);
  } else if (event.key === 'ArrowUp') {
    nextIndex = Math.max(currentIndex - 1, 0);
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = items.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  items.forEach((candidate, index) => {
    candidate.tabIndex = index === nextIndex ? 0 : -1;
  });
  items[nextIndex]?.focus();
}

function enhancePlayerAccessibility(player: HTMLElement) {
  const playButton = player.querySelector<HTMLElement>('.aplayer-button');
  if (playButton) {
    enhanceKeyboardControl(
      playButton,
      playButton.classList.contains('aplayer-pause') ? '暂停音乐' : '播放音乐',
    );
  }

  const labelledButtons: Array<[string, string]> = [
    ['.aplayer-icon-volume-down, .aplayer-icon-volume-up, .aplayer-icon-volume-off', '静音或取消静音'],
    ['.aplayer-icon-order', '切换播放顺序'],
    ['.aplayer-icon-loop', '切换循环模式'],
    ['.aplayer-icon-back', '上一首'],
    ['.aplayer-icon-play', '播放或暂停'],
    ['.aplayer-icon-forward', '下一首'],
  ];

  labelledButtons.forEach(([selector, label]) => {
    player.querySelectorAll<HTMLElement>(selector).forEach((button) => {
      enhanceKeyboardControl(button, label);
    });
  });

  const playlist = player.querySelector<HTMLElement>('.aplayer-list');
  const menuButton = player.querySelector<HTMLElement>('.aplayer-icon-menu');
  const isPlaylistHidden = playlist?.classList.contains('aplayer-list-hide') ?? true;

  if (playlist) {
    if (!playlist.id) {
      playlist.id = 'music-player-playlist';
    }
    setAttributeIfChanged(playlist, 'aria-hidden', String(isPlaylistHidden));
    setAttributeIfChanged(playlist, 'role', 'listbox');
  }

  if (menuButton) {
    enhanceKeyboardControl(menuButton, isPlaylistHidden ? '展开歌单' : '收起歌单');
    setAttributeIfChanged(menuButton, 'aria-expanded', String(!isPlaylistHidden));
    if (playlist) {
      setAttributeIfChanged(menuButton, 'aria-controls', playlist.id);
    }
  }

  const playlistItems = Array.from(
    player.querySelectorAll<HTMLElement>('.aplayer-list ol li'),
  );
  const selectedIndex = Math.max(
    playlistItems.findIndex((item) => item.classList.contains('aplayer-list-light')),
    0,
  );

  playlistItems.forEach((item, index) => {
    const title = item.querySelector('.aplayer-list-title')?.textContent?.trim() || `歌曲 ${index + 1}`;
    const author = item.querySelector('.aplayer-list-author')?.textContent?.trim();
    setAttributeIfChanged(item, 'role', 'option');
    setAttributeIfChanged(item, 'aria-label', author ? `${title}，${author}` : title);
    setAttributeIfChanged(
      item,
      'aria-selected',
      String(item.classList.contains('aplayer-list-light')),
    );
    item.tabIndex = isPlaylistHidden || index !== selectedIndex ? -1 : 0;

    if (item.dataset.keyboardControl !== 'true') {
      item.dataset.keyboardControl = 'true';
      item.addEventListener('keydown', handlePlaylistKeydown);
    }
  });

  const lyricsButton = player.querySelector<HTMLElement>('.aplayer-icon-lrc');
  if (lyricsButton) {
    setAttributeIfChanged(lyricsButton, 'aria-hidden', 'true');
    lyricsButton.tabIndex = -1;
  }
}

function clearPlayerLoadTimer() {
  if (playerLoadTimer !== null) {
    window.clearTimeout(playerLoadTimer);
    playerLoadTimer = null;
  }
}

function prepareMetingRemoval() {
  const metingElement = playerWrapper.value?.querySelector<MetingElement>('meting-js');

  if (metingElement && !metingElement.aplayer) {
    metingElement.lock = true;
  }
}

function syncPlayerState() {
  const player = playerWrapper.value?.querySelector<HTMLElement>('.aplayer');

  if (!player) {
    return;
  }

  enhancePlayerAccessibility(player);
  playerState.value = 'ready';
  clearPlayerLoadTimer();
}

function watchPlayer() {
  playerObserver?.disconnect();
  clearPlayerLoadTimer();
  playerState.value = 'loading';

  if (!playerWrapper.value) {
    return;
  }

  playerObserver = new MutationObserver(syncPlayerState);
  playerObserver.observe(playerWrapper.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  syncPlayerState();
  playerLoadTimer = window.setTimeout(() => {
    if (playerState.value === 'loading') {
      playerState.value = 'error';
    }
  }, PLAYER_LOAD_TIMEOUT);
}

async function loadPlayer() {
  if (isStartingPlayer) {
    return;
  }

  isStartingPlayer = true;
  playerObserver?.disconnect();
  clearPlayerLoadTimer();
  playerState.value = 'loading';
  prepareMetingRemoval();
  shouldRenderPlayer.value = false;
  await nextTick();

  try {
    await loadMusicAssets();
    if (isUnmounted) {
      return;
    }

    playerKey.value += 1;
    shouldRenderPlayer.value = true;
    await nextTick();
    watchPlayer();
  } catch {
    if (!isUnmounted) {
      playerState.value = 'error';
    }
  } finally {
    isStartingPlayer = false;
  }
}

async function retryPlayer() {
  await loadPlayer();
}

onMounted(() => {
  void loadPlayer();
});

onBeforeUnmount(() => {
  isUnmounted = true;
  playerObserver?.disconnect();
  clearPlayerLoadTimer();
  prepareMetingRemoval();
});
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
:deep(.aplayer .aplayer-pic .aplayer-button) {
  bottom: auto !important;
  height: 40px !important;
  left: 50% !important;
  margin: 0 !important;
  right: auto !important;
  top: 50% !important;
  transform: translate(-50%, -50%);
  width: 40px !important;
}
:deep(.aplayer .aplayer-pic .aplayer-button svg) {
  height: 24px !important;
  left: 8px !important;
  top: 8px !important;
  width: 24px !important;
}
:deep(.aplayer button:focus-visible),
:deep(.aplayer [role='button']:focus-visible),
:deep(.aplayer [role='option']:focus-visible) {
  outline: 2px solid #fff !important;
  outline-offset: 3px !important;
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

@media (max-width: 640px) {
  :deep(.aplayer .aplayer-info) {
    padding: 14px 12px 10px !important;
  }

  :deep(.aplayer .aplayer-body .aplayer-pic) {
    height: 52px !important;
    width: 52px !important;
  }

  :deep(.aplayer .aplayer-info .aplayer-music) {
    margin-bottom: 8px !important;
  }

  :deep(.aplayer .aplayer-info .aplayer-music .aplayer-title) {
    font-size: 0.95rem !important;
  }

  :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time) {
    font-size: 0.75rem !important;
  }

  :deep(.aplayer .aplayer-list:not(.aplayer-list-hide)) {
    max-height: 220px !important;
  }

  :deep(.aplayer .aplayer-list.aplayer-list-hide) {
    max-height: 0 !important;
  }

  :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time .aplayer-icon) {
    height: 16px !important;
    margin: -8px 0 !important;
    padding: 8px !important;
    width: 16px !important;
  }
}
</style>
