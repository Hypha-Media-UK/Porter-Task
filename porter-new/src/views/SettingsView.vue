<template>
  <div class="settings-view">
    <header class="settings-header">
      <h1>Settings</h1>
    </header>

    <!-- Modal for adding/editing items -->
    <Modal 
      :show="showModal" 
      :title="modalTitle"
      @close="showModal = false"
      @save="saveModal"
    >
      <!-- Dynamic form content based on modalType -->
      <div v-if="modalType === 'supervisor' || modalType === 'porter'">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" v-model="modalFormData.name" class="form-control" />
        </div>
      </div>

      <div v-if="modalType === 'building'">
        <div class="form-group">
          <label for="name">Building Name</label>
          <input type="text" id="name" v-model="modalFormData.name" class="form-control" />
        </div>
      </div>

      <div v-if="modalType === 'department'">
        <div class="form-group">
          <label for="building-id">Building</label>
          <select id="building-id" v-model="modalFormData.buildingId" class="form-control">
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="name">Department Name</label>
          <input type="text" id="name" v-model="modalFormData.name" class="form-control" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="modalFormData.frequent" />
            Mark as frequently used
          </label>
        </div>
      </div>

      <div v-if="modalType === 'designationDept'">
        <div class="form-group">
          <label for="name">Department Name</label>
          <input type="text" id="name" v-model="modalFormData.name" class="form-control" />
        </div>
        <div class="form-group">
          <label for="color">Color</label>
          <input type="color" id="color" v-model="modalFormData.color" class="form-control" />
        </div>
      </div>

      <div v-if="modalType === 'jobCategory'">
        <div class="form-group">
          <label for="name">Category Name</label>
          <input type="text" id="name" v-model="modalFormData.name" class="form-control" />
        </div>
      </div>

      <div v-if="modalType === 'jobItem'">
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="modalFormData.category" class="form-control">
            <option v-for="(_, category) in jobCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="itemType">Item Type</label>
          <input type="text" id="itemType" v-model="modalFormData.itemType" class="form-control" />
        </div>
      </div>
    </Modal>
    
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn" 
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div class="tab-content">
      <!-- App Settings Tab -->
      <div v-if="activeTab === 'app'" class="tab-pane">
        <h2>App Settings</h2>
        
        <div class="setting-group">
          <h3>Shift Schedule</h3>
          <div class="form-group">
            <label for="day-shift-start">Day Shift Start</label>
            <input type="time" id="day-shift-start" v-model="dayShiftStart" class="form-control" />
          </div>
          <div class="form-group">
            <label for="day-shift-end">Day Shift End</label>
            <input type="time" id="day-shift-end" v-model="dayShiftEnd" class="form-control" />
          </div>
          <div class="form-group">
            <label for="night-shift-start">Night Shift Start</label>
            <input type="time" id="night-shift-start" v-model="nightShiftStart" class="form-control" />
          </div>
          <div class="form-group">
            <label for="night-shift-end">Night Shift End</label>
            <input type="time" id="night-shift-end" v-model="nightShiftEnd" class="form-control" />
          </div>
          
          <button class="btn-primary" @click="saveShiftSettings">Save Shift Settings</button>
        </div>
        
        <div class="setting-group">
          <h3>Department Designations</h3>
          <p><em>Departments where porters can be assigned during shifts.</em></p>
          
          <div class="settings-table">
            <div class="settings-table-header">
              <div>Name</div>
              <div>Color</div>
              <div>Actions</div>
            </div>
            
            <div v-for="dept in departmentDesignations" :key="dept.id" class="settings-table-row">
              <div>{{ dept.name }}</div>
              <div class="color-preview" :style="{ backgroundColor: dept.color }"></div>
              <div class="row-actions">
                <button class="btn-icon" @click="openModal('designationDept', 'Edit Department Designation', dept)">Edit</button>
                <button class="btn-icon delete" @click="deleteItem('designationDept', dept)">Delete</button>
              </div>
            </div>
            
            <div class="settings-table-footer">
              <button class="btn-primary" @click="openModal('designationDept', 'Add Department Designation')">Add Department</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Staff Tab -->
      <div v-if="activeTab === 'staff'" class="tab-pane">
        <h2>Staff Management</h2>
        
        <div class="setting-group">
          <h3>Supervisors</h3>
          <div class="settings-table">
            <div class="settings-table-header">
              <div>Name</div>
              <div>Actions</div>
            </div>
            
            <div v-for="supervisor in supervisors" :key="supervisor" class="settings-table-row">
              <div>{{ supervisor }}</div>
              <div class="row-actions">
                <button class="btn-icon" @click="openModal('supervisor', 'Edit Supervisor', supervisor)">Edit</button>
                <button class="btn-icon delete" @click="deleteItem('supervisor', supervisor)">Delete</button>
              </div>
            </div>
            
            <div class="settings-table-footer">
              <button class="btn-primary" @click="openModal('supervisor', 'Add Supervisor')">Add Supervisor</button>
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <h3>Porters</h3>
          <div class="settings-table">
            <div class="settings-table-header">
              <div>Name</div>
              <div>Actions</div>
            </div>
            
            <div v-for="porter in porters" :key="porter" class="settings-table-row">
              <div>{{ porter }}</div>
              <div class="row-actions">
                <button class="btn-icon" @click="openModal('porter', 'Edit Porter', porter)">Edit</button>
                <button class="btn-icon delete" @click="deleteItem('porter', porter)">Delete</button>
              </div>
            </div>
            
            <div class="settings-table-footer">
              <button class="btn-primary" @click="openModal('porter', 'Add Porter')">Add Porter</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Locations Tab -->
      <div v-if="activeTab === 'locations'" class="tab-pane">
        <h2>Locations Management</h2>
        
        <div class="setting-group">
          <h3>Buildings and Departments</h3>
          
          <div class="buildings-container">
            <div v-for="building in buildings" :key="building.id" class="building-card">
              <div class="building-header">
                <h4>{{ building.name }}</h4>
                <div class="row-actions">
                  <button class="btn-icon" @click="openModal('building', 'Edit Building', building)">Edit</button>
                  <button class="btn-icon delete" @click="deleteItem('building', building)">Delete</button>
                </div>
              </div>
              
              <div class="departments-list">
                <div v-for="dept in building.departments" :key="dept.id" class="department-item">
                  <div class="department-name">
                    {{ dept.name }}
                    <span v-if="dept.frequent" class="frequent-badge">★</span>
                  </div>
                  <div class="row-actions">
                    <button class="btn-icon" @click="openModal('department', 'Edit Department', {...dept, buildingId: building.id})">Edit</button>
                    <button class="btn-icon delete" @click="deleteItem('department', dept)">Delete</button>
                  </div>
                </div>
                <button class="btn-secondary add-department" @click="openModal('department', 'Add Department', {buildingId: building.id})">Add Department</button>
              </div>
            </div>
            
            <button class="btn-primary add-building" @click="openModal('building', 'Add Building')">Add Building</button>
          </div>
        </div>
      </div>
      
      <!-- Task Types Tab -->
      <div v-if="activeTab === 'tasks'" class="tab-pane">
        <h2>Task Types Management</h2>
        
        <div class="setting-group">
          <h3>Job Categories and Item Types</h3>
          
          <div class="categories-container">
            <div v-for="(items, category) in jobCategories" :key="category" class="category-card">
              <div class="category-header">
                <h4>{{ category }}</h4>
                <div class="row-actions">
                  <button class="btn-icon" @click="openModal('jobCategory', 'Edit Job Category', category)">Edit</button>
                  <button class="btn-icon delete" @click="deleteItem('jobCategory', category)">Delete</button>
                </div>
              </div>
              
              <div class="items-list">
                <div v-for="item in items" :key="item" class="item-row">
                  <div>{{ item }}</div>
                  <div class="row-actions">
                    <button class="btn-icon" @click="openModal('jobItem', 'Edit Job Item', {category, itemType: item})">Edit</button>
                    <button class="btn-icon delete" @click="deleteItem('jobItem', {category, itemType: item})">Delete</button>
                  </div>
                </div>
                <button class="btn-secondary add-item" @click="openModal('jobItem', 'Add Job Item', {category})">Add Item Type</button>
              </div>
            </div>
            
            <button class="btn-primary add-category" @click="openModal('jobCategory', 'Add Job Category')">Add Job Category</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import Modal from '@/components/common/Modal.vue'

