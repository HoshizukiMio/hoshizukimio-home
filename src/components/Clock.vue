<template>
  <div class="glass rounded-3xl p-6 sm:p-8 w-full flex flex-row items-center justify-between hover:shadow-lg transition-shadow duration-300">
    <div class="flex flex-col items-start">
      <div class="text-4xl sm:text-5xl font-bold tracking-wider drop-shadow-md font-mono">
        {{ time }}
      </div>
      <div class="text-sm sm:text-base text-gray-200 mt-2 drop-shadow">
        {{ date }}
      </div>
    </div>
    <div class="text-6xl opacity-80 drop-shadow-md">
      <Icon icon="mdi:clock-outline" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

const time = ref('');
const date = ref('');
let timer: number | null = null;

const updateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString('zh-CN', { hour12: false });
  date.value = now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000) as unknown as number;
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
