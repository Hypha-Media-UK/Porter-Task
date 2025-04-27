<template>
  <section class="settings-section">
    <h2>Buildings &amp; Locations</h2>
    
    <div class="setting-group">
      <div class="buildings">
        <div v-for="building in buildings" :key="building.id" class="building-section">
          <div class="building-header">
            <div class="building-info">
              <span v-if="editingBuilding !== building.id" class="building-name">{{ building.name }}</span>
              <input 
                v-else
                type="text" 
                v-model="editedBuildingName" 
                @keyup.enter="confirmEditBuilding(building.id)"
                @keyup.esc="cancelEditBuilding"
                ref="buildingEditInput"
                class="edit-input"
              >
            </div>
            <div class="building-actions">
              <button 
                v-if="editingBuilding !== building.id"
                class="btn-icon" 
                @click="startEditBuilding(building.id)"
                aria-label="Edit building"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                v-if="editingBuilding === building.id"
                class="btn-icon" 
                @click="confirmEditBuilding(building.id)"
                aria-label="Save building"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </button>
              <button 
                v-if="editingBuilding === building.id"
                class="btn-icon" 
                @click="cancelEditBuilding"
                aria-label="Cancel edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button 
                v-if="editingBuilding !== building.id"
                class="btn-icon" 
                @click="removeBuilding(building.id)"
                aria-label="Remove building"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Departments -->
          <div class="location-section">
            <h4>Departments</h4>
            <ul class="location-list">
              <li v-for="department in getAllDepartments(building)" :key="department.id" class="location-item">
                <div class="location-info">
                  <span v-if="editingDepartment !== department.id || editingDepartmentBuilding !== building.id">{{ department.name }}</span>
                  <input 
                    v-else
                    type="text" 
                    v-model="editedDepartmentName" 
                    @keyup.enter="confirmEditDepartment(building.id, department.id)"
                    @keyup.esc="cancelEditDepartment"
                    ref="departmentEditInput"
                    class="edit-input"
                  >
                </div>
                <div class="location-actions">
                  <button 
                    v-if="editingDepartment !== department.id || editingDepartmentBuilding !== building.id"
                    class="btn-icon sm" 
                    @click="startEditDepartment(building.id, department.id)"
                    aria-label="Edit department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    v-if="editingDepartment === department.id && editingDepartmentBuilding === building.id"
                    class="btn-icon sm" 
                    @click="confirmEditDepartment(building.id, department.id)"
                    aria-label="Save department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  </button>
                  <button 
                    v-if="editingDepartment === department.id && editingDepartmentBuilding === building.id"
                    class="btn-icon sm" 
                    @click="cancelEditDepartment"
                    aria-label="Cancel edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button 
                    v-if="editingDepartment !== department.id || editingDepartmentBuilding !== building.id"
                    class="btn-icon sm" 
                    @click="removeDepartment(building.id, department.id)"
                    aria-label="Remove department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </li>
              <li v-if="getAllDepartments(building).length === 0" class="empty-list-item">
                No departments added
              </li>
            </ul>
            
            <!-- Direct input for adding departments (consistent with other settings components) -->
            <div class="add-location">
              <input 
                type="text" 
                v-model="newDepartments[building.id]" 
                placeholder="Enter department name"
                @keyup.enter="confirmAddDepartment(building.id)"
              >
              <button 
                class="btn-primary" 
                @click="confirmAddDepartment(building.id)"
                :disabled="!newDepartments[building.id] || !newDepartments[building.id].trim()"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div class="add-building">
          <input 
            type="text" 
            v-model="newBuilding" 
            placeholder="Enter new building name"
            @keyup.enter="confirmAddBuilding"
          >
          <button 
            class="btn-primary" 
            @click="confirmAddBuilding"
            :disabled="!newBuilding.trim()"
          >
            Add Building
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, reactive } from 'vue'
import { useSettingsStore } from '../../stores/settings'

// Store
const settingsStore = useSettingsStore()
// Use computed for reactive buildings reference
const buildings = computed(() => settingsStore.buildings)
const { 
  addBuilding: storeAddBuilding, 
  updateBuilding: storeUpdateBuilding, 
  deleteBuilding: storeDeleteBuilding,
  addDepartment: storeAddDepartment,
  updateDepartment: storeUpdateDepartment,
  deleteDepartment: storeDeleteDepartment,
  addWard: storeAddWard,
  updateWard: storeUpdateWard,
  deleteWard: storeDeleteWard
} = settingsStore

// Building state
const newBuilding = ref('')
const editingBuilding = ref<string | null>(null)
const editedBuildingName = ref('')
const buildingEditInput = ref<HTMLInputElement | null>(null)

// Department state
const editingDepartment = ref<string | null>(null)
const editingDepartmentBuilding = ref<string | null>(null)
const editedDepartmentName = ref('')
const departmentEditInput = ref<HTMLInputElement | null>(null)

// Store new department names for each building
const newDepartments = reactive<Record<string, string>>({})

// Helper function to get all departments (combining departments and wards arrays)
const getAllDepartments = (building: any) => {
  return [...building.departments, ...building.wards];
}

// Building management
onMounted(() => {
  // Make sure data is loaded
  if (buildings.value.length === 0) {
    console.log('No buildings found, attempting to initialize store...')
    settingsStore.initialize().catch(err => console.error('Error initializing store:', err))
  } else {
    console.log('Buildings loaded:', buildings.value.length)
  }
  
  // Initialize newDepartments object with empty strings for each building
  buildings.value.forEach((building: any) => {
    newDepartments[building.id] = ''
  })
})

