<template>
  <div class="category-defaults-modal">
    <div class="modal-header">
      <h3>Default Locations for {{ category }}</h3>
      <p class="modal-description">
        Set default origin and destination locations that will be applied when creating jobs
      </p>
    </div>
    
    <div class="setting-scope">
      <div class="setting-scope-card" :class="{ active: !selectedItemType }">
        <input 
          type="radio" 
          id="allItems" 
          :value="''" 
          v-model="selectedItemType"
          class="scope-radio"
        />
        <label for="allItems" class="scope-label">
          <div class="scope-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M3 12h18"></path>
              <path d="M3 18h18"></path>
            </svg>
          </div>
          <div class="scope-content">
            <h4>All Items</h4>
            <p>Set defaults for all items in the "{{ category }}" category</p>
          </div>
        </label>
      </div>
      
      <div class="setting-scope-card" :class="{ active: !!selectedItemType }">
        <input 
          type="radio" 
          id="specificItem" 
          :value="itemTypesForCategory[0] || ''" 
          v-model="selectedItemType"
          class="scope-radio"
          :disabled="!itemTypesForCategory.length"
        />
        <label for="specificItem" class="scope-label">
          <div class="scope-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          <div class="scope-content">
            <h4>Specific Item</h4>
            <p>Set defaults for a specific item type only</p>
          </div>
        </label>
        
        <div class="item-select" v-if="selectedItemType">
          <select 
            v-model="selectedItemType"
            class="form-control"
          >
            <option v-for="item in itemTypesForCategory" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="locations-container">
      <!-- From Location Section -->
      <div class="location-section">
        <h4>From (Origin) Location</h4>
        
        <div class="location-form">
          <div class="building-select">
            <label for="fromBuilding">Building:</label>
            <select 
              id="fromBuilding" 
              v-model="fromBuildingId"
              class="form-control"
              @change="resetFromLocation"
            >
              <option value="">No default building</option>
              <option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </option>
            </select>
          </div>
          
          <div class="department-select" v-if="fromBuildingId">
            <label for="fromDepartment">Department:</label>
            <select 
              id="fromDepartment" 
              v-model="fromLocationId"
              class="form-control"
            >
              <option value="">Select a department</option>
              <option v-for="department in fromDepartments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="location-summary" v-if="hasFromLocation">
          <div class="summary-content">
            <div class="summary-icon from-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="summary-text">
              {{ fromBuildingName }} - {{ fromDepartmentName }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- To Location Section -->
      <div class="location-section">
        <h4>To (Destination) Location</h4>
        
        <div class="location-form">
          <div class="building-select">
            <label for="toBuilding">Building:</label>
            <select 
              id="toBuilding" 
              v-model="toBuildingId"
              class="form-control"
              @change="resetToLocation"
            >
              <option value="">No default building</option>
              <option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </option>
            </select>
          </div>
          
          <div class="department-select" v-if="toBuildingId">
            <label for="toDepartment">Department:</label>
            <select 
              id="toDepartment" 
              v-model="toLocationId"
              class="form-control"
            >
              <option value="">Select a department</option>
              <option v-for="department in toDepartments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="location-summary" v-if="hasToLocation">
          <div class="summary-content">
            <div class="summary-icon to-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="summary-text">
              {{ toBuildingName }} - {{ toDepartmentName }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="settings-summary" v-if="hasFromLocation || hasToLocation">
      <h4 class="summary-title">Current Settings Summary</h4>
      <div class="summary-item-container">
        <div class="summary-item" v-if="hasFromLocation">
          <strong>From:</strong> {{ fromBuildingName }} - {{ fromDepartmentName }}
        </div>
        <div class="summary-item" v-if="hasToLocation">
          <strong>To:</strong> {{ toBuildingName }} - {{ toDepartmentName }}
        </div>
      </div>
      <p class="settings-note" v-if="selectedItemType">
        These defaults will only apply when "{{ selectedItemType }}" is selected.
      </p>
      <p class="settings-note" v-else>
        These defaults will apply to all items in the "{{ category }}" category.
      </p>
    </div>
    
    <div class="modal-actions">
      <button 
        v-if="hasFromLocation || hasToLocation" 
        class="btn-danger" 
        @click="clearDefaults"
      >
        Clear Defaults
      </button>
      <button class="btn-secondary" @click="cancel">
        Cancel
      </button>
      <button 
        class="btn-primary" 
        @click="saveDefaults"
        :disabled="!hasFromLocation && !hasToLocation"
      >
        Save Defaults
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import type { JobCategoryDefault } from '../../types'

// Props
const props = defineProps<{
  category: string;
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>()

// Store
const settingsStore = useSettingsStore()

// Item type selection
const selectedItemType = ref<string>('');
const itemTypesForCategory = computed(() => {
  return settingsStore.jobCategories[props.category] || [];
});

// From location state
const fromBuildingId = ref('');
const fromLocationId = ref('');

// To location state
const toBuildingId = ref('');
const toLocationId = ref('');

// Computed values for summary display
const hasFromLocation = computed(() => !!fromBuildingId.value && !!fromLocationId.value);
const hasToLocation = computed(() => !!toBuildingId.value && !!toLocationId.value);

const fromBuildingName = computed(() => {
  if (!fromBuildingId.value) return '';
  const building = buildings.value.find(b => b.id === fromBuildingId.value);
  return building?.name || '';
});

const fromDepartmentName = computed(() => {
  if (!fromBuildingId.value || !fromLocationId.value) return '';
  const building = buildings.value.find(b => b.id === fromBuildingId.value);
  if (!building) return '';
  
  // Get department by ID
  const department = building.departments.find(d => d.id === fromLocationId.value);
  return department?.name || '';
});

const toBuildingName = computed(() => {
  if (!toBuildingId.value) return '';
  const building = buildings.value.find(b => b.id === toBuildingId.value);
  return building?.name || '';
});

const toDepartmentName = computed(() => {
  if (!toBuildingId.value || !toLocationId.value) return '';
  const building = buildings.value.find(b => b.id === toBuildingId.value);
  if (!building) return '';
  
  // Get department by ID
  const department = building.departments.find(d => d.id === toLocationId.value);
  return department?.name || '';
});

// Computed properties
const buildings = computed(() => settingsStore.buildings);

const fromDepartments = computed(() => {
  if (!fromBuildingId.value) return [];
  
  const building = buildings.value.find(b => b.id === fromBuildingId.value);
  if (!building) return [];
  
  // Return departments from the building
  return building.departments;
});

const toDepartments = computed(() => {
  if (!toBuildingId.value) return [];
  
  const building = buildings.value.find(b => b.id === toBuildingId.value);
  if (!building) return [];
  
  // Return departments from the building
  return building.departments;
});

// Methods
const loadExistingDefaults = () => {
  // Try to get defaults for the specific item type first (if selected)
  let defaults;
  
  if (selectedItemType.value) {
    // Look for defaults specific to this item type
    defaults = settingsStore.getJobCategoryDefault(props.category, selectedItemType.value);
  }
  
  // If no specific defaults found or no item type selected, get category defaults
  if (!defaults) {
    defaults = settingsStore.getJobCategoryDefault(props.category);
  }
  
  if (defaults) {
    // If we found defaults with an item type, set the selection
    if (defaults.itemType) {
      selectedItemType.value = defaults.itemType;
    }
    
    // Set from location
    if (defaults.fromBuildingId) {
      fromBuildingId.value = defaults.fromBuildingId;
      
      if (defaults.fromLocationId) {
        fromLocationId.value = defaults.fromLocationId;
      }
    }
    
    // Set to location
    if (defaults.toBuildingId) {
      toBuildingId.value = defaults.toBuildingId;
      
      if (defaults.toLocationId) {
        toLocationId.value = defaults.toLocationId;
      }
    }
  }
}

const resetFromLocation = () => {
  fromLocationId.value = '';
}

const resetToLocation = () => {
  toLocationId.value = '';
}

const saveDefaults = () => {
  // Create the default object
  const defaults: JobCategoryDefault = {
    category: props.category
  };
  
  // Add item type if one is selected
  if (selectedItemType.value) {
    defaults.itemType = selectedItemType.value;
  }
  
  // Only set From location properties if a building is selected (origin is optional)
  if (fromBuildingId.value) {
    defaults.fromBuildingId = fromBuildingId.value;
    
    if (fromLocationId.value) {
      defaults.fromLocationId = fromLocationId.value;
      // Determine if the location is in departments
      const building = buildings.value.find(b => b.id === fromBuildingId.value);
      if (building) {
        if (building.departments.some(d => d.id === fromLocationId.value)) {
          defaults.fromLocationType = 'department';
        }
      }
    }
  }
  
  // Only set To location properties if a building is selected (destination is optional)
  if (toBuildingId.value) {
    defaults.toBuildingId = toBuildingId.value;
    
    if (toLocationId.value) {
      defaults.toLocationId = toLocationId.value;
      // Determine if the location is in departments
      const building = buildings.value.find(b => b.id === toBuildingId.value);
      if (building) {
        if (building.departments.some(d => d.id === toLocationId.value)) {
          defaults.toLocationType = 'department';
        }
      }
    }
  }
  
  // We need at least one location set (either from or to) to save
  if (!fromBuildingId.value && !toBuildingId.value) {
    alert('Please set at least one location (From or To)');
    return;
  }
  
  // Save the defaults
  settingsStore.setJobCategoryDefault(defaults);
  
  // Notify the parent
  emit('saved');
  emit('close');
}

const clearDefaults = () => {
  // Clear the location settings
  fromBuildingId.value = '';
  fromLocationId.value = '';
  toBuildingId.value = '';
  toLocationId.value = '';
  
  // If we have an existing default, delete it
  if (selectedItemType.value) {
    settingsStore.deleteJobCategoryDefault(props.category, selectedItemType.value);
  } else {
    settingsStore.deleteJobCategoryDefault(props.category);
  }
  
  // Notify parent
  emit('saved');
  emit('close');
};

const cancel = () => {
  emit('close');
}

// Initialize
onMounted(() => {
  loadExistingDefaults();
})
</script>

<style scoped>
.category-defaults-modal {
  padding: var(--spacing-md);
  max-width: 100%;
  background-color: white;
  border-radius: var(--border-radius-lg);
}

.modal-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xs);
}

.modal-description {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--font-size-sm);
}

