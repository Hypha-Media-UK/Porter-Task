<template>
  <div class="task-form-view">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading form data...</p>
    </div>
    
    <div v-else class="form-container">
      <h1>{{ isEditing ? 'Edit Task' : 'New Task' }}</h1>
      
      <form class="task-form" @submit.prevent="saveTask">
        <!-- Time Received -->
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
            <h2 class="form-section-title">Job Details</h2>
            
            <div class="form-group">
              <label for="jobCategory">Job Type</label>
              <select 
                id="jobCategory" 
                v-model="formData.jobCategory" 
                class="form-control"
                required
              >
                <option value="" disabled>Select job type</option>
                <option v-for="category in jobCategories" :key="category" :value="category">
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
            <h2 class="form-section-title">Locations</h2>
            
            <div class="form-group from-section">
              <h3>From</h3>
              <select 
                id="fromLocationId"
                v-model="formData.fromLocation"
                class="form-control"
                required
              >
                <option value="" disabled>Select location</option>
                <option v-for="location in allLocations" :key="location.id" :value="location.id">
                  {{ location.name }} {{ location.frequent ? '★' : '' }}
                </option>
              </select>
              
              <div v-if="formData.fromLocation" class="building-info">
                Building: {{ getBuildingName(formData.fromLocation) }}
              </div>
            </div>
            
            <div class="form-group to-section">
              <h3>To</h3>
              <select 
                id="toLocationId"
                v-model="formData.toLocation"
                class="form-control"
                required
              >
                <option value="" disabled>Select location</option>
                <option v-for="location in allLocations" :key="location.id" :value="location.id">
                  {{ location.name }} {{ location.frequent ? '★' : '' }}
                </option>
              </select>
              
              <div v-if="formData.toLocation" class="building-info">
                Building: {{ getBuildingName(formData.toLocation) }}
              </div>
            </div>
          </div>
          
          <!-- Assignment Section -->
          <div class="form-section">
            <h2 class="form-section-title">Assignment</h2>
            
            <div class="form-group porter-section">
              <h3>Porter Assigned</h3>
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
          <!-- Cancel button - always visible -->
          <button type="button" class="btn-secondary" @click="cancel">
            Cancel
          </button>
          
          <!-- Delete button (edit mode only) -->
          <button 
            v-if="isEditing"
            type="button" 
            class="btn-danger" 
            @click="confirmDeleteTask"
          >
            Delete
          </button>
          
          <!-- Mark as Pending button -->
          <button 
            type="button" 
            class="btn-secondary" 
            @click="saveWithStatus('Pending')"
          >
            {{ isEditing && formData.status === 'Completed' ? 'Move to Pending' : 'Mark as Pending' }}
          </button>
          
          <!-- Mark as Completed button -->
          <button 
            type="button" 
            class="btn-success" 
            @click="saveWithStatus('Completed')"
          >
            {{ isEditing && formData.status === 'Pending' ? 'Mark as Completed' : 'Complete Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Router
const router = useRouter()
const route = useRoute()

// Props
const props = defineProps<{
  taskId?: string;
}>()

// State
const isLoading = ref(false)
const isEditing = computed(() => !!props.taskId)

// Mock data for the form
const jobCategories = ref(['Patient Transport', 'Specimen Delivery', 'Equipment', 'General'])
const jobItems = ref({
  'Patient Transport': ['Wheelchair', 'Stretcher', 'Bed'],
  'Specimen Delivery': ['Blood Sample', 'Urine Sample', 'Other Specimen'],
  'Equipment': ['Oxygen Cylinder', 'IV Stand', 'Monitor', 'Other'],
  'General': ['Generic Task']
})
const porters = ref(['John Porter', 'Sarah Porter', 'Mike Handler', 'Emma Rodriguez'])
const buildings = ref([
  {
    id: 'b1',
    name: 'Main Hospital',
    departments: [
      { id: 'd1', name: 'Accident and Emergency', frequent: true },
      { id: 'd2', name: 'Outpatients', frequent: true },
      { id: 'd3', name: 'Medical Records', frequent: false }
    ]
  },
  {
    id: 'b2',
    name: 'New Fountain House',
    departments: [
      { id: 'd4', name: 'Pathology', frequent: true },
      { id: 'd5', name: 'Pharmacy', frequent: false }
    ]
  }
])

// Initialize form data
const formData = ref({
  jobCategory: '',
  itemType: '',
  fromLocation: '',
  toLocation: '',
  allocatedStaff: '',
  receivedTime: getCurrentTime(),
  allocatedTime: getCurrentTime(),
  completedTime: '',
  status: 'Pending'
})

// Computed properties
const itemTypesForCategory = computed(() => {
  return jobItems.value[formData.value.jobCategory as keyof typeof jobItems.value] || []
})

const allLocations = computed(() => {
  const locations = []
  for (const building of buildings.value) {
    for (const dept of building.departments) {
      locations.push({
        id: dept.id,
        name: dept.name,
        buildingId: building.id,
        buildingName: building.name,
        frequent: dept.frequent
      })
    }
  }
  
  // Sort so frequent locations appear first
  return locations.sort((a, b) => {
    if (a.frequent && !b.frequent) return -1
    if (!a.frequent && b.frequent) return 1
    return a.name.localeCompare(b.name)
  })
})

// Helper functions
function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function getBuildingName(locationId: string) {
  const location = allLocations.value.find(loc => loc.id === locationId)
  return location ? location.buildingName : ''
}

// Load task data if editing
function loadTaskData() {
  if (!props.taskId) return
  
  isLoading.value = true
  
  // In a real app, this would fetch from a store or API
  setTimeout(() => {
    // Mock data for an existing task
    formData.value = {
      jobCategory: 'Patient Transport',
      itemType: 'Wheelchair',
      fromLocation: 'd1', // A&E
      toLocation: 'd2',   // Outpatients
      allocatedStaff: 'John Porter',
      receivedTime: '09:30',
      allocatedTime: '09:35',
      completedTime: '',
      status: 'Pending'
    }
    
    isLoading.value = false
  }, 500)
}

// Methods
function saveWithStatus(status: 'Pending' | 'Completed') {
  formData.value.status = status
  
  // If completing a task, set the completed time to now
  if (status === 'Completed' && !formData.value.completedTime) {
    formData.value.completedTime = getCurrentTime()
  }
  
  saveTask()
}

function saveTask() {
  // In a real app, this would save to a store or API
  console.log('Saving task:', formData.value)
  
  // Simulate a short delay
  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    router.push('/tasks')
  }, 500)
}

function confirmDeleteTask() {
  if (confirm('Are you sure you want to delete this task?')) {
    // In a real app, this would delete from a store or API
    console.log('Deleting task:', props.taskId)
    router.push('/tasks')
  }
}

function cancel() {
  router.back()
}

// Initialize the component
onMounted(() => {
  if (isEditing.value) {
    loadTaskData()
  }
})
</script>

<style scoped>
.task-form-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
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

h1 {
  font-size: 24px;
  margin-bottom: 1.5rem;
}

.task-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-section {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
}

.form-section-title {
  font-size: 18px;
  margin-bottom: 1rem;
  color: #0066cc;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group h3 {
  font-size: 16px;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.time-received {
  margin-bottom: 1.5rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.building-info {
  font-size: 14px;
  color: #666;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary, .btn-danger, .btn-success {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
}

.btn-primary:hover {
  background-color: #0055aa;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}
</style>
