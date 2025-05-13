<template>
  <main class="task-form-view">
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
                ref="fromLocationSelect"
                required
              >
                <option value="" disabled>Select location</option>
                <option v-for="location in allLocations" :key="location.id" :value="location">
                  {{ location.name }} {{ location.frequent ? '★' : '' }}
                </option>
              </select>
              
              <div v-if="selectedFromLocation" class="building-info">
                Building: {{ selectedFromLocation.buildingName }}
              </div>
              <div v-else-if="formData.fromLocation.displayName" class="building-info is-saved">
                Building and department data saved but not in select options.
                <strong>{{ formData.fromLocation.displayName }}</strong>
              </div>
            </div>
            
            <div class="form-group to-section">
              <h2>To</h2>
              <select 
                id="toLocationId"
                v-model="selectedToLocation"
                class="form-control"
                ref="toLocationSelect"
                required
              >
                <option value="" disabled>Select location</option>
                <option v-for="location in allLocations" :key="location.id" :value="location">
                  {{ location.name }} {{ location.frequent ? '★' : '' }}
                </option>
              </select>
              
              <div v-if="selectedToLocation" class="building-info">
                Building: {{ selectedToLocation.buildingName }}
              </div>
              <div v-else-if="formData.toLocation.displayName" class="building-info is-saved">
                Building and department data saved but not in select options.
                <strong>{{ formData.toLocation.displayName }}</strong>
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
        
        <!-- Warning messages -->
        <div v-if="!isFromArchive && isTaskReceivedBeforeShift" class="alert alert-warning">
          <strong>Task received outside of shift hours.</strong> This task will be marked as Pending until times are adjusted.
        </div>
        
        <div v-if="!isFromArchive && !isTaskTimingValid" class="alert alert-warning">
          <strong>Time validation:</strong> To mark as Complete, both Allocated and Completed times must be within shift hours:
          {{ getShiftHoursDisplay() }}
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
          
          <!-- Update button (main action button) -->
          <button 
            type="button" 
            class="btn-primary" 
            :disabled="!isFormValid"
            @click="saveTask(formData.status || 'Pending')"
          >
            Update
          </button>
          
          <!-- Mark as Pending button -->
          <button 
            v-if="!isEditing || formData.status !== 'Pending'"
            type="button" 
            class="btn-secondary" 
            :disabled="!isFormValid"
            @click="saveTask('Pending')"
          >
            Mark as Pending
          </button>
          
          <!-- Complete Now button - only for new tasks -->
          <button 
            v-if="!isEditing"
            type="button" 
            class="btn-success" 
            :disabled="!isFormValid || isTaskReceivedBeforeShift || (!isTaskTimingValid && !isFromArchive)"
            @click="saveTask('Completed')"
          >
            Complete Now
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch, nextTick } from 'vue';
import { useShiftStore } from '../stores/shift';
import { useSettingsStore } from '../stores/settings';
import type { Task, Location, RouteParams, JobCategoryDefault } from '../types';
import { CombinedLocation, processTaskLocations } from '../utils/locationSelectionUtils';
import '../assets/css/taskForm.css';

// Props
const props = defineProps<{
  taskId?: string;
}>();

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate');
const route = inject<any>('route');

// Stores
const shiftStore = useShiftStore();
const settingsStore = useSettingsStore();

const {
  createTask,
  updateTask,
  deleteTask,
  getTask
} = shiftStore;
const isShiftActive = computed(() => shiftStore.isShiftActive);

const {
  jobCategories,
  buildings
} = settingsStore;

// Get all available porters from settings, but we'll filter them based on the current shift
const allPorters = settingsStore.porters;

// Computed property for porters assigned to the current shift
const porters = computed(() => {
  // If editing a task from an archived shift, use all porters
  if (isFromArchive.value) {
    return allPorters;
  }
  
  const currentShift = shiftStore.currentShift;
  if (!currentShift || !currentShift.assignedPorters || !currentShift.porterAssignments) {
    return allPorters;
  }
  
  // Filter out porters that are currently assigned to departments
  const now = new Date().toISOString();
  const assignedToDepartments = new Set(
    currentShift.porterAssignments
      .filter(a => a.startTime <= now && (!a.endTime || a.endTime > now))
      .map(a => a.porterId)
  );
  
  // If editing a task where a porter is already assigned, include that porter
  // even if they're assigned to a department
  if (isEditing.value && formData.value.allocatedStaff) {
    assignedToDepartments.delete(formData.value.allocatedStaff);
  }
  
  // Return only porters that are assigned to the shift but not to any department
  return currentShift.assignedPorters.filter(porter => !assignedToDepartments.has(porter));
});

// State
const isEditing = computed(() => !!props.taskId);
const isFromArchive = ref(false);
const currentShiftId = ref<string | null>(null);

// Refs for select elements for direct DOM manipulation if needed
const fromLocationSelect = ref<HTMLSelectElement | null>(null);
const toLocationSelect = ref<HTMLSelectElement | null>(null);

