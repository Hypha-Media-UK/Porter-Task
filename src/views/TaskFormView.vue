<template>
  <main class="task-form-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="form-container loading-state">
      <LoadingSpinner message="Loading form data..." />
      <div v-if="loadingError" class="loading-error">
        <p>{{ loadingError }}</p>
        <button @click="retryLoading" class="btn-primary">Retry</button>
      </div>
    </div>
    
    <!-- Form content - only shown when data is fully loaded -->
    <div v-else-if="isDataLoaded" class="form-container">
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
          <!-- Cancel button - always visible -->
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
          
          <!-- SCENARIO 1: New Task -->
          <template v-if="formMode === 'CREATE_NEW'">
            <!-- Mark as Pending button -->
            <button 
              type="button" 
              class="btn-secondary" 
              :disabled="!isFormValid"
              @click="saveTask('Pending')"
            >
              Mark as Pending
            </button>
            
            <!-- Mark as Completed button -->
            <button 
              type="button" 
              class="btn-success" 
              :disabled="!isFormValid || isTaskReceivedBeforeShift || !isTaskTimingValid"
              @click="saveTask('Completed')"
            >
              Mark as Completed
            </button>
          </template>
          
          <!-- SCENARIO 2: Pending Task from Current Shift -->
          <template v-else-if="formMode === 'EDIT_CURRENT' && formData.status === 'Pending'">
            <!-- Update button -->
            <button 
              type="button" 
              class="btn-primary" 
              :disabled="!isFormValid"
              @click="saveTask('Pending')"
            >
              Update
            </button>
            
            <!-- Mark as Completed button -->
            <button 
              type="button" 
              class="btn-success" 
              :disabled="!isFormValid || isTaskReceivedBeforeShift || !isTaskTimingValid"
              @click="saveTask('Completed')"
            >
              Mark as Completed
            </button>
          </template>
          
          <!-- SCENARIO 3: Completed Task from Archive -->
          <template v-else-if="formMode === 'EDIT_ARCHIVED' && formData.status === 'Completed'">
            <!-- Update button -->
            <button 
              type="button" 
              class="btn-primary" 
              :disabled="!isFormValid"
              @click="saveTask('Completed')"
            >
              Update
            </button>
            
            <!-- Move to Pending button -->
            <button 
              type="button" 
              class="btn-secondary" 
              :disabled="!isFormValid"
              @click="saveTask('Pending')"
            >
              Move to Pending
            </button>
          </template>
          
          <!-- SCENARIO 4: Pending Task from Archive -->
          <template v-else-if="formMode === 'EDIT_ARCHIVED' && formData.status === 'Pending'">
            <!-- Update button -->
            <button 
              type="button" 
              class="btn-primary" 
              :disabled="!isFormValid"
              @click="saveTask('Pending')"
            >
              Update
            </button>
            
            <!-- Mark as Completed button -->
            <button 
              type="button" 
              class="btn-success" 
              :disabled="!isFormValid"
              @click="saveTask('Completed')"
            >
              Mark as Completed
            </button>
          </template>
          
          <!-- Default case (shouldn't hit this but added for completeness) -->
          <template v-else>
            <button 
              type="button" 
              class="btn-primary" 
              :disabled="!isFormValid"
              @click="saveTask(formData.status || 'Pending')"
            >
              Update
            </button>
          </template>
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
import LoadingSpinner from '../components/LoadingSpinner.vue';
import '../assets/css/taskForm.css';

// Props
const props = defineProps<{
  taskId?: string;
}>();

// Router
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

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

// Form mode type definition
type FormMode = 'CREATE_NEW' | 'EDIT_CURRENT' | 'EDIT_ARCHIVED';

// Loading state
const isLoading = ref(true);
const loadingError = ref<string | null>(null);
const isDataLoaded = computed(() => {
  const hasJobCategories = Object.keys(jobCategories).length > 0;
  const hasBuildings = buildings.length > 0;
  const hasLocations = allLocations.value.length > 0;
  return hasJobCategories && hasBuildings && hasLocations;
});

// Function to retry loading if data is missing
const retryLoading = async () => {
  isLoading.value = true;
  loadingError.value = null;
  
  try {
    await settingsStore.initialize();
    
    // After retrying, check if we have the required data
    if (!isDataLoaded.value) {
      loadingError.value = "Could not load all required data. Please try again.";
    } else {
      isLoading.value = false;
    }
  } catch (err) {
    loadingError.value = err instanceof Error ? err.message : "Failed to load required data";
    console.error("Error loading form data:", err);
  }
};

// State
const formMode = ref<FormMode>('CREATE_NEW');
const currentShiftId = ref<string | null>(null);

// Computed helpers based on form mode
const isEditing = computed(() => formMode.value !== 'CREATE_NEW');
const isFromArchive = computed(() => formMode.value === 'EDIT_ARCHIVED');

// Refs for select elements for direct DOM manipulation if needed
const fromLocationSelect = ref<HTMLSelectElement | null>(null);
const toLocationSelect = ref<HTMLSelectElement | null>(null);

// Flag to track if this is the initial load
const isInitialLoad = ref(true);

// Determine the form mode and context
const determineFormMode = () => {
  // If no taskId, we're creating a new task
  if (!props.taskId) {
    formMode.value = 'CREATE_NEW';
    console.log('Form mode: CREATE_NEW');
    return;
  }
  
  // Check if we're editing from an archive context
  if (window.location.href.includes('/archive/')) {
    // Extract shift ID from URL if possible
    const matches = window.location.href.match(/\/archive\/([^/?]+)/);
    if (matches && matches[1]) {
      currentShiftId.value = matches[1];
      formMode.value = 'EDIT_ARCHIVED';
      console.log('Form mode: EDIT_ARCHIVED (from URL), shift ID:', currentShiftId.value);
      return;
    }
  }
  
  // If not detected from URL, try to find if the task belongs to an archived shift
  const task = getTask(props.taskId);
  if (task) {
    // Search in archived shifts for this task
    const archivedShifts = shiftStore.archivedShifts;
    for (const shift of archivedShifts) {
      const found = shift.tasks.find(t => t.id === props.taskId);
      if (found) {
        currentShiftId.value = shift.id;
        formMode.value = 'EDIT_ARCHIVED';
        console.log('Form mode: EDIT_ARCHIVED (from task lookup), shift ID:', shift.id);
        return;
      }
    }
    
    // If we reach here, we're editing a current task
    formMode.value = 'EDIT_CURRENT';
    console.log('Form mode: EDIT_CURRENT');
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

// Apply default locations when job category or item type changes
const applyDefaultLocations = () => {
  if (!formData.value.jobCategory) return;
  
  // ENHANCED LOGGING FOR DEBUGGING
  console.groupCollapsed(`🔍 Looking for default locations for category: ${formData.value.jobCategory}, item: ${formData.value.itemType || 'any'}`);
  console.log(`Available job category defaults:`, settingsStore.jobCategoryDefaults);
  console.log(`Available locations:`, allLocations.value);
  
  // Check if we need the fallback default for Specimen Delivery
  // Look for location by name instead of hardcoded IDs
  if (formData.value.jobCategory === 'Specimen Delivery') {
    console.log('⚠️ Checking fallback default for Specimen Delivery: Pathology in New Fountain House');
    
    // Find the building by name first
    const newFountainHouse = buildings.find(b => 
      b.name.toLowerCase().includes('new fountain house')
    );
    
    if (newFountainHouse) {
      console.log('Found building:', newFountainHouse.name);
      
      // Find the pathology department in this building
      const pathologyLocation = allLocations.value.find(
        loc => loc.buildingId === newFountainHouse.id && 
              loc.name.toLowerCase().includes('pathology')
      );
      
      if (pathologyLocation) {
        console.log('✅ Found Pathology location:', pathologyLocation);
        selectedToLocation.value = pathologyLocation;
        console.groupEnd();
        return;
      } else {
        console.warn('❌ Could not find Pathology department in', newFountainHouse.name);
        // Continue to try other methods if fallback default fails
      }
    } else {
      console.warn('❌ Could not find New Fountain House building');
      // Continue to try other methods if fallback default fails
    }
  }
  
  // For all categories, try to get defaults from the database
  // First try to get item-specific defaults
  let defaultLocation: JobCategoryDefault | undefined;
  
  if (formData.value.itemType) {
    console.log(`🔎 Looking for item-specific defaults for ${formData.value.itemType}`);
    defaultLocation = settingsStore.getJobCategoryDefault(
      formData.value.jobCategory, 
      formData.value.itemType
    );
    console.log(`Item-specific default search result:`, defaultLocation);
  }
  
  // If no item-specific defaults found, try category-level defaults
  if (!defaultLocation) {
    console.log(`🔎 Looking for category-level defaults for ${formData.value.jobCategory}`);
    defaultLocation = settingsStore.getJobCategoryDefault(formData.value.jobCategory);
    console.log(`Category-level default search result:`, defaultLocation);
  }
  
  if (defaultLocation) {
    console.log('✅ Found default locations:', defaultLocation);
    
    // Apply from (origin) location if available
    if (defaultLocation.fromBuildingId && defaultLocation.fromLocationId) {
      console.log(`🔎 Looking for fromLocation with buildingId=${defaultLocation.fromBuildingId} and id=${defaultLocation.fromLocationId}`);
      
      const fromLocation = allLocations.value.find(
        loc => loc.buildingId === defaultLocation.fromBuildingId && 
              loc.id === defaultLocation.fromLocationId
      );
      
      if (fromLocation) {
        console.log('✅ Applying default FROM location:', fromLocation);
        selectedFromLocation.value = fromLocation;
      } else {
        console.warn(`❌ Could not find matching fromLocation for default: building=${defaultLocation.fromBuildingId}, location=${defaultLocation.fromLocationId}`);
        // Try fuzzy matching by building only
        const buildingMatches = allLocations.value.filter(
          loc => loc.buildingId === defaultLocation.fromBuildingId
        );
        if (buildingMatches.length > 0) {
          console.log(`Found ${buildingMatches.length} locations in the specified building:`, 
            buildingMatches.map(l => `${l.id} (${l.name})`).join(', '));
        }
      }
    }
    
    // Apply to (destination) location if available
    if (defaultLocation.toBuildingId && defaultLocation.toLocationId) {
      console.log(`🔎 Looking for toLocation with buildingId=${defaultLocation.toBuildingId} and id=${defaultLocation.toLocationId}`);
      
      const toLocation = allLocations.value.find(
        loc => loc.buildingId === defaultLocation.toBuildingId && 
              loc.id === defaultLocation.toLocationId
      );
      
      if (toLocation) {
        console.log('✅ Applying default TO location:', toLocation);
        selectedToLocation.value = toLocation;
      } else {
        console.warn(`❌ Could not find matching toLocation for default: building=${defaultLocation.toBuildingId}, location=${defaultLocation.toLocationId}`);
        // Try fuzzy matching by building only
        const buildingMatches = allLocations.value.filter(
          loc => loc.buildingId === defaultLocation.toBuildingId
        );
        if (buildingMatches.length > 0) {
          console.log(`Found ${buildingMatches.length} locations in the specified building:`, 
            buildingMatches.map(l => `${l.id} (${l.name})`).join(', '));
        }
      }
    }
  } else {
    console.log('ℹ️ No default locations found for this job category/item');
  }
  
  console.groupEnd();
};

// Watch for changes in job category or item type to apply defaults
watch([() => formData.value.jobCategory, () => formData.value.itemType], 
  ([newCategory, newItemType], [oldCategory, oldItemType]) => {
    // Only apply defaults on initial selection or when category/item changes
    // Don't clear existing selections when editing a task
    if ((newCategory && newCategory !== oldCategory) || 
        (newItemType && newItemType !== oldItemType && !isEditing.value)) {
      applyDefaultLocations();
    }
  }
);

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
    
    // FormMode should already be set by determineFormMode()
    // We can log the current mode for debugging
    console.log(`Loading task in ${formMode.value} mode`);
    
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
  console.log(`saveTask() called with status: ${status}, formMode: ${formMode.value}`);
  
  try {
    // Set task status
    formData.value.status = status;
    
    // If form is not valid, don't proceed
    if (!isFormValid.value) {
      console.warn('Form is not valid, cannot save task');
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
    
    console.log('Task data prepared for saving:', taskData);
    
    // Update or create the task
    if (isEditing.value) {
      console.log(`Updating existing task with ID: ${props.taskId}`);
      if (!props.taskId) {
        console.error('Task ID is undefined, cannot update');
        alert('Error updating task: Missing task ID');
        return;
      }
      
      const updatedTask = await updateTask(props.taskId, taskData);
      console.log('Task updated successfully:', updatedTask);
    } else {
      console.log('Creating new task');
      const newTask = await createTask(taskData);
      console.log('Task created successfully:', newTask);
    }
    
    // Navigate back
    console.log('Task saved, navigating back');
    cancel();
  } catch (error) {
    console.error('Error saving task:', error);
    alert(`An error occurred while saving the task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const handleDeleteTask = async () => {
  console.log(`handleDeleteTask() called for task ID: ${props.taskId}, formMode: ${formMode.value}`);
  
  if (!props.taskId) {
    console.error('Task ID is undefined, cannot delete');
    return;
  }
  
  const confirmDelete = confirm('Are you sure you want to delete this task?');
  if (!confirmDelete) {
    console.log('Task deletion cancelled by user');
    return;
  }
  
  try {
    console.log(`Deleting task with ID: ${props.taskId}`);
    const result = await deleteTask(props.taskId);
    console.log('Task deleted successfully, result:', result);
    cancel();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert(`An error occurred while deleting the task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const cancel = () => {
  console.log(`cancel() called, formMode: ${formMode.value}`);
  
  // Go back to the shift view or the appropriate task view
  try {
    console.log('Using Vue router to return to tasks view');
    router.push({ name: 'tasks' });
  } catch (error) {
    console.error('Error navigating with router:', error);
    console.log('Falling back to window.history.back()');
    window.history.back();
  }
};

// Mount setup
onMounted(async () => {
  console.log('Task form mounted with taskId:', props.taskId);
  
  try {
    // Verify all required data is loaded
    if (!isDataLoaded.value) {
      console.log("Required data not fully loaded, attempting to load...");
      
      // Try to load/reload data
      try {
        await settingsStore.initialize();
      } catch (err) {
        console.error("Error initializing stores:", err);
      }
      
      // Check again after attempting to load
      if (!isDataLoaded.value) {
        loadingError.value = "Some required data could not be loaded. Please try reloading the page.";
        console.warn("After initialization attempt, still missing required data:", {
          hasJobCategories: Object.keys(jobCategories).length > 0,
          hasBuildings: buildings.length > 0,
          hasLocations: allLocations.value.length > 0
        });
      }
    }
    
    // If data is loaded, proceed with form initialization
    if (isDataLoaded.value) {
      // Determine form mode and context
      determineFormMode();
      
      // Initialize UI based on the form mode
      console.log(`Initializing form in mode: ${formMode.value}`);
      
      // Load existing task if editing
      if (props.taskId) {
        loadTask();
      }
      
      // Mark loading as complete
      isLoading.value = false;
    }
  } catch (err) {
    console.error("Error during TaskForm initialization:", err);
    loadingError.value = "An error occurred while initializing the form.";
  }
});
</script>

<style scoped>
/* Loading state styling */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.loading-error {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-danger-light, rgba(220, 53, 69, 0.1));
  border: 1px solid var(--color-danger, #dc3545);
  border-radius: var(--border-radius);
  color: var(--color-danger, #dc3545);
  max-width: 80%;
}

.loading-error p {
  margin-bottom: var(--spacing-md);
}
</style>
