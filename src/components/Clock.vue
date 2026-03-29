<template>
  <div class="glass flex w-full flex-col gap-4 rounded-[2rem] p-5 transition-shadow duration-300 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
    <div class="flex flex-col items-start">
      <div class="font-mono text-3xl font-bold tracking-wider drop-shadow-md sm:text-5xl">
        {{ time }}
      </div>
      <div class="mt-2 text-xs text-gray-200 drop-shadow sm:text-base">
        {{ date }}
      </div>
    </div>
    <div class="self-end text-5xl opacity-80 drop-shadow-md sm:self-auto sm:text-6xl">
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
