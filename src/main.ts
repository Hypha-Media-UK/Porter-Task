import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'

// Import global styles for enhanced UI
import './assets/css/globals.css'

// Initialize stores
const pinia = createPinia()

// Create app instance
const app = createApp(App)

// Install plugins
app.use(pinia)
app.use(router)

// Provide router instance for components that need it
app.provide('router', router)
app.provide('route', router.currentRoute)
app.provide('navigate', (route: string, params?: any) => {
  if (route === 'home') {
    router.push({ name: 'home' })
  } else if (route === 'tasks') {
    router.push({ name: 'tasks' })
  } else if (route === 'pendingTasks') {
    router.push({ name: 'pendingTasks' })
  } else if (route === 'completedTasks') {
    router.push({ name: 'completedTasks' })
  } else if (route === 'taskForm') {
    router.push({
      name: 'taskForm',
      query: params?.taskId ? { taskId: params.taskId } : undefined
    })
  } else if (route === 'archive') {
    router.push({ name: 'archive' })
  } else if (route === 'shiftDetail') {
    router.push({
      name: 'shiftDetail',
      params: { shiftId: params?.shiftId }
    })
  } else if (route === 'settings') {
    router.push({ name: 'settings' })
  }
})

// Import stores for initialization
import { useShiftStore } from './stores/shift'
import { useSettingsStore } from './stores/settings'

// Initialize application data
app.config.globalProperties.$appInitialized = false

// Initialize core data before mounting
const initializeApp = async () => {
  try {
    // Initialize settings first
    const settingsStore = useSettingsStore()
    await settingsStore.initialize()
    
    // Then initialize shift data
    const shiftStore = useShiftStore()
    await shiftStore.loadShiftData()
    
    console.log('App mounted - initializing application...')
    app.config.globalProperties.$appInitialized = true
  } catch (err) {
    console.error('Error initializing application:', err)
  }
}

// Initialize and mount
initializeApp()

// Listen for shift-ended event to redirect to home
window.addEventListener('shift-ended', () => {
  // Navigate to home page when a shift is ended
  router.push({ name: 'home' })
})

// Mount app
app.mount('#app')
