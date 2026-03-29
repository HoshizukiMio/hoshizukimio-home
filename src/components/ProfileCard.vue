<template>
  <div class="glass rounded-3xl p-8 flex flex-col items-center justify-center w-full max-w-sm mx-auto hover:shadow-2xl transition-shadow duration-300 h-full">
    <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-lg mb-6">
      <img :src="siteConfig.avatar" alt="Avatar" class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
    </div>
    
    <h1 class="text-3xl font-bold tracking-wider mb-2 text-white drop-shadow-md">
      {{ siteConfig.author }}
    </h1>
    
    <p class="text-sm text-gray-200 mb-6 drop-shadow">
      {{ siteConfig.description }}
    </p>

    <div class="w-full border-t border-white/20 pt-4 flex flex-col items-center justify-center min-h-[5rem]">
      <p class="text-lg font-light text-white/90 italic drop-shadow-sm text-center">
        "{{ currentQuote }}"<span class="cursor-blink" v-show="isTyping">|</span>
      </p>
      <p class="text-sm text-white/70 mt-2 w-full text-right transition-opacity duration-1000" :class="isTyping ? 'opacity-0' : 'opacity-100'" v-show="currentSource">
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
