<template>
  <main class="home-view">
    <div v-if="isLoading" class="home-loading">
      <LoadingSpinner message="Loading shift data..." />
    </div>
    
    <template v-else>
      <section v-if="isShiftActive && currentShift" class="active-shift">
        <h1>Current Shift</h1>
        
        <!-- Current shift overview -->
        <ShiftOverview 
          :shift="currentShift" 
          :showEndButton="false"
        />
        
        <!-- Open shift button -->
        <div class="shift-actions">
          <button class="btn-primary" @click="safeNavigate('tasks')">Open Shift</button>
        </div>
        
        <!-- Previous shift summary (if available) -->
        <div v-if="previousShift" class="previous-shift">
          <h2>Previous Shift</h2>
          <ShiftOverview 
            :shift="previousShift" 
            :showEndButton="false"
            variant="previous"
          />
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
          
          <!-- Porter Selection Before Shift Starts -->
          <PorterSelectionForm
            :available-porters="allPorters"
            :assigned-porters="initialPorters"
            @add-porter="handleAddInitialPorter"
            @remove-porter="handleRemoveInitialPorter"
          />
          
          <div class="shift-actions">
            <button 
              class="btn-primary"
              @click="startSpecificShift('Day')"
              :disabled="!supervisor"
            >
              Start Day Shift
            </button>
            <button 
              class="btn-secondary"
              @click="startSpecificShift('Night')"
              :disabled="!supervisor"
            >
              Start Night Shift
            </button>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useShiftStore } from '../stores/shift'
import { useSettingsStore } from '../stores/settings'
import { formatDate, formatTime } from '../utils/date'
import type { RouteParams, ShiftType, Shift } from '../types'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ShiftOverview from '../components/ShiftOverview.vue'
import PorterSelectionForm from '../components/porter/PorterSelectionForm.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Safe navigation wrapper
const safeNavigate = (route: string, params?: RouteParams) => {
  if (navigate) {
    navigate(route, params)
  }
}

// Store
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

const {
  isShiftActive,
  currentShift,
  startShift,
  endShift,
  addPorterToShift,
  removePorterFromShift,
  loadShiftData
} = shiftStore

// Loading state
const isLoading = ref(true)

// Supervisors and porters lists
const supervisors = computed(() => {
  return settingsStore.supervisors
})

const allPorters = computed(() => {
  return settingsStore.porters
})

// Local state
const supervisor = ref('')
const initialPorters = ref<string[]>([])

// Get the most recent archived shift (if any)
const previousShift = computed(() => {
  const archived = shiftStore.archivedShifts;
  if (!archived || archived.length === 0) return null;
  
  // Sort by date (most recent first)
  const sorted = [...archived].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
  
  return sorted[0];
});

// Methods
const startSpecificShift = async (type: ShiftType) => {
  try {
    if (!supervisor.value) return
    
    // Start the shift with the supervisor
    const newShift = await startShift(type, supervisor.value)
    
    // Add any porters that were pre-selected
    if (initialPorters.value && initialPorters.value.length > 0) {      
      // Add each porter to the shift
      for (const porter of initialPorters.value) {
        try {
          await addPorterToShift(porter)
        } catch (err) {
          console.error(`Error adding porter ${porter}:`, err)
        }
      }
      
      // Clear the initial porters list
      initialPorters.value = []
    }
    
    // Navigate to the tasks view
    safeNavigate('tasks')
  } catch (error) {
    console.error('Error starting shift:', error)
  }
}

// Initial porter assignment (before shift starts)
const handleAddInitialPorter = (porter: string) => {
  if (!initialPorters.value.includes(porter)) {
    initialPorters.value.push(porter)
  }
}

const handleRemoveInitialPorter = (porter: string) => {
  const index = initialPorters.value.indexOf(porter)
  if (index !== -1) {
    initialPorters.value.splice(index, 1)
  }
}


const endCurrentShift = async () => {
  try {
    await endShift()
    
    // Force UI refresh by navigating back to home
    safeNavigate('home')
  } catch (error) {
    console.error('Error ending shift:', error)
  }
}

// Initialize data
onMounted(async () => {
  try {
    // Load settings data
    await settingsStore.initialize()
    
    // Load shift data
    await loadShiftData()
    
    // Set default supervisor if available
    if (supervisors.value.length > 0) {
      supervisor.value = supervisors.value[0]
    }
  } catch (error) {
    console.error('Error initializing home view:', error)
  } finally {
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

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.shift-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.shift-info {
  margin-bottom: 20px;
}

.shift-supervisor {
  color: #666;
  margin-top: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.shift-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.new-shift {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shift-form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
