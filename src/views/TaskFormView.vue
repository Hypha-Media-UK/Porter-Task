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
                  {{ location.name }} {{ location.frequent ? '★' : '' }}
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
          
          <!-- Complete Now button -->
          <button 
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
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useShiftStore } from '../stores/shift';
import { useSettingsStore } from '../stores/settings';
import type { Task, Location, RouteParams, JobCategoryDefault } from '../types';
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

// Combined location type including building info
interface CombinedLocation {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  locationType: 'department' | 'ward';
  frequent?: boolean;
  order?: number;
}

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
    selectedFromLocation.value !== null &&
    selectedToLocation.value !== null
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

// Find location by building and ID with improved debugging and fallback
const findLocationById = (buildingId: string, locationId: string, locationType: 'department' | 'ward'): CombinedLocation | undefined => {
  console.log(`Finding location - buildingId: ${buildingId}, locationId: ${locationId}, type: ${locationType}`);
  
  if (!buildingId || !locationId) {
    console.warn('Missing buildingId or locationId, cannot find location');
    return undefined;
  }
  
  // Find the building
  const building = buildings.find(b => b.id === buildingId);
  if (!building) {
    console.warn(`Building with ID ${buildingId} not found`);
    
    // Try to find the location in any building as a fallback
    for (const b of buildings) {
      const location = b.departments.find(d => d.id === locationId);
      if (location) {
        console.log(`Found location ${location.name} in different building ${b.name}`);
        return {
          id: location.id,
          name: location.name,
          buildingId: b.id,
          buildingName: b.name,
          locationType: 'department'
        };
      }
    }
    
    return undefined;
  }
  
  // In our Supabase model, all locations are in the departments array
  const location = building.departments.find(l => l.id === locationId);
  
  if (location) {
    console.log(`Found location ${location.name} in building ${building.name}`);
    return {
      id: location.id,
      name: location.name,
      buildingId: building.id,
      buildingName: building.name,
      locationType: 'department' // We now use 'department' for all location types
    };
  }
  
  console.warn(`Location with ID ${locationId} not found in building ${building.name}`);
  return undefined;
};

const loadTask = () => {
  if (!props.taskId) return;
  
  // Check if task exists in current shift or archived shifts
  const task = getTask(props.taskId);
  
  if (task) {
    console.log('Loading task:', task);
    
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
    
    // Find and set selected locations
    const fromLoc = findLocationById(
      task.fromLocation.building, 
      task.fromLocation.locationId, 
      task.fromLocation.locationType
    );
    
    if (fromLoc) {
      console.log('Found fromLocation match:', fromLoc);
      selectedFromLocation.value = fromLoc;
    } else {
      console.warn('Could not find fromLocation match in buildings');
      
      // Fallback: Find a location by display name
      if (task.fromLocation.displayName) {
        const matchByName = allLocations.value.find(
          loc => loc.name === task.fromLocation.displayName
        );
        
        if (matchByName) {
          console.log('Found fromLocation by name:', matchByName);
          selectedFromLocation.value = matchByName;
          
          // Update the formData with the correct building and locationId
          formData.value.fromLocation = {
            building: matchByName.buildingId,
            locationId: matchByName.id,
            locationType: matchByName.locationType,
            displayName: matchByName.name
          };
        }
      }
    }
    
    const toLoc = findLocationById(
      task.toLocation.building, 
      task.toLocation.locationId, 
      task.toLocation.locationType
    );
    
    if (toLoc) {
      console.log('Found toLocation match:', toLoc);
      selectedToLocation.value = toLoc;
    } else {
      console.warn('Could not find toLocation match in buildings');
      
      // Fallback: Find a location by display name
      if (task.toLocation.displayName) {
        const matchByName = allLocations.value.find(
          loc => loc.name === task.toLocation.displayName
        );
        
        if (matchByName) {
          console.log('Found toLocation by name:', matchByName);
          selectedToLocation.value = matchByName;
          
          // Update the formData with the correct building and locationId
          formData.value.toLocation = {
            building: matchByName.buildingId,
            locationId: matchByName.id,
            locationType: matchByName.locationType,
            displayName: matchByName.name
          };
        }
      }
    }
  } else {
    // Task not found, go back to tasks view
    if (navigate) navigate('tasks');
  }
};

const navigateAfterSave = () => {
  // If editing from archive, return to shift detail view
  if (isFromArchive.value && currentShiftId.value) {
    if (navigate) navigate('shiftDetail', { shiftId: currentShiftId.value });
  } else {
    // Otherwise, go to tasks view
    if (navigate) navigate('tasks');
  }
};

