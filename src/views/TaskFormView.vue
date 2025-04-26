<template>
  <div class="task-form-view">
    <div class="form-container">
      <h1>{{ isEditing ? 'Edit Task' : 'New Task' }}</h1>
      
      <form class="task-form">
        <!-- Time Received - full width at top -->
        <div class="form-group time-received">
          <label for="receivedTime">Time Received</label>
          <input 
            type="time" 
            id="receivedTime" 
            v-model="formData.receivedTime" 
            class="form-control"
            required
          />
        </div>
        
        <div class="form-grid">
          <!-- Job Details Section -->
          <div class="form-section job-type">
            <h2 class="form-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Job Details
            </h2>
            
            <div class="form-group">
              <label for="jobCategory">Job Type</label>
              <select 
                id="jobCategory" 
                v-model="formData.jobCategory" 
                class="form-control"
                required
              >
                <option value="" disabled>Select job type</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div class="form-group job-item">
              <label for="itemType">Job Item</label>
              <select 
                id="itemType" 
                v-model="formData.itemType" 
                class="form-control"
                required
              >
                <option value="" disabled>Select job item</option>
                <option v-for="item in itemTypesForCategory" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </div>
          </div>
          
          <!-- Locations Section -->
          <div class="form-section">
            <h2 class="form-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Locations
            </h2>
            
            <div class="form-group from-section">
              <h2>From</h2>
              <select 
                id="fromLocationId"
                v-model="selectedFromLocation"
                class="form-control"
                required
              >
                <option value="" disabled>Select location</option>
                <option v-for="location in allLocations" :key="location.id" :value="location">
                  {{ location.name }} ({{ location.buildingName }})
                </option>
              </select>
              
              <div v-if="selectedFromLocation" class="building-info">
                Building: {{ selectedFromLocation.buildingName }}
              </div>
            </div>
            
            <div class="form-group to-section">
              <h2>To</h2>
              <select 
                id="toLocationId"
                v-model="selectedToLocation"
                class="form-control"
                required
              >
                <option value="" disabled>Select location</option>
                <option v-for="location in allLocations" :key="location.id" :value="location">
                  {{ location.name }} ({{ location.buildingName }})
                </option>
              </select>
              
              <div v-if="selectedToLocation" class="building-info">
                Building: {{ selectedToLocation.buildingName }}
              </div>
            </div>
          </div>
          
          <!-- Assignment Section -->
          <div class="form-section">
            <h2 class="form-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Assignment
            </h2>
            
            <div class="form-group porter-section">
              <h2>Porter Assigned</h2>
              <select 
                id="allocatedStaff"
                v-model="formData.allocatedStaff"
                class="form-control porter-select"
              >
                <option value="">None (Unassigned)</option>
                <option v-for="porter in porters" :key="porter" :value="porter">
                  {{ porter }}
                </option>
              </select>
            </div>
            
            <div class="form-group time-allocated">
              <label for="allocatedTime">Time Allocated</label>
              <input 
                type="time" 
                id="allocatedTime" 
                v-model="formData.allocatedTime" 
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group time-completed">
              <label for="completedTime">Time Completed</label>
              <input 
                type="time" 
                id="completedTime" 
                v-model="formData.completedTime" 
                class="form-control"
                :disabled="formData.status !== 'Completed'"
              />
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="cancel">
            Cancel
          </button>
          
          <!-- Delete button (edit mode only) -->
          <button 
            v-if="isEditing"
            type="button" 
            class="btn-danger" 
            @click="handleDeleteTask"
          >
            Delete
          </button>
          
          <button 
            type="button" 
            class="btn-primary" 
            :disabled="!isFormValid"
            @click="saveTask('Pending')"
          >
            Mark as Pending
          </button>
          
          <button 
            type="button" 
            class="btn-success" 
            :disabled="!isFormValid"
            @click="saveTask('Completed')"
          >
            {{ isEditing ? 'Update' : 'Complete Now' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useShiftStore } from '../stores/shift'
import { useSettingsStore } from '../stores/settings'
import type { Task, Location, RouteParams, JobCategoryDefault } from '../types'

// Props
const props = defineProps<{
  taskId?: string;
}>()

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Stores
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

const {
  createTask,
  updateTask,
  deleteTask,
  getTask
} = shiftStore
const isShiftActive = computed(() => shiftStore.isShiftActive)

const {
  jobCategories,
  buildings,
  porters
} = settingsStore

// State
const isEditing = computed(() => !!props.taskId)

// Current time helpers
const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const getTimeMinutesFromNow = (minutes: number) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + minutes)
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// Combined location type including building info
interface CombinedLocation {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  locationType: 'department' | 'ward';
}

// Selected locations
const selectedFromLocation = ref<CombinedLocation | null>(null)
const selectedToLocation = ref<CombinedLocation | null>(null)

