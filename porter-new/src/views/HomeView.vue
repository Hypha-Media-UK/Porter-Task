<template>
  <div class="home-view">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    
    <section v-else-if="isShiftActive" class="active-shift">
      <h1>Current Shift</h1>
      
      <!-- Current shift overview (will be a component) -->
      <div class="shift-card">
        <div class="shift-header">
          <div class="shift-date">{{ formattedDate }}</div>
          <div class="shift-type">{{ shiftType }} Shift</div>
        </div>
        <div class="shift-info">
          <p>Supervisor: {{ supervisor }}</p>
          <p>Started: {{ startTime }}</p>
        </div>
      </div>
      
      <!-- Open shift button -->
      <div class="shift-actions">
        <button class="btn-primary" @click="openShift">Open Shift</button>
      </div>
    </section>
    
    <section v-else class="new-shift">
      <h1>Start New Shift</h1>
      <p>Create a new porter shift to start tracking and managing tasks.</p>
      
      <div class="shift-form">
        <div class="form-group">
          <label for="supervisor">Supervisor</label>
          <select 
            id="supervisor" 
            v-model="supervisor" 
            class="form-control"
          >
            <option value="" disabled>Select Supervisor</option>
            <option v-for="sup in supervisors" :key="sup" :value="sup">{{ sup }}</option>
          </select>
        </div>
        
        <div class="shift-actions">
          <button 
            class="btn-primary"
            @click="startShift('Day')"
            :disabled="!supervisor"
          >
            Start Day Shift
          </button>
          <button 
            class="btn-secondary"
            @click="startShift('Night')"
            :disabled="!supervisor"
          >
            Start Night Shift
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShiftStore } from '@/stores/shiftStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { ShiftType } from '@/types'

// Router
const router = useRouter()

// Stores
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

// State
const isLoading = computed(() => shiftStore.isLoading || settingsStore.isLoading)
const isShiftActive = computed(() => !!shiftStore.currentShift)
const supervisor = ref('')
const error = ref<string | null>(null)

// Computed properties
const supervisors = computed(() => settingsStore.supervisors)

const shiftType = computed(() => {
  return shiftStore.currentShift?.type || ''
})

const startTime = computed(() => {
  if (!shiftStore.currentShift?.startTime) return ''
  const date = new Date(shiftStore.currentShift.startTime)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})

const formattedDate = computed(() => {
  if (!shiftStore.currentShift?.date) return ''
  const date = new Date(shiftStore.currentShift.date)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Methods
const startShift = async (type: ShiftType) => {
  if (!supervisor.value) {
    error.value = 'Please select a supervisor'
    return
  }
  
  try {
    await shiftStore.startShift(type, supervisor.value)
    router.push('/tasks')
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
      alert(error.value)
    } else {
      error.value = 'Failed to start shift'
      alert(error.value)
    }
  }
}

const openShift = () => {
  router.push('/tasks')
}

// Initialize data
onMounted(async () => {
  // Load settings if not already loaded
  if (!settingsStore.supervisors.length) {
    await settingsStore.initialize()
  }
  
  // Load shift data
  await shiftStore.loadShiftData()
})
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  font-size: 24px;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 102, 204, 0.2);
  border-top-color: #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.shift-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.shift-type {
  background-color: #0066cc;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 14px;
}

.shift-info {
  padding: 1rem;
}

.shift-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.shift-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0055aa;
}

.btn-primary:disabled {
  background-color: #88b8e8;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-secondary:disabled {
  background-color: #a1a8ae;
  cursor: not-allowed;
}
</style>