const saveTask = (status: 'Pending' | 'Completed' = 'Pending') => {
  if (!isFormValid.value) return;
  
  // Convert time inputs (HH:MM) to ISO strings
  const now = new Date();
  const [receivedHours, receivedMinutes] = formData.value.receivedTime.split(':').map(Number);
  const [allocatedHours, allocatedMinutes] = formData.value.allocatedTime.split(':').map(Number);
  
  // Create date objects for the times
  const receivedDate = new Date(now);
  receivedDate.setHours(receivedHours, receivedMinutes, 0, 0);
  
  const allocatedDate = new Date(now);
  allocatedDate.setHours(allocatedHours, allocatedMinutes, 0, 0);
  
  // For completed time, only set if task is completed
  let completedDate: Date | undefined;
  if (status === 'Completed' && formData.value.completedTime) {
    const [completedHours, completedMinutes] = formData.value.completedTime.split(':').map(Number);
    completedDate = new Date(now);
    completedDate.setHours(completedHours, completedMinutes, 0, 0);
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
  };
  
  if (isEditing.value && props.taskId) {
    // Update existing task if in edit mode
    updateTask(props.taskId, taskData);
  } else {
    // Create new task if in create mode
    createTask(taskData);
  }
  
  // Navigate based on context
  navigateAfterSave();
};

const handleDeleteTask = () => {
  if (isEditing.value && props.taskId) {
    // Delete the task
    deleteTask(props.taskId);
    
    // Navigate based on context
    navigateAfterSave();
  }
};

const cancel = () => {
  // Check if we should go back to shift detail view or tasks view
  if (isFromArchive.value && currentShiftId.value) {
    if (navigate) navigate('shiftDetail', { shiftId: currentShiftId.value });
  } else if (window.history && window.history.length > 1) {
    window.history.back();
  } else if (navigate) {
    navigate('tasks');
  }
};

// Initialize
onMounted(() => {
  // Check if we're coming from an archive page
  checkReferrer();
  
  // Allow editing even for archived tasks (don't redirect if we're editing)
  if (!isShiftActive.value && !props.taskId) {
    if (navigate) navigate('home');
    return;
  }
  
  // Set default categories if available
  if (categories.value.length > 0) {
    formData.value.jobCategory = categories.value[0];
  }
  
  // If we have locations, set defaults
  if (allLocations.value.length > 0) {
    // Find a department for "from" location (or use first location)
    const defaultFromLoc = allLocations.value.find(l => l.locationType === 'department') || allLocations.value[0];
    selectedFromLocation.value = defaultFromLoc;
    
    // Find a ward for "to" location (or use second location, or first if only one exists)
    const defaultToLoc = allLocations.value.find(l => l.locationType === 'ward') || 
                         (allLocations.value.length > 1 ? allLocations.value[1] : allLocations.value[0]);
    selectedToLocation.value = defaultToLoc;
  }
  
  // In edit mode, load task data
  if (isEditing.value) {
    loadTask();
  }
});

// Function to apply location defaults
const applyLocationDefaults = (defaults: JobCategoryDefault | undefined) => {
  if (!defaults) return;
  
  // Set from location
  if (defaults.fromBuildingId) {
    const fromBuildingId = defaults.fromBuildingId;
    
    // Only set if we have a valid building
    const building = buildings.find(b => b.id === fromBuildingId);
    if (building) {
      // If we have a locationId, try to find the exact location
      if (defaults.fromLocationId) {
        // In our Supabase model, all locations are in the departments array
        const location = building.departments.find(l => l.id === defaults.fromLocationId);
        
        if (location) {
          const defaultFromLoc = {
            id: location.id,
            name: location.name,
            buildingId: building.id,
            buildingName: building.name,
            locationType: 'department' // We now use 'department' for all location types
          };
          selectedFromLocation.value = defaultFromLoc;
        }
      }
    }
  }
  
  // Set to location
  if (defaults.toBuildingId) {
    const toBuildingId = defaults.toBuildingId;
    
    // Only set if we have a valid building
    const building = buildings.find(b => b.id === toBuildingId);
    if (building) {
      // If we have a locationId, try to find the exact location
      if (defaults.toLocationId) {
        // In our Supabase model, all locations are in the departments array
        const location = building.departments.find(l => l.id === defaults.toLocationId);
        
        if (location) {
          const defaultToLoc = {
            id: location.id,
            name: location.name,
            buildingId: building.id,
            buildingName: building.name,
            locationType: 'department' // We now use 'department' for all location types
          };
          selectedToLocation.value = defaultToLoc;
        }
      }
    }
  }
};

// Flag to prevent automatic item type reset during initial load
const initialJobTypeChange = ref(true);

// Watch for category changes to update item types and default locations
watch(() => formData.value.jobCategory, () => {
  // Only reset and set default item type if this isn't the initial load with an existing task
  if (!initialJobTypeChange.value || !isEditing.value) {
    // Reset item type when category changes (unless it's during initial load of an existing task)
    formData.value.itemType = '';
    
    // Set default item type if available
    const items = itemTypesForCategory.value;
    if (items.length > 0) {
      formData.value.itemType = items[0];
    }
  }
  
  // Only apply default locations for new tasks, not when editing
  if (formData.value.jobCategory && !isEditing.value) {
    const defaults = settingsStore.getJobCategoryDefault(formData.value.jobCategory);
    applyLocationDefaults(defaults);
  }
  
  // Turn off the initial load flag after first run
  initialJobTypeChange.value = false;
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
