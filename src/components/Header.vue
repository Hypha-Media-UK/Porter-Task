<template>
  <header class="header">
    <div class="header-left">
      <button v-if="shouldShowBackButton" class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    </div>
    
    <div class="header-center">
      <h1 v-if="routePath === '/tasks'">{{ currentShiftTitle }}</h1>
      <h1 v-else-if="routePath === '/tasks/pending'">Pending Tasks</h1>
      <h1 v-else-if="routePath === '/tasks/completed'">Completed Tasks</h1>
      <h1 v-else-if="routePath === '/archive'">Shift Archive</h1>
      <h1 v-else-if="routePath.startsWith('/archive/')">Shift Details</h1>
      <h1 v-else-if="routePath === '/settings'">Settings</h1>
      <h1 v-else-if="routePath === '/tasks/form'">
        {{ taskId ? 'Edit Task' : 'New Task' }}
      </h1>
      <h1 v-else>Porter Track</h1>
    </div>
    
    <div class="header-right">
      <button 
        v-if="isShiftActive && routePath !== '/tasks' && routePath !== '/tasks/pending' && routePath !== '/tasks/completed'" 
        class="tasks-button"
        @click="navigateToTasks"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M9 16l2 2 4-4"></path>
        </svg>
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

const navigateToTasks = () => {
  if (router) {
    router.push('/tasks')
  }
}

// Make sure 'inject' is defined
import { inject } from 'vue'
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left, .header-right {
  flex: 0 0 56px;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  flex: 1;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.back-button, .tasks-button {
  background: transparent;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.back-button:hover, .tasks-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (min-width: 768px) {
  .header {
    height: 70px;
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  h1 {
    font-size: var(--font-size-xl);
  }
}
</style>