const confirmAddBuilding = () => {
  const name = newBuilding.value.trim()
  if (name) {
    console.log('Adding building:', name)
    
    try {
      // Adding a building with a unique ID and empty arrays for departments and wards
      const newId = name.toLowerCase().replace(/\s+/g, '-')
      
      // First check if the name or ID already exists
      if (buildings.value.some((b: any) => b.name === name || b.id === newId)) {
        console.error('Building with this name or ID already exists')
        alert('A building with this name already exists.')
        return
      }
      
      // Create new building directly (fallback approach if store method fails)
      const newBuildingObj = {
        id: newId,
        name,
        departments: [],
        wards: []
      }
      
      // Try to use store function first
      const result = storeAddBuilding(name)
      
      if (!result) {
        // If store function failed, add it directly
        console.log('Store add function failed, adding directly to buildings array')
        settingsStore.buildings.push(newBuildingObj)
      }
      
      // Initialize newDepartments for this building
      newDepartments[newId] = ''
      
      // Clear input field
      newBuilding.value = ''
      console.log('Building added successfully. Current buildings:', buildings.value)
    } catch (error) {
      console.error('Error adding building:', error)
      alert('An error occurred while adding a building.')
    }
  }
}

const startEditBuilding = (buildingId: string) => {
  const building = buildings.value.find((b: any) => b.id === buildingId)
  if (building) {
    editingBuilding.value = buildingId
    editedBuildingName.value = building.name
    
    // Focus the input after render
    nextTick(() => {
      buildingEditInput.value?.focus()
    })
  }
}

const confirmEditBuilding = (buildingId: string) => {
  const newName = editedBuildingName.value.trim()
  if (newName && storeUpdateBuilding(buildingId, newName)) {
    editingBuilding.value = null
  }
}

const cancelEditBuilding = () => {
  editingBuilding.value = null
  editedBuildingName.value = ''
}

const removeBuilding = (buildingId: string) => {
  const building = buildings.value.find((b: any) => b.id === buildingId)
  if (building && confirm(`Are you sure you want to remove building "${building.name}" and all its departments?`)) {
    storeDeleteBuilding(buildingId)
    
    // Remove this building from newDepartments
    delete newDepartments[buildingId]
  }
}

// Department management - using a simplified approach that handles both departments and wards
const confirmAddDepartment = (buildingId: string) => {
  const name = newDepartments[buildingId]?.trim()
  if (name) {
    // By default, add to departments array (could be configurable in the future if needed)
    storeAddDepartment(buildingId, name)
    
    // Clear the input field after adding
    newDepartments[buildingId] = ''
  }
}

const startEditDepartment = (buildingId: string, departmentId: string) => {
  const building = buildings.value.find((b: any) => b.id === buildingId)
  if (!building) return
  
  // Look in both departments and wards arrays
  let department = building.departments.find((d: any) => d.id === departmentId)
  if (!department) {
    department = building.wards.find((w: any) => w.id === departmentId)
  }
  if (department) {
    editingDepartmentBuilding.value = buildingId
    editingDepartment.value = departmentId
    editedDepartmentName.value = department.name
    
    // Focus the input after render
    nextTick(() => {
      departmentEditInput.value?.focus()
    })
  }
}

const confirmEditDepartment = (buildingId: string, departmentId: string) => {
  const newName = editedDepartmentName.value.trim()
  
  // Check if it's in departments or wards and update accordingly
  const building = buildings.value.find((b: any) => b.id === buildingId)
  if (!building) return false
  
  const isDepartment = building.departments.some((d: any) => d.id === departmentId)
  
  if (newName) {
    if (isDepartment) {
      storeUpdateDepartment(buildingId, departmentId, newName)
    } else {
      storeUpdateWard(buildingId, departmentId, newName)
    }
    editingDepartmentBuilding.value = null
    editingDepartment.value = null
  }
}

const cancelEditDepartment = () => {
  editingDepartmentBuilding.value = null
  editingDepartment.value = null
  editedDepartmentName.value = ''
}

const removeDepartment = (buildingId: string, departmentId: string) => {
  const building = buildings.value.find((b: any) => b.id === buildingId)
  if (!building) return
  
  // Check if it's in departments or wards and remove accordingly
  let itemToRemove = building.departments.find((d: any) => d.id === departmentId)
  let isWard = false
  
  if (!itemToRemove) {
    itemToRemove = building.wards.find((w: any) => w.id === departmentId)
    isWard = true
  }
  
  if (itemToRemove && confirm(`Are you sure you want to remove department "${itemToRemove.name}"?`)) {
    if (isWard) {
      storeDeleteWard(buildingId, departmentId)
    } else {
      storeDeleteDepartment(buildingId, departmentId)
    }
  }
}
</script>

<style scoped>
.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-md);
  color: var(--color-text);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border-light);
}

.setting-group {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.buildings {
  padding: var(--spacing-md);
}

.building-section {
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.building-header {
  background-color: var(--color-background);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-light);
}

.building-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.building-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-danger);
}

.btn-icon.sm {
  padding: 2px;
}

.location-section {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.location-section:last-child {
  border-bottom: none;
}

.location-section h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text);
}

.location-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-sm);
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  background-color: white;
}

.location-actions {
  display: flex;
  gap: 2px;
}

.empty-list-item {
  padding: var(--spacing-sm);
  text-align: center;
  color: var(--color-text-light);
  font-style: italic;
  font-size: var(--font-size-sm);
}

.add-location {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.add-building {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.add-building input, .edit-input, .add-location input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.edit-input {
  width: 100%;
}

.btn-primary {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background-color: var(--color-background-light);
  border-color: var(--color-border-dark);
}
</style>