// Form data
const formData = ref<{
  jobCategory: string;
  itemType: string;
  fromLocation: Location;
  toLocation: Location;
  allocatedStaff?: string;
  receivedTime: string;
  allocatedTime: string;
  completedTime: string;
  status?: 'Pending' | 'Completed';
}>({
  jobCategory: '',
  itemType: '',
  fromLocation: {
    building: '',
    locationId: '',
    locationType: 'department',
    displayName: ''
  },
  toLocation: {
    building: '',
    locationId: '',
    locationType: 'ward',
    displayName: ''
  },
  allocatedStaff: '',
  receivedTime: getCurrentTime(),
  allocatedTime: getTimeMinutesFromNow(1),
  completedTime: getTimeMinutesFromNow(17)
})

// Watch for changes in selected locations
watch(selectedFromLocation, (newLocation) => {
  if (newLocation) {
    formData.value.fromLocation = {
      building: newLocation.buildingId,
      locationId: newLocation.id,
      locationType: newLocation.locationType,
      displayName: newLocation.name
    }
  }
})

watch(selectedToLocation, (newLocation) => {
  if (newLocation) {
    formData.value.toLocation = {
      building: newLocation.buildingId,
      locationId: newLocation.id,
      locationType: newLocation.locationType,
      displayName: newLocation.name
    }
  }
})

// Form validation
const isFormValid = computed(() => {
  return (
    formData.value.jobCategory &&
    formData.value.itemType &&
    selectedFromLocation.value !== null &&
    selectedToLocation.value !== null
  )
})

// Computed properties
const categories = computed(() => {
  return Object.keys(jobCategories)
})

const itemTypesForCategory = computed(() => {
  const category = formData.value.jobCategory
  return category ? jobCategories[category] || [] : []
})

// Get all locations from all buildings
const allLocations = computed(() => {
  const locations: CombinedLocation[] = []
  
  buildings.forEach(building => {
    // Add departments
    building.departments.forEach(dept => {
      locations.push({
        id: dept.id,
        name: dept.name,
        buildingId: building.id,
        buildingName: building.name,
        locationType: 'department'
      })
    })
    
    // Add wards
    building.wards.forEach(ward => {
      locations.push({
        id: ward.id,
        name: ward.name,
        buildingId: building.id,
        buildingName: building.name,
        locationType: 'ward'
      })
    })
  })
  
  return locations.sort((a, b) => a.name.localeCompare(b.name))
})

// Find location by building and ID
const findLocationById = (buildingId: string, locationId: string, locationType: 'department' | 'ward'): CombinedLocation | undefined => {
  const building = buildings.find(b => b.id === buildingId)
  if (!building) return undefined
  
  const locations = locationType === 'department' ? building.departments : building.wards
  const location = locations.find(l => l.id === locationId)
  
  if (location) {
    return {
      id: location.id,
      name: location.name,
      buildingId: building.id,
      buildingName: building.name,
      locationType: locationType
    }
  }
  
  return undefined
}

const loadTask = () => {
  if (!props.taskId) return
  
  const task = getTask(props.taskId)
  
  if (task) {
    // Get time from ISO string if available or use defaults
    const receivedTime = task.receivedTime 
      ? new Date(task.receivedTime).toTimeString().substring(0, 5) 
      : getCurrentTime()
    
    const allocatedTime = task.allocatedTime 
      ? new Date(task.allocatedTime).toTimeString().substring(0, 5) 
      : getTimeMinutesFromNow(1)
    
    const completedTime = task.completedTime 
      ? new Date(task.completedTime).toTimeString().substring(0, 5) 
      : getTimeMinutesFromNow(17)
    
    // Set form data
    formData.value = {
      jobCategory: task.jobCategory,
      itemType: task.itemType,
      fromLocation: { ...task.fromLocation },
      toLocation: { ...task.toLocation },
      allocatedStaff: task.allocatedStaff,
      receivedTime,
      allocatedTime,
      completedTime,
      status: task.status
    }
    
    // Find and set selected locations
    const fromLoc = findLocationById(
      task.fromLocation.building, 
      task.fromLocation.locationId, 
      task.fromLocation.locationType
    )
    if (fromLoc) selectedFromLocation.value = fromLoc
    
    const toLoc = findLocationById(
      task.toLocation.building, 
      task.toLocation.locationId, 
      task.toLocation.locationType
    )
    if (toLoc) selectedToLocation.value = toLoc
  } else {
    // Task not found, go back to tasks view
    if (navigate) navigate('tasks')
  }
}