// Initialize store
const settingsStore = useSettingsStore()

// Tabs
const tabs = [
  { id: 'app', name: 'App Settings' },
  { id: 'staff', name: 'Staff' },
  { id: 'locations', name: 'Locations' },
  { id: 'tasks', name: 'Task Types' }
]

const activeTab = ref('app')

// Load data from the store
onMounted(async () => {
  await settingsStore.initialize()
  
  // Initialize form values from store
  dayShiftStart.value = settingsStore.shifts.day.start
  dayShiftEnd.value = settingsStore.shifts.day.end
  nightShiftStart.value = settingsStore.shifts.night.start
  nightShiftEnd.value = settingsStore.shifts.night.end
})

// Form state for shift settings
const dayShiftStart = ref('08:00')
const dayShiftEnd = ref('20:00')
const nightShiftStart = ref('20:00')
const nightShiftEnd = ref('08:00')

// Access data from store
const departmentDesignations = computed(() => settingsStore.designationDepartments)
const supervisors = computed(() => settingsStore.supervisors)
const porters = computed(() => settingsStore.porters)
const buildings = computed(() => settingsStore.buildings)
const jobCategories = computed(() => settingsStore.jobCategories)

// Modal state
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const editingItem = ref<any>(null)
const modalFormData = reactive({
  name: '',
  color: '#0066cc',
  buildingId: '',
  frequent: false,
  category: '',
  itemType: ''
})