.setting-scope {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-direction: column;
}

.setting-scope-card {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  transition: all var(--transition-fast);
  position: relative;
}

.setting-scope-card.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.scope-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.scope-label {
  display: flex;
  cursor: pointer;
  width: 100%;
  gap: var(--spacing-md);
}

.scope-icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scope-content h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  border: none;
  padding: 0;
}

.scope-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.item-select {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--color-border);
}

/* Always use column layout for locations, as requested */
.locations-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.location-section {
  flex: 1;
  background-color: var(--color-background-light);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border-light);
}

h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-md);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-xs);
}

.location-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.building-select,
.department-select {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.building-select label,
.department-select label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  background-color: white;
}

.location-summary {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
}

.summary-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.from-icon {
  color: var(--color-primary);
  background-color: var(--color-primary-light, rgba(0, 123, 255, 0.1));
}

.to-icon {
  color: var(--color-success);
  background-color: var(--color-success-light, rgba(40, 167, 69, 0.1));
}

.summary-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.settings-summary {
  background-color: var(--color-background-light);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.summary-title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-xs);
}

.summary-item-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.summary-item {
  padding: var(--spacing-sm);
  background-color: white;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border-light);
}

.settings-note {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.btn-secondary, 
.btn-primary,
.btn-danger {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-light);
  border-color: var(--color-border-dark);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: var(--color-danger-dark, #c82333);
}
</style>
