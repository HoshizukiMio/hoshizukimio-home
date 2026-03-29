<template>
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div
      v-if="bgUrl"
      class="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
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

const DEFAULT_BACKGROUND =
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1920&auto=format&fit=crop';

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

const bgUrl = ref('');
const isLoaded = ref(false);
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

function resolveAssetPath(path: string) {
  if (/^(https?:)?\/\//.test(path) || /^(data|blob):/.test(path)) {
    return path;
  }

  if (path.startsWith('/')) {
    return path;
  }

  if (path.startsWith('./')) {
    return `/${path.slice(2)}`;
  }

  return `/${path}`;
}

function resolvePresetCandidates(preset?: BackgroundPreset) {
  if (!preset) {
    return [];
  }

  if (preset.mode === 'api') {
    const apiUrl = preset.api?.trim();
    return apiUrl ? [appendCacheBuster(resolveAssetPath(apiUrl))] : [];
  }

  const list = Array.isArray(preset.list)
    ? preset.list
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item))
        .map(resolveAssetPath)
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

async function loadBackground() {
  const currentLoad = ++loadVersion;
  const candidates = resolveBackgroundCandidates();

  isLoaded.value = false;

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

  bgUrl.value = DEFAULT_BACKGROUND;
  isLoaded.value = true;
}

onMounted(async () => {
  const background = siteConfig.background as ResponsiveBackgroundConfig;
  const breakpoint = background.breakpoint ?? 768;

  mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`) as CompatibleMediaQueryList;
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', loadBackground);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(loadBackground);
  }

  await loadBackground();
});

onBeforeUnmount(() => {
  if (!mediaQuery) {
    return;
  }

  if (typeof mediaQuery.removeEventListener === 'function') {
    mediaQuery.removeEventListener('change', loadBackground);
  } else if (typeof mediaQuery.removeListener === 'function') {
    mediaQuery.removeListener(loadBackground);
  }
});
</script>
