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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTaskStore } from '@/stores/taskStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useShiftStore } from '@/stores/shiftStore';
import type { TaskStatus } from '@/types';

// Router
const router = useRouter();
const route = useRoute();

// Stores
const taskStore = useTaskStore();
const settingsStore = useSettingsStore();
const shiftStore = useShiftStore();

// Props
const props = defineProps<{
  taskId?: string;
}>();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const isEditing = computed(() => !!props.taskId);

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
  status: 'Pending' as TaskStatus
});

// Computed properties from stores
const jobCategories = computed(() => {
  return Object.keys(settingsStore.jobCategories);
});

const itemTypesForCategory = computed(() => {
  if (!formData.value.jobCategory) return [];
  return settingsStore.jobCategories[formData.value.jobCategory] || [];
});

const allLocations = computed(() => {
  return settingsStore.sortedDepartments;
});

const porters = computed(() => {
  if (!shiftStore.currentShift) return settingsStore.porters;
  return shiftStore.currentShift.assignedPorters;
});

// Watch for changes to job category and apply default locations
watch(() => [formData.value.jobCategory, formData.value.itemType], async ([category, itemType]) => {
  if (!category) return;
  
  // Check if we have default locations for this category/item
  const defaultLocation = settingsStore.getJobCategoryDefault(category, itemType);
  
  if (defaultLocation) {
    console.log('Found default locations:', defaultLocation);
    
    // Apply defaults if they exist
    if (defaultLocation.fromLocationId) {
      formData.value.fromLocation = defaultLocation.fromLocationId;
    }
    
    if (defaultLocation.toLocationId) {
      formData.value.toLocation = defaultLocation.toLocationId;
    }
  }
}, { immediate: true });

// Helper functions
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getBuildingName(locationId: string) {
  const location = allLocations.value.find(loc => loc.id === locationId);
  return location ? location.buildingName : '';
}

function formatTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Load task data if editing
async function loadTaskData() {
  if (!props.taskId) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const task = await taskStore.getTask(props.taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    formData.value = {
      jobCategory: task.jobCategory,
      itemType: task.itemType,
      fromLocation: task.fromLocation.locationId,
      toLocation: task.toLocation.locationId,
      allocatedStaff: task.allocatedStaff || '',
      receivedTime: formatTime(task.receivedTime),
      allocatedTime: formatTime(task.allocatedTime),
      completedTime: task.completedTime ? formatTime(task.completedTime) : '',
      status: task.status
    };
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Failed to load task data';
    }
    console.error('Error loading task:', err);
  } finally {
    isLoading.value = false;
  }
}

// Methods
function saveWithStatus(status: TaskStatus) {
  formData.value.status = status;
  
  // If completing a task, set the completed time to now
  if (status === 'Completed' && !formData.value.completedTime) {
    formData.value.completedTime = getCurrentTime();
  }
  
  saveTask();
}

async function saveTask() {
  if (!shiftStore.currentShift) {
    error.value = 'No active shift. Cannot save task.';
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    if (isEditing.value && props.taskId) {
      // Update existing task
      const success = await taskStore.updateTask(props.taskId, formData.value);
      
      if (!success) {
        throw new Error('Failed to update task');
      }
    } else {
      // Create new task
      const newTask = await taskStore.createTask(formData.value);
      
      if (!newTask) {
        throw new Error('Failed to create task');
      }
    }
    
    // Navigate back to tasks view
    router.push('/tasks');
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'An error occurred while saving the task';
    }
    console.error('Error saving task:', err);
  } finally {
    isLoading.value = false;
  }
}

async function confirmDeleteTask() {
  if (!props.taskId) return;
  
  if (confirm('Are you sure you want to delete this task?')) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await taskStore.deleteTask(props.taskId);
      
      if (!success) {
        throw new Error('Failed to delete task');
      }
      
      router.push('/tasks');
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'An error occurred while deleting the task';
      }
      console.error('Error deleting task:', err);
    } finally {
      isLoading.value = false;
    }
  }
}

function cancel() {
  router.back();
}

  // Initialize the component
onMounted(async () => {
  // Initialize settings store if not already initialized
  if (!settingsStore.buildings.length) {
    await settingsStore.initialize();
  }
  
  // Load current shift if not already loaded
  if (!shiftStore.currentShift) {
    await shiftStore.loadShiftData();
  }
  
  if (isEditing.value) {
    await loadTaskData();
  }
});
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
