<template>
  <nav class="tab-navigation">
    <button 
      v-if="isShiftActive" 
      class="nav-tab" 
      :class="{ active: currentRoute === 'tasks' }" 
      @click="navigate('tasks')"
      aria-label="Tasks"
    >
      <div class="nav-tab-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14l2 2 4-4"></path>
        </svg>
        <span v-if="pendingTasksCount > 0" class="badge-count" aria-label="{{ pendingTasksCount }} pending tasks">{{ pendingTasksCount }}</span>
      </div>
      <span>Tasks</span>
    </button>
    
    <button 
      class="nav-tab" 
      :class="{ active: currentRoute === 'home' }" 
      @click="navigate('home')"
      aria-label="Home"
    >
      <div class="nav-tab-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      <span>Home</span>
    </button>
    
    <button 
      class="nav-tab" 
      :class="{ active: currentRoute === 'archive' }" 
      @click="navigate('archive')"
      aria-label="Archive"
    >
      <div class="nav-tab-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      </div>
      <span>Archive</span>
    </button>
    
    <button 
      class="nav-tab" 
      :class="{ active: currentRoute === 'settings' }" 
      @click="navigate('settings')"
      aria-label="Settings"
    >
      <div class="nav-tab-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>
      <span>Settings</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useShiftStore } from '../stores/shift'
import type { RouteParams } from '../types'

// Props
const props = defineProps<{
  currentRoute: string;
}>()

// Emits
const emit = defineEmits<{
  (e: 'navigate', route: string, params?: RouteParams): void
}>()

// Store
const shiftStore = useShiftStore()
const isShiftActive = computed(() => shiftStore.isShiftActive)
const pendingTasksCount = computed(() => {
  if (!shiftStore.currentShift) return 0
  return shiftStore.currentShift.tasks.filter(task => task.status === 'Pending').length
})

// Methods
function navigate(route: string, params?: RouteParams) {
  emit('navigate', route, params)
}
</script>

<style scoped>
.tab-navigation {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-top: 1px solid var(--color-border-light);
  z-index: var(--z-index-nav);
  padding-bottom: var(--safe-area-inset-bottom);
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--spacing-sm) 0;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-tab-icon {
  position: relative;
  margin-bottom: 4px;
}

.nav-tab span {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.nav-tab.active {
  color: var(--color-primary);
}

.badge-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: var(--color-danger);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 4px;
}

@media (min-width: 768px) {
  .nav-tab span {
    font-size: var(--font-size-sm);
  }
}
</style>