const saveTask = (status: 'Pending' | 'Completed' = 'Pending') => {
  if (!isFormValid.value) return
  
  // Convert time inputs (HH:MM) to ISO strings
  const now = new Date()
  const [receivedHours, receivedMinutes] = formData.value.receivedTime.split(':').map(Number)
  const [allocatedHours, allocatedMinutes] = formData.value.allocatedTime.split(':').map(Number)
  
  // Create date objects for the times
  const receivedDate = new Date(now)
  receivedDate.setHours(receivedHours, receivedMinutes, 0, 0)
  
  const allocatedDate = new Date(now)
  allocatedDate.setHours(allocatedHours, allocatedMinutes, 0, 0)
  
  // For completed time, only set if task is completed
  let completedDate: Date | undefined
  if (status === 'Completed' && formData.value.completedTime) {
    const [completedHours, completedMinutes] = formData.value.completedTime.split(':').map(Number)
    completedDate = new Date(now)
    completedDate.setHours(completedHours, completedMinutes, 0, 0)
  }
  
  // Prepare task data with specified status and ISO string times
  const taskData = {
    jobCategory: formData.value.jobCategory,
    itemType: formData.value.itemType,
    fromLocation: formData.value.fromLocation,
    toLocation: formData.value.toLocation,
    allocatedStaff: formData.value.allocatedStaff,
    receivedTime: receivedDate.toISOString(),
    allocatedTime: allocatedDate.toISOString(),
    completedTime: completedDate ? completedDate.toISOString() : undefined,
    status
  }
  
  if (isEditing.value && props.taskId) {
    // Update existing task if in edit mode
    updateTask(props.taskId, taskData)
  } else {
    // Create new task if in create mode
    createTask(taskData)
  }
  
  // Go back to tasks view
  if (navigate) navigate('tasks')
}

const handleDeleteTask = () => {
  if (isEditing.value && props.taskId) {
    // Delete the task
    deleteTask(props.taskId)
    
    // Go back to tasks view
    if (navigate) navigate('tasks')
  }
}

const cancel = () => {
  // Go back to tasks view
  if (navigate) navigate('tasks')
}

// Initialize
onMounted(() => {
  // If not in a shift, redirect to home
  if (!isShiftActive.value) {
    if (navigate) navigate('home')
    return
  }
  
  // Set default categories if available
  if (categories.value.length > 0) {
    formData.value.jobCategory = categories.value[0]
  }
  
  // If we have locations, set defaults
  if (allLocations.value.length > 0) {
    // Find a department for "from" location (or use first location)
    const defaultFromLoc = allLocations.value.find(l => l.locationType === 'department') || allLocations.value[0]
    selectedFromLocation.value = defaultFromLoc
    
    // Find a ward for "to" location (or use second location, or first if only one exists)
    const defaultToLoc = allLocations.value.find(l => l.locationType === 'ward') || 
                         (allLocations.value.length > 1 ? allLocations.value[1] : allLocations.value[0])
    selectedToLocation.value = defaultToLoc
  }
  
  // In edit mode, load task data
  if (isEditing.value) {
    loadTask()
  }
})

// Function to apply location defaults
const applyLocationDefaults = (defaults: JobCategoryDefault | undefined) => {
  if (!defaults) return;
  
  // Set from location
  if (defaults.fromBuildingId && defaults.fromLocationType) {
    const fromBuildingId = defaults.fromBuildingId;
    const fromLocationType = defaults.fromLocationType;
    
    // Only set if we have a valid building
    const building = buildings.find(b => b.id === fromBuildingId);
    if (building) {
      // If we have a locationId, try to find the exact location
      if (defaults.fromLocationId) {
        const locations = fromLocationType === 'department' ? building.departments : building.wards;
        const location = locations.find(l => l.id === defaults.fromLocationId);
        
        if (location) {
          const defaultFromLoc = {
            id: location.id,
            name: location.name,
            buildingId: building.id,
            buildingName: building.name,
            locationType: fromLocationType
          };
          selectedFromLocation.value = defaultFromLoc;
        }
      }
    }
  }
  
  // Set to location
  if (defaults.toBuildingId && defaults.toLocationType) {
    const toBuildingId = defaults.toBuildingId;
    const toLocationType = defaults.toLocationType;
    
    // Only set if we have a valid building
    const building = buildings.find(b => b.id === toBuildingId);
    if (building) {
      // If we have a locationId, try to find the exact location
      if (defaults.toLocationId) {
        const locations = toLocationType === 'department' ? building.departments : building.wards;
        const location = locations.find(l => l.id === defaults.toLocationId);
        
        if (location) {
          const defaultToLoc = {
            id: location.id,
            name: location.name,
            buildingId: building.id,
            buildingName: building.name,
            locationType: toLocationType
          };
          selectedToLocation.value = defaultToLoc;
        }
      }
    }
  }
};

