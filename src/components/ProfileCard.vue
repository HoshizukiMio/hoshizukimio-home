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
import { ref, onMounted } from 'vue';
import { siteConfig } from '@/config';

const currentQuote = ref('');
const currentSource = ref('');
const isTyping = ref(true);

const fetchHitokoto = async () => {
  if (siteConfig.hitokoto.enableAPI) {
    try {
      const apiUrl = siteConfig.hitokoto.api || 'https://v1.hitokoto.cn';
      const res = await fetch(apiUrl);
      const data = await res.json();
      typeQuote(data.hitokoto, data.from);
    } catch (e) {
      fallbackQuote();
    }
  } else {
    fallbackQuote();
  }
};

const fallbackQuote = () => {
  const quotes = siteConfig.hitokoto.localQuotes;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  // Check if it's an object with text and from, or just a string from old config
  if (typeof quote === 'string') {
    typeQuote(quote, '未知');
  } else {
    typeQuote(quote.text, quote.from);
  }
};

const typeQuote = (text: string, source: string) => {
  let index = 0;
  currentQuote.value = '';
  currentSource.value = source;
  isTyping.value = true;
  const interval = setInterval(() => {
    if (index < text.length) {
      currentQuote.value += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        isTyping.value = false;
      }, 300); // Small delay before hiding cursor and showing source
    }
  }, 100);
};

onMounted(() => {
  fetchHitokoto();
});
</script>