// Flag to track if this is the initial load
const isInitialLoad = ref(true);

// Determine the context we're editing from
const checkReferrer = () => {
  // First check the URL for archive context
  if (window.location.href.includes('/archive/')) {
    // Extract shift ID from URL if possible
    const matches = window.location.href.match(/\/archive\/([^/?]+)/);
    if (matches && matches[1]) {
      currentShiftId.value = matches[1];
      isFromArchive.value = true;
      console.log('Detected editing from archive, shift ID:', currentShiftId.value);
    }
  } 
  
  // If not detected from URL, try to find the task's shift in archived shifts
  if (!isFromArchive.value && props.taskId) {
    // Check if this task belongs to an archived shift
    const task = getTask(props.taskId);
    if (task) {
      // Search in archived shifts for this task
      const archivedShifts = shiftStore.archivedShifts;
      for (const shift of archivedShifts) {
        const found = shift.tasks.find(t => t.id === props.taskId);
        if (found) {
          currentShiftId.value = shift.id;
          isFromArchive.value = true;
          console.log('Task belongs to archived shift:', shift.id);
          break;
        }
      }
    }
  }
};

// Current time helpers
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const getTimeMinutesFromNow = (minutes: number) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// Selected locations
const selectedFromLocation = ref<CombinedLocation | null>(null);
const selectedToLocation = ref<CombinedLocation | null>(null);

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
});

// Watch for changes in selected locations
watch(selectedFromLocation, (newLocation) => {
  if (newLocation) {
    formData.value.fromLocation = {
      building: newLocation.buildingId,
      locationId: newLocation.id,
      locationType: newLocation.locationType,
      displayName: newLocation.name
    };
  }
});

watch(selectedToLocation, (newLocation) => {
  if (newLocation) {
    formData.value.toLocation = {
      building: newLocation.buildingId,
      locationId: newLocation.id,
      locationType: newLocation.locationType,
      displayName: newLocation.name
    };
  }
});

// Check if a time is within the current shift's schedule
const isTimeWithinShiftSchedule = (timeString: string): boolean => {
  if (!shiftStore.currentShift) return false;
  
  // Get shift type and schedule
  const shiftType = shiftStore.currentShift.type.toLowerCase();
  const schedule = settingsStore.shifts[shiftType as 'day' | 'night'];
  
  // Handle overnight shifts (e.g., 20:00 - 08:00)
  const isOvernight = schedule.end < schedule.start;
  
  // Get hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);
  const timeValue = hours * 60 + minutes; // Convert to minutes
  
  // Get schedule times in minutes
  const [startHours, startMinutes] = schedule.start.split(':').map(Number);
  const [endHours, endMinutes] = schedule.end.split(':').map(Number);
  const startValue = startHours * 60 + startMinutes;
  const endValue = endHours * 60 + endMinutes;
  
  if (isOvernight) {
    // For overnight shifts (e.g., 20:00 - 08:00), time is valid if:
    // 1. It's after start time (e.g., >= 20:00), OR
    // 2. It's before end time (e.g., <= 08:00)
    return timeValue >= startValue || timeValue <= endValue;
  } else {
    // For day shifts, time is valid if between start and end
    return timeValue >= startValue && timeValue <= endValue;
  }
};

// Check if a task needs to be marked as pending due to being outside shift hours
const isTaskTimingValid = computed(() => {
  if (isFromArchive.value) return true; // Always valid for archived tasks
  
  const allocatedTimeValid = isTimeWithinShiftSchedule(formData.value.allocatedTime);
  
  if (formData.value.status === 'Completed') {
    // For completed tasks, both allocated and completed times must be valid
    const completedTimeValid = isTimeWithinShiftSchedule(formData.value.completedTime);
    return allocatedTimeValid && completedTimeValid;
  }
  
  // For pending tasks, just check allocated time
  return allocatedTimeValid;
});

// Check if task was received before shift started
const isTaskReceivedBeforeShift = computed(() => {
  if (!shiftStore.currentShift || isFromArchive.value) return false;
  
  return !isTimeWithinShiftSchedule(formData.value.receivedTime);
});

// Helper to display shift hours for warnings/messages
const getShiftHoursDisplay = (): string => {
  if (!shiftStore.currentShift) return '';
  
  const shiftType = shiftStore.currentShift.type.toLowerCase();
  const schedule = settingsStore.shifts[shiftType as 'day' | 'night'];
  
  return `${schedule.start} to ${schedule.end}`;
};

// Form validation
const isFormValid = computed(() => {
  return (
    formData.value.jobCategory &&
    formData.value.itemType &&
    (selectedFromLocation.value !== null || formData.value.fromLocation.displayName) &&
    (selectedToLocation.value !== null || formData.value.toLocation.displayName)
  );
});

// Computed properties
const categories = computed(() => {
  return Object.keys(jobCategories);
});

