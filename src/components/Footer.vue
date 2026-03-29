<template>
  <footer
    v-if="siteConfig.footer?.enabled !== false && footerItems.length > 0"
    class="relative z-10 mx-auto mt-4 w-full max-w-5xl pb-1 pt-2 text-xs text-white/70 sm:mt-6 sm:text-sm"
  >
    <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-2 text-center">
      <template v-for="(item, index) in footerItems" :key="`${item.text}-${index}`">
        <span v-if="index > 0" class="text-white/30">·</span>
        <a
          v-if="item.href"
          :href="item.href"
          :target="item.target || '_blank'"
          :rel="item.rel || 'noopener noreferrer'"
          class="transition-colors duration-300 hover:text-white"
        >
          {{ item.text }}
        </a>
        <span v-else>{{ item.text }}</span>
      </template>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { siteConfig } from '@/config';

type FooterItem =
  | string
  | {
      text: string;
      href?: string;
      target?: string;
      rel?: string;
    };

const footerItems = computed(() => {
  const items = Array.isArray(siteConfig.footer?.items)
    ? (siteConfig.footer.items as FooterItem[])
    : [];

  return items
    .map((item) =>
      typeof item === 'string'
        ? { text: item.trim() }
        : {
            text: item.text.trim(),
            href: item.href?.trim(),
            target: item.target?.trim(),
            rel: item.rel?.trim(),
          },
    )
    .filter((item) => item.text.length > 0);
});
</script>
