<template>
  <div class="site-background pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-950 [background-image:radial-gradient(circle_at_top,_#1e293b_0%,_#050816_70%)]">
    <div
      v-if="bgUrl"
      class="motion-sensitive absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
      :style="{
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: 'cover',
      }"
      :class="{ 'opacity-100': isLoaded, 'opacity-0': !isLoaded }"
    ></div>
    <!-- Dark overlay to improve readability -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { siteConfig } from '@/config';
import { resolveAssetPath } from '@/utils/assets';

type BackgroundMode = 'api' | 'list';

type BackgroundPreset = {
  mode?: BackgroundMode;
  api?: string;
  list?: string[];
};

type ResponsiveBackgroundConfig = BackgroundPreset & {
  breakpoint?: number;
  desktop?: BackgroundPreset;
  mobile?: BackgroundPreset;
};

type CompatibleMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

let mediaQuery: CompatibleMediaQueryList | null = null;
let loadVersion = 0;

function appendCacheBuster(url: string) {
  const separator = url.includes('?')
    ? url.endsWith('?') || url.endsWith('&')
      ? ''
      : '&'
    : '?';

  return `${url}${separator}t=${Date.now()}`;
}

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

function resolvePresetCandidates(preset?: BackgroundPreset) {
  if (!preset) {
    return [];
  }

  if (preset.mode === 'api') {
    const apiUrl = resolveAssetPath(preset.api);
    return apiUrl ? [appendCacheBuster(apiUrl)] : [];
  }

  const list = Array.isArray(preset.list)
    ? preset.list
        .map((item) => resolveAssetPath(item))
        .filter((item): item is string => Boolean(item))
    : [];

  return shuffle(list);
}

function isResponsiveBackgroundConfig(
  background: ResponsiveBackgroundConfig,
): background is ResponsiveBackgroundConfig & {
  desktop?: BackgroundPreset;
  mobile?: BackgroundPreset;
} {
  return 'desktop' in background || 'mobile' in background;
}

function resolveBackgroundCandidates() {
  const background = siteConfig.background as ResponsiveBackgroundConfig;

  if (!isResponsiveBackgroundConfig(background)) {
    return resolvePresetCandidates(background);
  }

  const breakpoint = background.breakpoint ?? 768;
  const isMobile = window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  const activePreset = isMobile ? background.mobile : background.desktop;
  const fallbackPreset = isMobile ? background.desktop : background.mobile;

  return Array.from(
    new Set([
      ...resolvePresetCandidates(activePreset),
      ...resolvePresetCandidates(fallbackPreset),
      ...resolvePresetCandidates(background),
    ]),
  );
}

function prioritizeBackground(url?: string) {
  if (!url) {
    return;
  }

  const absoluteUrl = new URL(url, document.baseURI).href;
  const hasExistingPreload = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]'),
  ).some((link) => link.href === absoluteUrl);

  if (hasExistingPreload) {
    return;
  }

  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = url;
  preloadLink.setAttribute('fetchpriority', 'high');
  document.head.append(preloadLink);
}

const initialBackgroundCandidates = resolveBackgroundCandidates();
prioritizeBackground(initialBackgroundCandidates[0]);
const bgUrl = ref(initialBackgroundCandidates[0] ?? '');
const isLoaded = ref(initialBackgroundCandidates.length > 0);

function preloadImage(url: string) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

async function loadBackground(candidates = resolveBackgroundCandidates()) {
  const currentLoad = ++loadVersion;
  prioritizeBackground(candidates[0]);

  if (!bgUrl.value && candidates[0]) {
    bgUrl.value = candidates[0];
    isLoaded.value = true;
  }

  for (const candidate of candidates) {
    try {
      const resolvedUrl = await preloadImage(candidate);
      if (currentLoad !== loadVersion) {
        return;
      }

      bgUrl.value = resolvedUrl;
      isLoaded.value = true;
      return;
    } catch {
      // Try the next configured source before falling back.
    }
  }

  if (currentLoad !== loadVersion) {
    return;
  }

  bgUrl.value = '';
  isLoaded.value = false;
}

function handleBackgroundMediaChange() {
  void loadBackground();
}

onMounted(async () => {
  const background = siteConfig.background as ResponsiveBackgroundConfig;
  const breakpoint = background.breakpoint ?? 768;

  mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`) as CompatibleMediaQueryList;
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleBackgroundMediaChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleBackgroundMediaChange);
  }

  // Re-evaluate after mount in case the browser viewport settled between setup and first paint.
  await loadBackground();
});

onBeforeUnmount(() => {
  if (!mediaQuery) {
    return;
  }

  if (typeof mediaQuery.removeEventListener === 'function') {
    mediaQuery.removeEventListener('change', handleBackgroundMediaChange);
  } else if (typeof mediaQuery.removeListener === 'function') {
    mediaQuery.removeListener(handleBackgroundMediaChange);
  }
});
</script>

<style scoped>
.site-background {
  height: 100vh;
  height: 100dvh;
}
</style>