const itemTypesForCategory = computed(() => {
  const category = formData.value.jobCategory;
  return category ? jobCategories[category] || [] : [];
});

// Get all locations from all buildings
const allLocations = computed(() => {
  const frequentLocations: CombinedLocation[] = [];
  const standardLocations: CombinedLocation[] = [];
  
  buildings.forEach(building => {
    // Add departments - in our Supabase model, departments include all locations
    building.departments.forEach(dept => {
      // In the new model, we just have departments (no separate wards)
      const location = {
        id: dept.id,
        name: dept.name,
        buildingId: building.id,
        buildingName: building.name,
        locationType: 'department' as const,
        frequent: dept.frequent,
        order: dept.order
      };
      
      if (dept.frequent) {
        frequentLocations.push(location);
      } else {
        standardLocations.push(location);
      }
    });
  });
  
  // Sort frequent locations by their order value, falling back to name
  frequentLocations.sort((a, b) => {
    // If both have order, sort by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // If only one has order, prioritize the one with order
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    // If neither has order, sort by name
    return a.name.localeCompare(b.name);
  });
  
  // Sort standard locations alphabetically
  standardLocations.sort((a, b) => a.name.localeCompare(b.name));
  
  // Combine frequent locations first, then standard locations
  return [...frequentLocations, ...standardLocations];
});

// Load and populate task data
const loadTask = () => {
  if (!props.taskId) return;
  
  // Check if task exists in current shift or archived shifts
  const task = getTask(props.taskId);
  
  if (task) {
    console.log('Loading task for editing:', task);
    
    // If we found the task but haven't identified it's from archive yet,
    // check to see if it belongs to an archived shift
    if (!isFromArchive.value) {
      const archivedShifts = shiftStore.archivedShifts;
      for (const shift of archivedShifts) {
        const found = shift.tasks.find(t => t.id === props.taskId);
        if (found) {
          currentShiftId.value = shift.id;
          isFromArchive.value = true;
          console.log('Task belongs to archived shift (from loadTask):', shift.id);
          break;
        }
      }
    }
    // Get time from ISO string if available or use defaults
    const receivedTime = task.receivedTime 
      ? new Date(task.receivedTime).toTimeString().substring(0, 5) 
      : getCurrentTime();
    
    const allocatedTime = task.allocatedTime 
      ? new Date(task.allocatedTime).toTimeString().substring(0, 5) 
      : getTimeMinutesFromNow(1);
    
    const completedTime = task.completedTime 
      ? new Date(task.completedTime).toTimeString().substring(0, 5) 
      : getTimeMinutesFromNow(17);
    
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
    };
    
    console.log('Task from location:', task.fromLocation);
    console.log('Task to location:', task.toLocation);
    
    // Set location selections using enhanced location finder from our utility file
    // Wait for next tick to ensure the component is rendered and refs are available
    nextTick(() => {
      processTaskLocations(
        task,
        buildings,
        allLocations.value,
        fromLocationSelect,
        toLocationSelect,
        (loc) => { selectedFromLocation.value = loc; },
        (loc) => { selectedToLocation.value = loc; }
      );
    });
  }
};

// Actions for buttons
const saveTask = async (status: 'Pending' | 'Completed') => {
  try {
    // Set task status
    formData.value.status = status;
    
    // If form is not valid, don't proceed
    if (!isFormValid.value) {
      return;
    }
    
    // Create ISO datetime strings for times
    const today = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
    
    const taskData = {
      ...formData.value,
      receivedTime: `${today}T${formData.value.receivedTime}:00`,
      allocatedTime: `${today}T${formData.value.allocatedTime}:00`,
      completedTime: status === 'Completed' 
        ? `${today}T${formData.value.completedTime}:00` 
        : undefined,
    };
    
    // Update or create the task
    if (isEditing.value) {
      await updateTask(props.taskId as string, taskData);
      console.log('Task updated successfully');
    } else {
      await createTask(taskData);
      console.log('Task created successfully');
    }
    
    // Navigate back
    cancel();
  } catch (error) {
    console.error('Error saving task:', error);
    alert('An error occurred while saving the task. Please try again.');
  }
};

const handleDeleteTask = async () => {
  if (!props.taskId) return;
  
  const confirmDelete = confirm('Are you sure you want to delete this task?');
  if (!confirmDelete) return;
  
  try {
    await deleteTask(props.taskId);
    console.log('Task deleted successfully');
    cancel();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('An error occurred while deleting the task. Please try again.');
  }
};

const cancel = () => {
  console.log('Cancelling and navigating back');
  
  // Go back to the shift view or the appropriate task view
  // Use history back or navigate to the correct route
  if (navigate) {
    navigate('shift'); // Go back to the shift view
  } else {
    window.history.back();
  }
};

// Mount setup
onMounted(() => {
  console.log('Task form mounted with taskId:', props.taskId);
  
  // Check referrer for archive context
  checkReferrer();
  
  // Load existing task if editing
  if (props.taskId) {
    loadTask();
  }
});
</script>
