<template>
  <main class="home-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="home-loading">
      <LoadingSpinner message="Loading shift data..." />
    </div>
    
    <template v-else>
      <section v-if="isShiftActive && currentShift" class="active-shift">
        <h1>Current Shift</h1>
        <p>Shift is active.</p>
      </section>
      
      <section v-else class="new-shift">
        <h1>Start New Shift</h1>
        <p>Create a new porter shift to start tracking and managing tasks.</p>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useShiftStore } from '../stores/shift'
import { useSettingsStore } from '../stores/settings'
import { formatDate, formatTime } from '../utils/date'
import type { RouteParams } from '../types'
import LoadingSpinner from '../components/LoadingSpinner.vue'

// Store
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

const {
  isShiftActive,
  currentShift,
  archivedShifts,
  loadShiftData
} = shiftStore

// Loading state
const isLoading = ref(true)

// Initialize data
onMounted(async () => {
  try {
    // Load settings data
    await settingsStore.initialize()
    
    // Load shift data
    await loadShiftData()
  } catch (error) {
    console.error('Error initializing home view:', error)
  } finally {
    // Even if there was an error, show the UI
    isLoading.value = false
  }
})
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.home-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