// Watch for category changes to update item types and default locations
watch(() => formData.value.jobCategory, () => {
  // Reset item type when category changes
  formData.value.itemType = '';
  
  // Set default item type if available
  const items = itemTypesForCategory.value;
  if (items.length > 0) {
    formData.value.itemType = items[0];
  }
  
  // Set default locations based on job category (without item type)
  if (formData.value.jobCategory) {
    const defaults = settingsStore.getJobCategoryDefault(formData.value.jobCategory);
    applyLocationDefaults(defaults);
  }
});

// Watch for item type changes to update default locations
watch(() => formData.value.itemType, () => {
  // Only proceed if we have both category and item type
  if (formData.value.jobCategory && formData.value.itemType) {
    // Try to get defaults specific to this item type
    const defaults = settingsStore.getJobCategoryDefault(
      formData.value.jobCategory, 
      formData.value.itemType
    );
    
    // Apply the defaults if found
    if (defaults) {
      applyLocationDefaults(defaults);
    }
  }
});
</script>

<style scoped>
.task-form-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0;
  padding-bottom: 76px; /* Space for bottom buttons + safe area */
}

.form-container {
  flex: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
  color: var(--color-primary);
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xs);
  color: var(--color-text);
}

.task-form {
  background-color: white;
  padding: 0 var(--spacing-md) var(--spacing-lg);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

/* Card-style form sections for better visual grouping on mobile */
.form-section {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: var(--box-shadow-sm);
  margin-bottom: var(--spacing-sm);
}

.form-section-title {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.form-section-title svg {
  margin-right: var(--spacing-xs);
}

@media (min-width: 768px) {
  .task-form-view {
    padding: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .task-form {
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: var(--spacing-lg);
  }
  
  h1 {
    position: relative;
    box-shadow: none;
    background-color: transparent;
    margin-bottom: var(--spacing-lg);
  }
  
  /* Define grid layout for desktop */
  .job-type {
    grid-column: 1;
    grid-row: 1;
  }
  
  .job-item {
    grid-column: 2;
    grid-row: 1;
  }
  
  .from-section {
    grid-column: 1;
    grid-row: 2;
  }
  
  .to-section {
    grid-column: 2;
    grid-row: 2;
  }
  
  .porter-section {
    grid-column: 1;
    grid-row: 3;
  }
  
  .time-allocated {
    grid-column: 2;
    grid-row: 3;
  }
  
  .time-completed {
    grid-column: 2;
    grid-row: 4;
  }
}

.form-group {
  margin-bottom: var(--spacing-sm);
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-size: 12px;
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  font-size: 14px;
  background-color: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  height: 40px; /* Still accessible but smaller */
}

.form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  outline: none;
}

/* iOS-style select elements */
select.form-control {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4L6 7.5L9.5 4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.time-received {
  margin-bottom: var(--spacing-sm);
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: var(--box-shadow-sm);
}

.time-received label {
  font-size: 13px;
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.time-received input {
  border-left: 3px solid var(--color-primary);
}

.from-section h2, .to-section h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.from-section h2:before {
  content: "↑";
  color: var(--color-primary);
}

.to-section h2:before {
  content: "↓";
  color: var(--color-success);
}

.from-section select, .to-section select {
  margin-bottom: var(--spacing-xs);
}

.porter-section select {
  border-left: 3px solid var(--color-success);
}

.building-info {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-background-light);
  padding: 2px var(--spacing-sm);
  border-radius: var(--border-radius-pill);
  display: inline-block;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background-color: white;
  border-top: 1px solid var(--color-border);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .form-actions {
    position: static;
    box-shadow: none;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    justify-content: flex-end;
    gap: var(--spacing-md);
  }
}

/* Button styles - improved for mobile */
.btn-secondary {
  background-color: #f1f2f3;
  color: var(--color-text);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: 13px;
  cursor: pointer;
  flex: 1;
  transition: background-color var(--transition-fast);
  max-height: 50px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:active {
  background-color: #e5e5e5;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: 13px;
  cursor: pointer;
  flex: 1;
  transition: background-color var(--transition-fast);
  max-height: 50px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:active {
  background-color: var(--color-primary-dark, #0062cc);
}

.btn-primary:disabled {
  background-color: var(--color-primary-light, #80b7ff);
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-success {
  background-color: var(--color-success);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: 13px;
  cursor: pointer;
  flex: 1.5;
  transition: background-color var(--transition-fast);
  max-height: 50px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-success:active {
  background-color: var(--color-success-dark, #218838);
}

.btn-success:disabled {
  background-color: var(--color-success-light, #4caf7d);
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: 13px;
  cursor: pointer;
  flex: 1;
  transition: background-color var(--transition-fast);
  max-height: 50px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger:active {
  background-color: #bd2130;
}

/* Make sure buttons have adequate touch targets on mobile */
@media (max-width: 767px) {
  .btn-secondary, .btn-primary, .btn-success, .btn-danger {
    min-height: 50px;
  }
}
</style>