// Save shift settings
async function saveShiftSettings() {
  await settingsStore.updateShiftSchedule({
    day: {
      start: dayShiftStart.value,
      end: dayShiftEnd.value
    },
    night: {
      start: nightShiftStart.value,
      end: nightShiftEnd.value
    }
  })
  
  // Show success message or handle error
  if (settingsStore.error) {
    alert(`Error saving settings: ${settingsStore.error}`)
  } else {
    alert('Shift settings saved successfully')
  }
}

// Modal functions
function openModal(type: string, title: string, item: any = null) {
  modalType.value = type
  modalTitle.value = title
  editingItem.value = item
  
  // Reset form data
  modalFormData.name = ''
  modalFormData.color = '#0066cc'
  modalFormData.buildingId = ''
  modalFormData.frequent = false
  modalFormData.category = ''
  modalFormData.itemType = ''
  
  // Populate form data if editing
  if (item) {
    switch (type) {
      case 'supervisor':
      case 'porter':
      case 'building':
        modalFormData.name = item.name || item
        break
      case 'department':
        modalFormData.name = item.name || ''
        modalFormData.buildingId = item.buildingId || ''
        modalFormData.frequent = !!item.frequent
        break
      case 'designationDept':
        modalFormData.name = item.name || ''
        modalFormData.color = item.color || '#0066cc'
        break
      case 'jobCategory':
        modalFormData.name = item
        break
      case 'jobItem':
        modalFormData.category = item.category || ''
        modalFormData.itemType = item.itemType || ''
        break
    }
  } else if (type === 'department') {
    // Set default building ID if adding a new department
    modalFormData.buildingId = buildings.value.length > 0 ? buildings.value[0].id : ''
  } else if (type === 'jobItem') {
    // Set default category if adding a new job item
    const categories = Object.keys(jobCategories.value)
    modalFormData.category = categories.length > 0 ? categories[0] : ''
  }
  
  // Debug form data
  console.log('Opening modal with data:', { type, modalFormData, item });
  
  showModal.value = true
}

