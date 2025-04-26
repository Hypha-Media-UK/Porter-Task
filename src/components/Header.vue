<template>
  <header class="header">
    <div class="header-left">
      <!-- Back button (only shown when needed) -->
      <button v-if="shouldShowBackButton" class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <!-- Navigation icons (now on left side as requested) -->
      <div class="nav-icons">
        <!-- Home Icon (without active state) -->
        <button 
          class="nav-button"
          @click="navigateTo('/')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
        
        <!-- Archive Icon -->
        <button 
          class="nav-button"
          :class="{ active: routePath === '/archive' }"
          @click="navigateTo('/archive')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </button>
        
        <!-- Settings Icon -->
        <button 
          class="nav-button"
          :class="{ active: routePath === '/settings' }"
          @click="navigateTo('/settings')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Page title (not shown on home screen) -->
    <h1 v-if="routePath === '/tasks'" class="page-title">{{ currentShiftTitle }}</h1>
    <h1 v-else-if="routePath === '/tasks/pending'" class="page-title">Pending Tasks</h1>
    <h1 v-else-if="routePath === '/tasks/completed'" class="page-title">Completed Tasks</h1>
    <h1 v-else-if="routePath === '/archive'" class="page-title">Shift Archive</h1>
    <h1 v-else-if="routePath.startsWith('/archive/')" class="page-title">Shift Details</h1>
    <h1 v-else-if="routePath === '/settings'" class="page-title">Settings</h1>
    <h1 v-else-if="routePath === '/tasks/form'" class="page-title">
      {{ taskId ? 'Edit Task' : 'New Task' }}
    </h1>
    
    <!-- Tasks Icon (now on right side with permanent active state) -->
    <div class="header-right">
      <button 
        v-if="isShiftActive" 
        class="nav-button tasks-button active"
        @click="navigateTo('/tasks')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14l2 2 4-4"></path>
        </svg>
        <span v-if="pendingTasksCount > 0" class="badge-count">{{ pendingTasksCount }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Router, RouteLocationNormalized } from 'vue-router'
import { useShiftStore } from '../stores/shift'
import { formatDate } from '../utils/date'

// Props
const props = defineProps<{
  taskId?: string;
}>()

// Get route and router via injection
const route = inject<RouteLocationNormalized>('route')
const router = inject<Router>('router')

// Store
const shiftStore = useShiftStore()
const currentShift = shiftStore.currentShift
const isShiftActive = computed(() => shiftStore.isShiftActive)

// For use in template
const routePath = computed(() => route?.path || '/')

// Computed
const shouldShowBackButton = computed(() => {
  // Show back button on all pages except the main task screen when a shift is active
  if (routePath.value === '/tasks' && isShiftActive.value) {
    return false
  }
  
  // Show back button on all pages except home when no shift is active
  return routePath.value !== '/'
})

const currentShiftTitle = computed(() => {
  if (!currentShift) return 'Current Shift'
  
  const date = new Date(currentShift.date)
  const formattedDate = formatDate(date)
  
  return `${currentShift.type} Shift ${formattedDate}`
})

const pendingTasksCount = computed(() => {
  if (!shiftStore.currentShift) return 0
  return shiftStore.currentShift.tasks.filter(task => task.status === 'Pending').length
})

// Methods
const goBack = () => {
  if (!router) return
  
  if (routePath.value === '/tasks/pending' || routePath.value === '/tasks/completed') {
    router.push('/tasks')
  } else if (routePath.value.startsWith('/archive/')) {
    router.push('/archive')
  } else if (routePath.value === '/tasks/form') {
    router.back()
  } else {
    router.push('/')
  }
}

const navigateTo = (path) => {
  if (router) {
    router.push(path)
  }
}

// Make sure 'inject' is defined
import { inject } from 'vue'
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.header-right {
  display: flex;
  align-items: center;
}

.page-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.tasks-button {
  margin-left: var(--spacing-xs);
}

h1 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.back-button {
  background: transparent;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-icons {
  display: flex;
  gap: var(--spacing-xs);
}

.nav-button {
  position: relative;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-button.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-button:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.badge-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--color-danger);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

@media (min-width: 768px) {
  .header {
    height: 70px;
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  h1 {
    font-size: var(--font-size-xl);
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
  }
  
  .nav-icons {
    gap: var(--spacing-sm);
  }
}
</style>
