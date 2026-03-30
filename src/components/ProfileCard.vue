<template>
  <div class="glass mx-auto flex h-full w-full max-w-sm flex-col items-center justify-center rounded-[2rem] p-6 text-center transition-shadow duration-300 hover:shadow-2xl sm:p-8">
    <div class="mb-5 h-24 w-24 overflow-hidden rounded-full border-4 border-white/50 shadow-lg sm:mb-6 sm:h-32 sm:w-32">
      <img :src="siteConfig.avatar" alt="Avatar" class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
    </div>
    
    <h1 class="mb-2 text-2xl font-bold tracking-[0.18em] text-white drop-shadow-md sm:text-3xl">
      {{ siteConfig.author }}
    </h1>
    
    <p class="mb-5 text-sm text-gray-200 drop-shadow sm:mb-6">
      {{ siteConfig.description }}
    </p>

    <div class="flex min-h-[4.5rem] w-full flex-col items-center justify-center border-t border-white/20 pt-4 sm:min-h-[5rem]">
      <p class="text-base font-light italic leading-relaxed text-white/90 drop-shadow-sm sm:text-lg">
        "{{ currentQuote }}"<span class="cursor-blink" v-show="isTyping">|</span>
      </p>
      <p class="mt-2 w-full text-right text-xs text-white/70 transition-opacity duration-1000 sm:text-sm" :class="isTyping ? 'opacity-0' : 'opacity-100'" v-show="currentSource">
        —— {{ currentSource }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { siteConfig } from '@/config';

const currentQuote = ref('');
const currentSource = ref('');
const isTyping = ref(true);
let typingTimer: number | undefined;
let typingDoneTimer: number | undefined;
let rotateTimer: number | undefined;
let lastLocalQuoteIndex = -1;
let isDisposed = false;

const clearTimers = () => {
  if (typingTimer !== undefined) {
    window.clearInterval(typingTimer);
    typingTimer = undefined;
  }

  if (typingDoneTimer !== undefined) {
    window.clearTimeout(typingDoneTimer);
    typingDoneTimer = undefined;
  }

  if (rotateTimer !== undefined) {
    window.clearTimeout(rotateTimer);
    rotateTimer = undefined;
  }
};

const getRotateInterval = () => {
  const interval = Number(siteConfig.hitokoto.rotateInterval);

  if (Number.isFinite(interval) && interval > 0) {
    return interval;
  }

  return 15000;
};

const scheduleNextQuote = () => {
  if (isDisposed) {
    return;
  }

  if (rotateTimer !== undefined) {
    window.clearTimeout(rotateTimer);
  }

  rotateTimer = window.setTimeout(() => {
    void fetchHitokoto();
  }, getRotateInterval());
};

const typeQuote = (text: string, source: string) => {
  if (isDisposed) {
    return;
  }

  clearTimers();

  const safeText = text?.trim() || '欢迎来到这里。';
  const safeSource = source?.trim() || '本站';
  let index = 0;

  currentQuote.value = '';
  currentSource.value = safeSource;
  isTyping.value = true;

  typingTimer = window.setInterval(() => {
    if (isDisposed) {
      clearTimers();
      return;
    }

    if (index < safeText.length) {
      currentQuote.value += safeText.charAt(index);
      index += 1;
      return;
    }

    if (typingTimer !== undefined) {
      window.clearInterval(typingTimer);
      typingTimer = undefined;
    }

    typingDoneTimer = window.setTimeout(() => {
      isTyping.value = false;
      scheduleNextQuote();
    }, 300);
  }, 100);
};

const fetchHitokoto = async () => {
  if (siteConfig.hitokoto.enableAPI) {
    try {
      const apiUrl = siteConfig.hitokoto.api || 'https://v1.hitokoto.cn';
      const res = await fetch(apiUrl);
      const data = await res.json();
      const text = typeof data?.hitokoto === 'string' ? data.hitokoto : '';
      const source = typeof data?.from === 'string' ? data.from : '一言';

      if (text) {
        typeQuote(text, source);
        return;
      }

      fallbackQuote();
    } catch (e) {
      fallbackQuote();
    }
  } else {
    fallbackQuote();
  }
};

const fallbackQuote = () => {
  const quotes = Array.isArray(siteConfig.hitokoto.localQuotes) ? siteConfig.hitokoto.localQuotes : [];

  if (!quotes.length) {
    typeQuote('欢迎来到这里。', '本站');
    return;
  }

  let nextIndex = Math.floor(Math.random() * quotes.length);

  if (quotes.length > 1 && nextIndex === lastLocalQuoteIndex) {
    nextIndex = (nextIndex + 1) % quotes.length;
  }

  lastLocalQuoteIndex = nextIndex;

  const quote = quotes[nextIndex];
  if (typeof quote === 'string') {
    typeQuote(quote, '未知');
  } else {
    typeQuote(quote.text, quote.from);
  }
};

onMounted(() => {
  void fetchHitokoto();
});

onBeforeUnmount(() => {
  isDisposed = true;
  clearTimers();
});
</script>
