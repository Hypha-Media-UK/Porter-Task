<template>
  <nav class="tab-navigation">
    <button 
      v-if="isShiftActive" 
      class="nav-tab" 
      :class="{ active: currentRoute === 'tasks', 'current-shift': isShiftActive && currentRoute === 'settings' }" 
      @click="navigate('tasks')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        <path d="M9 14l2 2 4-4"></path>
      </svg>
      <span>Current Shift</span>
    </button>
    
    <button 
      class="nav-tab" 
      :class="{ active: currentRoute === 'home', 'new-shift': !isShiftActive }" 
      @click="navigate('home')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span>{{ isShiftActive ? 'Home' : 'New Shift' }}</span>
    </button>
    
    <button 
      class="nav-tab" 
      :class="{ active: currentRoute === 'archive' }" 
      @click="navigate('archive')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
      <span>Archive</span>
    </button>
    
    <button 
      class="nav-tab" 
      :class="{ active: currentRoute === 'settings' }" 
      @click="navigate('settings')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
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

// Methods
function navigate(route: string, params?: RouteParams) {
  emit('navigate', route, params)
}
</script>

<style scoped>
.tab-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  height: 60px;
  z-index: 100;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--spacing-xs) 0;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-tab svg {
  margin-bottom: 2px;
}

.nav-tab span {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.nav-tab.active {
  color: var(--color-primary);
}

.nav-tab.new-shift {
  color: white;
  background-color: var(--color-primary);
  margin: -10px var(--spacing-md) 0;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.3);
  padding: var(--spacing-xs) 0;
  z-index: 101;
  max-width: 180px;
}

.nav-tab.new-shift:hover {
  background-color: var(--color-primary-dark);
}

.nav-tab.current-shift {
  position: relative;
}

.nav-tab.current-shift::after {
  content: "";
  position: absolute;
  top: -3px;
  right: 30%;
  left: 30%;
  height: 3px;
  background-color: var(--color-success);
  border-radius: 0 0 2px 2px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (min-width: 768px) {
  .nav-tab span {
    font-size: var(--font-size-sm);
  }
  
  .nav-tab.new-shift {
    margin: -15px var(--spacing-lg) 0;
  }
}
</style>
