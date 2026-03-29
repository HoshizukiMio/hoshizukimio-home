<template>
  <!-- Allow scrolling if the content exceeds screen height -->
  <div class="app-shell relative isolate flex min-h-[100svh] w-full flex-col overflow-x-hidden overflow-y-auto px-3 py-4 sm:p-8">
    <Background />
    
    <main class="relative z-10 mx-auto my-auto flex w-full max-w-5xl flex-col items-stretch justify-center gap-4 py-4 animate-fade-in-up sm:gap-6 sm:py-8 md:flex-row md:gap-8">
      
      <!-- Left side (Profile) -->
      <div class="flex w-full justify-center md:w-[40%]">
        <ProfileCard />
      </div>

      <!-- Right side (Tools & Links) -->
      <div class="flex w-full flex-col gap-4 sm:gap-6 md:w-[60%]">
        <Clock />
        <SiteLinks />
        <MusicPlayer />
      </div>

    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Background from './components/Background.vue';
import Footer from './components/Footer.vue';
import ProfileCard from './components/ProfileCard.vue';
import SiteLinks from './components/SiteLinks.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import Clock from './components/Clock.vue';
</script>

<style>
.app-shell {
  padding-top: max(env(safe-area-inset-top), 1rem);
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}

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