async function saveModal() {
  let success = false
  
  try {
    switch (modalType.value) {
      case 'supervisor':
        if (editingItem.value) {
          success = await settingsStore.updateSupervisor(editingItem.value, modalFormData.name)
        } else {
          success = await settingsStore.addSupervisor(modalFormData.name)
        }
        break
        
      case 'porter':
        if (editingItem.value) {
          success = await settingsStore.updatePorter(editingItem.value, modalFormData.name)
        } else {
          success = await settingsStore.addPorter(modalFormData.name)
        }
        break
        
      case 'building':
        if (editingItem.value) {
          success = await settingsStore.updateBuilding(editingItem.value.id, modalFormData.name)
        } else {
          success = await settingsStore.addBuilding(modalFormData.name)
        }
        break
        
      case 'department':
        if (editingItem.value) {
          success = await settingsStore.updateDepartment(
            editingItem.value.id, 
            modalFormData.name, 
            modalFormData.frequent
          )
        } else {
          success = await settingsStore.addDepartment(
            modalFormData.buildingId,
            modalFormData.name,
            modalFormData.frequent
          )
        }
        break
        
      case 'designationDept':
        if (editingItem.value) {
          success = await settingsStore.updateDesignationDepartment(
            editingItem.value.id,
            modalFormData.name,
            modalFormData.color
          )
        } else {
          success = await settingsStore.addDesignationDepartment(
            modalFormData.name,
            modalFormData.color
          )
        }
        break
        
      case 'jobCategory':
        if (editingItem.value) {
          success = await settingsStore.updateJobCategory(editingItem.value, modalFormData.name)
        } else {
          success = await settingsStore.addJobCategory(modalFormData.name)
        }
        break
        
      case 'jobItem':
        if (editingItem.value) {
          success = await settingsStore.updateJobCategoryItem(
            editingItem.value.category,
            editingItem.value.itemType,
            modalFormData.itemType
          )
        } else {
          success = await settingsStore.addJobCategoryItem(
            modalFormData.category,
            modalFormData.itemType
          )
        }
        break
    }
    
    if (success) {
      showModal.value = false
    } else if (settingsStore.error) {
      alert(`Error: ${settingsStore.error}`)
    }
  } catch (err) {
    console.error('Error saving data:', err)
    alert('An error occurred while saving')
  }
}

async function deleteItem(type: string, item: any) {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) {
    return
  }
  
  let success = false
  
  try {
    switch (type) {
      case 'supervisor':
        success = await settingsStore.deleteSupervisor(item)
        break
        
      case 'porter':
        success = await settingsStore.deletePorter(item)
        break
        
      case 'building':
        success = await settingsStore.deleteBuilding(item.id)
        break
        
      case 'department':
        success = await settingsStore.deleteDepartment(item.id)
        break
        
      case 'designationDept':
        success = await settingsStore.deleteDesignationDepartment(item.id)
        break
        
      case 'jobCategory':
        success = await settingsStore.deleteJobCategory(item)
        break
        
      case 'jobItem':
        success = await settingsStore.deleteJobCategoryItem(item.category, item.itemType)
        break
    }
    
    if (!success && settingsStore.error) {
      alert(`Error: ${settingsStore.error}`)
    }
  } catch (err) {
    console.error('Error deleting item:', err)
    alert('An error occurred while deleting')
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.settings-header {
  margin-bottom: 1rem;
}

h1 {
  font-size: 24px;
  margin-bottom: 1rem;
}

h2 {
  font-size: 20px;
  margin-bottom: 1rem;
}

h3 {
  font-size: 18px;
  color: #333;
  margin: 1rem 0 0.5rem;
}

h4 {
  margin: 0;
  font-size: 16px;
}

.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  overflow-x: auto;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
}

.tab-btn.active {
  background-color: #0066cc;
  color: white;
}

.tab-pane {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.setting-group {
  margin-bottom: 2rem;
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

.settings-table {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.settings-table-header {
  display: grid;
  grid-template-columns: 1fr auto;
  background-color: #f5f5f5;
  padding: 0.5rem;
  font-weight: bold;
}

.settings-table-header.with-color {
  grid-template-columns: 1fr 80px auto;
}

.settings-table-row {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 0.5rem;
  border-top: 1px solid #eee;
  align-items: center;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.row-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #0066cc;
}

.btn-icon.delete {
  color: #dc3545;
}

.settings-table-footer {
  padding: 0.5rem;
  border-top: 1px solid #eee;
}

.buildings-container, .categories-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.building-card, .category-card {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.building-header, .category-header {
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 0.5rem;
  align-items: center;
}

.departments-list, .items-list {
  padding: 0.5rem;
}

.department-item, .item-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.department-item:last-child, .item-row:last-child {
  border-bottom: none;
}

.department-name {
  display: flex;
  align-items: center;
}

.frequent-badge {
  color: gold;
  margin-left: 0.5rem;
}

.add-department, .add-item {
  margin-top: 0.5rem;
  width: 100%;
}

.add-building, .add-category {
  align-self: flex-start;
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
</style>
