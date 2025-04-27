<template>
  <Header />
  
  <main class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useShiftStore } from './stores/shift'
import { useSettingsStore } from './stores/settings'
import Header from './components/Header.vue'

const router = useRouter()
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

const { loadShiftData, isShiftActive } = shiftStore

onMounted(async () => {
  console.log('App mounted - initializing application...')
  
  // Initialize settings and location data
  await settingsStore.initialize()
  
  // Initialize shift data
  await loadShiftData()
  
  // If a shift is active, navigate to the tasks screen
  if (isShiftActive && router.currentRoute.value.name === 'home') {
    console.log('Active shift detected, navigating to tasks screen')
    router.push({ name: 'tasks' })
  }
})

// Watch for shift status changes
watch(() => isShiftActive, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    // If shift ended, go to home
    router.push({ name: 'home' })
  }
})
</script>

<style>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height, 60px));
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
