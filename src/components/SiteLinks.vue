<template>
  <div class="glass w-full rounded-[2rem] p-5 transition-shadow duration-300 hover:shadow-lg sm:p-8">
    <h2 class="mb-5 flex items-center gap-2 text-lg font-semibold drop-shadow-md sm:mb-6 sm:text-xl">
      <Icon icon="mdi:link-variant" class="text-2xl" />
      <span>快捷导航 / Links</span>
    </h2>
    
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <a 
        v-for="(link, index) in siteConfig.links" 
        :key="index"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="glass-dark group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-lg sm:gap-3 sm:p-4"
      >
        <Icon :icon="link.icon" class="text-2xl text-white/80 transition-colors group-hover:text-white sm:text-3xl" />
        <span class="text-xs font-medium text-white/90 group-hover:text-white sm:text-sm">{{ link.name }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { siteConfig } from '@/config';
</script>
