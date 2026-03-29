<template>
  <!-- Allow scrolling if the content exceeds screen height -->
  <div class="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
    <Background />
    
    <main class="w-full max-w-5xl flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 relative z-10 animate-fade-in-up py-8">
      
      <!-- Left side (Profile) -->
      <div class="w-full md:w-[40%] flex justify-center">
        <ProfileCard />
      </div>

      <!-- Right side (Tools & Links) -->
      <div class="w-full md:w-[60%] flex flex-col gap-6">
        <Clock />
        <SiteLinks />
        <MusicPlayer />
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import Background from './components/Background.vue';
import ProfileCard from './components/ProfileCard.vue';
import SiteLinks from './components/SiteLinks.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import Clock from './components/Clock.vue';
</script>

<style>
.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Base styles already in style.css, but we can ensure layout fits well */
</style>
