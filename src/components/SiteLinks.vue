<template>
  <div class="glass rounded-3xl p-6 sm:p-8 w-full hover:shadow-lg transition-shadow duration-300">
    <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 drop-shadow-md">
      <Icon icon="mdi:link-variant" class="text-2xl" />
      <span>快捷导航 / Links</span>
    </h2>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <a 
        v-for="(link, index) in siteConfig.links" 
        :key="index"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="glass-dark hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 group cursor-pointer"
      >
        <Icon :icon="link.icon" class="text-3xl text-white/80 group-hover:text-white transition-colors" />
        <span class="text-sm font-medium text-white/90 group-hover:text-white">{{ link.name }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { siteConfig } from '@/config';
</script>
