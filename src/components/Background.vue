<template>
  <div class="fixed inset-0 z-[-1] overflow-hidden">
    <div 
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
      :style="{ backgroundImage: `url(${bgUrl})` }"
      :class="{ 'opacity-100': isLoaded, 'opacity-0': !isLoaded }"
    ></div>
    <!-- Dark overlay to improve readability -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { siteConfig } from '@/config';

const bgUrl = ref('');
const isLoaded = ref(false);

onMounted(() => {
  let targetUrl = '';
  
  if (siteConfig.background.mode === 'api') {
    // Append timestamp to prevent caching the same image from API
    targetUrl = `${siteConfig.background.api}?t=${new Date().getTime()}`;
  } else {
    // Pick randomly from the list
    const list = siteConfig.background.list;
    if (list && list.length > 0) {
      targetUrl = list[Math.floor(Math.random() * list.length)];
    } else {
      // Fallback
      targetUrl = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1920&auto=format&fit=crop';
    }
  }

  const img = new Image();
  img.src = targetUrl;
  img.onload = () => {
    bgUrl.value = img.src;
    isLoaded.value = true;
  };
  img.onerror = () => {
    // fallback if loading fails
    bgUrl.value = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1920&auto=format&fit=crop';
    isLoaded.value = true;
  };
});
</script>
