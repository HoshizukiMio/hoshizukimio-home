<template>
  <div class="glass mx-auto flex h-full w-full max-w-sm flex-col items-center justify-center rounded-[2rem] p-6 text-center transition-shadow duration-300 hover:shadow-2xl sm:p-8">
    <div class="mb-5 h-24 w-24 overflow-hidden rounded-full border-4 border-white/50 shadow-lg sm:mb-6 sm:h-32 sm:w-32">
      <img :src="siteConfig.avatar" :alt="`${siteConfig.author}的头像`" class="motion-sensitive w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
    </div>
    
    <h1 class="mb-2 text-2xl font-bold tracking-[0.18em] text-white drop-shadow-md sm:text-3xl">
      {{ siteConfig.author }}
    </h1>
    
    <p class="mb-5 text-sm text-gray-200 drop-shadow sm:mb-6">
      {{ siteConfig.description }}
    </p>

    <div class="flex min-h-[4.5rem] w-full flex-col items-center justify-center border-t border-white/20 pt-4 sm:min-h-[5rem]">
      <p aria-hidden="true" class="text-base font-light italic leading-relaxed text-white/90 drop-shadow-sm sm:text-lg">
        "{{ currentQuote }}"<span class="cursor-blink" v-show="isTyping">|</span>
      </p>
      <p aria-hidden="true" class="motion-sensitive mt-2 w-full text-right text-xs text-white/70 transition-opacity duration-1000 sm:text-sm" :class="isTyping ? 'opacity-0' : 'opacity-100'" v-show="currentSource">
        —— {{ currentSource }}
      </p>
      <p class="sr-only" aria-live="polite" aria-atomic="true">
        <template v-if="announcedQuote">
          “{{ announcedQuote }}”<template v-if="announcedSource">，出处：{{ announcedSource }}</template>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { siteConfig } from '@/config';

const TYPING_INTERVAL = 100;
const SOURCE_REVEAL_DELAY = 300;
const HITOKOTO_REQUEST_TIMEOUT = 8000;

const currentQuote = ref('');
const currentSource = ref('');
const announcedQuote = ref('');
const announcedSource = ref('');
const isTyping = ref(false);
const prefersReducedMotion = ref(false);

let activeQuote = '';
let activeSource = '';
let typingTimer: number | null = null;
let sourceRevealTimer: number | null = null;
let rotationTimer: number | null = null;
let activeRequest: AbortController | null = null;
let reducedMotionQuery: MediaQueryList | null = null;

function clearTypingTimers() {
  if (typingTimer !== null) {
    window.clearInterval(typingTimer);
    typingTimer = null;
  }

  if (sourceRevealTimer !== null) {
    window.clearTimeout(sourceRevealTimer);
    sourceRevealTimer = null;
  }
}

function clearRotationTimer() {
  if (rotationTimer !== null) {
    window.clearTimeout(rotationTimer);
    rotationTimer = null;
  }
}

function scheduleNextQuote() {
  clearRotationTimer();

  const delay = Number(siteConfig.hitokoto.rotateInterval);
  if (!Number.isFinite(delay) || delay <= 0) {
    return;
  }

  rotationTimer = window.setTimeout(() => {
    fetchHitokoto();
  }, delay);
}

function finishQuoteImmediately() {
  clearTypingTimers();
  currentQuote.value = activeQuote;
  currentSource.value = activeSource;
  isTyping.value = false;
  scheduleNextQuote();
}

function typeQuote(text: string, source?: string) {
  clearTypingTimers();
  clearRotationTimer();

  activeQuote = text.trim();
  activeSource = source?.trim() || '未知';
  announcedQuote.value = activeQuote;
  announcedSource.value = activeSource;

  if (prefersReducedMotion.value) {
    finishQuoteImmediately();
    return;
  }

  let index = 0;
  currentQuote.value = '';
  currentSource.value = '';
  isTyping.value = true;

  typingTimer = window.setInterval(() => {
    if (index < activeQuote.length) {
      currentQuote.value += activeQuote.charAt(index);
      index += 1;
      return;
    }

    if (typingTimer !== null) {
      window.clearInterval(typingTimer);
      typingTimer = null;
    }

    sourceRevealTimer = window.setTimeout(() => {
      currentSource.value = activeSource;
      isTyping.value = false;
      sourceRevealTimer = null;
      scheduleNextQuote();
    }, SOURCE_REVEAL_DELAY);
  }, TYPING_INTERVAL);
}

function fallbackQuote() {
  const quotes = Array.isArray(siteConfig.hitokoto.localQuotes)
    ? siteConfig.hitokoto.localQuotes
    : [];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  if (!quote) {
    typeQuote('欢迎来到我的小站', siteConfig.author);
  } else if (typeof quote === 'string') {
    typeQuote(quote, '未知');
  } else {
    typeQuote(quote.text, quote.from);
  }
}

const fetchHitokoto = async () => {
  clearRotationTimer();
  activeRequest?.abort();

  if (siteConfig.hitokoto.enableAPI) {
    const controller = new AbortController();
    activeRequest = controller;
    let didTimeout = false;
    const requestTimeout = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, HITOKOTO_REQUEST_TIMEOUT);

    try {
      const apiUrl = siteConfig.hitokoto.api || 'https://v1.hitokoto.cn';
      const res = await fetch(apiUrl, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Hitokoto request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (typeof data.hitokoto !== 'string' || data.hitokoto.trim().length === 0) {
        throw new Error('Hitokoto response did not contain a quote');
      }

      typeQuote(data.hitokoto, data.from);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && !didTimeout) {
        return;
      }

      fallbackQuote();
    } finally {
      window.clearTimeout(requestTimeout);
      if (activeRequest === controller) {
        activeRequest = null;
      }
    }
  } else {
    fallbackQuote();
  }
};

function handleReducedMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;

  if (event.matches && isTyping.value && activeQuote) {
    finishQuoteImmediately();
  }
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion.value = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  fetchHitokoto();
});

onBeforeUnmount(() => {
  clearTypingTimers();
  clearRotationTimer();
  activeRequest?.abort();
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange);
});
</script>
