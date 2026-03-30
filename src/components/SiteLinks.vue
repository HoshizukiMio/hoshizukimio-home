<template>
  <div class="glass w-full rounded-[2rem] p-5 transition-shadow duration-300 hover:shadow-lg sm:p-8">
    <h2 class="mb-5 flex items-center gap-2 text-lg font-semibold drop-shadow-md sm:mb-6 sm:text-xl">
      <Icon icon="mdi:link-variant" class="text-2xl" />
      <span>快捷导航 / Links</span>
    </h2>
    
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <template v-for="(item, index) in siteConfig.links" :key="getItemKey(item, index)">
        <template v-if="isFolder(item)">
          <button
            type="button"
            class="glass-dark group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl p-3.5 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-lg sm:gap-3 sm:p-4"
            :class="activeFolder?.name === item.name ? 'bg-white/20 shadow-lg' : ''"
            @click="openFolder(item)"
          >
            <Icon :icon="item.icon || 'mdi:folder-outline'" class="text-2xl text-white/80 transition-colors group-hover:text-white sm:text-3xl" />
            <span class="text-xs font-medium text-white/90 group-hover:text-white sm:text-sm">{{ item.name }}</span>
            <span class="text-[11px] text-white/55 sm:text-xs">{{ item.children.length }} 个链接</span>
          </button>
        </template>

        <a
          v-else
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="glass-dark group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-lg sm:gap-3 sm:p-4"
        >
          <Icon :icon="item.icon" class="text-2xl text-white/80 transition-colors group-hover:text-white sm:text-3xl" />
          <span class="text-xs font-medium text-white/90 group-hover:text-white sm:text-sm">{{ item.name }}</span>
        </a>
      </template>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="activeFolder"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      @click.self="closeFolder"
    >
      <div class="glass w-full max-w-2xl rounded-[2rem] border border-white/15 p-5 shadow-2xl sm:p-6">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-3 text-lg font-semibold text-white sm:text-xl">
              <Icon :icon="activeFolder.icon || 'mdi:folder-outline'" class="text-2xl" />
              <span class="truncate">{{ activeFolder.name }}</span>
            </div>
            <p class="mt-1 text-sm text-white/60">点击下方链接即可跳转，点空白处或右上角可以关闭。</p>
          </div>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-white/15 hover:text-white"
            @click="closeFolder"
          >
            <Icon icon="mdi:close" class="text-xl" />
          </button>
        </div>

        <div v-if="activeFolder.children.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <a
            v-for="child in activeFolder.children"
            :key="`${activeFolder.name}-${child.name}`"
            :href="child.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex min-h-24 flex-col items-center justify-center gap-2.5 rounded-2xl bg-white/8 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
            @click="closeFolder"
          >
            <Icon :icon="child.icon" class="text-2xl text-white/80 transition-colors group-hover:text-white sm:text-3xl" />
            <span class="text-xs font-medium text-white/90 group-hover:text-white sm:text-sm">{{ child.name }}</span>
          </a>
        </div>

        <div v-else class="rounded-2xl bg-white/8 px-4 py-6 text-center text-sm text-white/60">
          这个文件夹里还没有配置链接
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { siteConfig, type SiteLinkFolder, type SiteLinkItem } from '@/config';

const activeFolder = ref<SiteLinkFolder | null>(null);

function isFolder(item: SiteLinkItem): item is SiteLinkFolder {
  return item.type === 'folder';
}

function getItemKey(item: SiteLinkItem, index: number) {
  return `${item.name}-${index}`;
}

function openFolder(folder: SiteLinkFolder) {
  activeFolder.value = folder;
}

function closeFolder() {
  activeFolder.value = null;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeFolder();
  }
}

watch(activeFolder, (folder) => {
  document.body.style.overflow = folder ? 'hidden' : '';
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>
