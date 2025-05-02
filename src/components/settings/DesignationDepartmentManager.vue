<template>
  <div class="department-manager">
    <div class="section-header">
      <h2>Department Designations</h2>
      <p class="section-description">
        These departments are used for porter assignments during shifts.
      </p>
    </div>
    
    <!-- Add new department form -->
    <div class="add-department-form" v-if="showAddForm">
      <input
        type="text"
        v-model="newDepartment.name"
        placeholder="Department Name"
        class="form-control"
      />
      <div class="color-picker">
        <input
          type="color"
          v-model="newDepartment.color"
          class="color-input"
        />
        <span class="color-label">Department Color</span>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" @click="cancelAdd">Cancel</button>
        <button 
          class="btn-primary" 
          @click="addDepartment"
          :disabled="!newDepartment.name.trim()"
        >
          Add Department
        </button>
      </div>
    </div>
    
    <!-- Actions -->
    <button v-if="!showAddForm" class="btn-primary add-btn" @click="showAddForm = true">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Add Department
    </button>
    
    <!-- Department list -->
    <div class="departments-list">
      <div v-if="departments.length === 0" class="empty-state">
        <p>No department designations have been created yet.</p>
      </div>
      
      <div v-else class="departments-grid">
        <div 
          v-for="department in departments" 
          :key="department.id"
          class="department-card"
        >
          <div 
            class="department-color" 
            :style="{ backgroundColor: department.color || '#cccccc' }"
          ></div>
          <div class="department-info">
            <span class="department-name">{{ department.name }}</span>
          </div>
          <div class="department-actions">
            <button 
              class="btn-icon edit-btn" 
              @click="startEdit(department)"
              title="Edit department"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              class="btn-icon delete-btn" 
              @click="confirmDelete(department)"
              title="Delete department"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Department Modal -->
    <div v-if="showEditModal" class="modal-backdrop" @click.self="cancelEdit">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Department</h3>
          <button class="btn-close" @click="cancelEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Department Name</label>
            <input 
              type="text" 
              v-model="editingDepartment.name" 
              class="form-control" 
              placeholder="Department Name"
            />
          </div>
          <div class="form-group">
            <label>Department Color</label>
            <input 
              type="color" 
              v-model="editingDepartment.color" 
              class="color-input" 
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelEdit">Cancel</button>
          <button 
            class="btn-primary" 
            @click="updateDepartment"
            :disabled="!editingDepartment.name.trim()"
          >
            Update
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Delete Department</h3>
          <button class="btn-close" @click="cancelDelete">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete the department <strong>{{ departmentToDelete?.name }}</strong>?
            This will also remove any porter assignments to this department.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelDelete">Cancel</button>
          <button class="btn-danger" @click="deleteDepartment">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import type { DesignationDepartment } from '@/types'

// Store access
const settingsStore = useSettingsStore()
const departments = computed(() => settingsStore.designationDepartments)

// Add department state
const showAddForm = ref(false)
const newDepartment = ref({
  name: '',
  color: '#4361ee' // Default color
})

// Edit department state
const showEditModal = ref(false)
const editingDepartment = ref<DesignationDepartment>({ id: '', name: '', color: '' })

// Delete department state
const showDeleteModal = ref(false)
const departmentToDelete = ref<DesignationDepartment | null>(null)

// Add department methods
function addDepartment() {
  if (newDepartment.value.name.trim()) {
    settingsStore.addDesignationDepartment(
      newDepartment.value.name,
      newDepartment.value.color
    )
    
    // Reset form
    newDepartment.value = {
      name: '',
      color: '#4361ee'
    }
    showAddForm.value = false
  }
}

function cancelAdd() {
  newDepartment.value = {
    name: '',
    color: '#4361ee'
  }
  showAddForm.value = false
}

// Edit department methods
function startEdit(department: DesignationDepartment) {
  editingDepartment.value = { ...department }
  showEditModal.value = true
}

function updateDepartment() {
  if (editingDepartment.value.id && editingDepartment.value.name.trim()) {
    settingsStore.updateDesignationDepartment(
      editingDepartment.value.id,
      editingDepartment.value.name,
      editingDepartment.value.color
    )
    
    // Close modal
    showEditModal.value = false
  }
}

function cancelEdit() {
  showEditModal.value = false
}

// Delete department methods
function confirmDelete(department: DesignationDepartment) {
  departmentToDelete.value = department
  showDeleteModal.value = true
}

function deleteDepartment() {
  if (departmentToDelete.value) {
    settingsStore.deleteDesignationDepartment(departmentToDelete.value.id)
    
    // Close modal
    showDeleteModal.value = false
    departmentToDelete.value = null
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  departmentToDelete.value = null
}
</script>

<style scoped>
.department-manager {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  margin-bottom: var(--spacing-md);
}

.section-description {
  color: var(--color-text-light);
  margin-top: var(--spacing-xs);
}

h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.add-department-form {
  background-color: var(--color-card-alt, #f9f9f9);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.color-picker {
  display: flex;
  align-items: center;
  margin: var(--spacing-sm) 0;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  margin-right: var(--spacing-sm);
}

.color-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.departments-list {
  margin-top: var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-md);
  background-color: var(--color-card-alt, #f9f9f9);
  border-radius: var(--border-radius);
  color: var(--color-text-light);
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.department-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
}

.department-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
}

.department-info {
  flex: 1;
}

.department-name {
  font-weight: var(--font-weight-medium);
}

.department-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--color-card-alt, #f9f9f9);
  color: var(--color-text);
}

.edit-btn:hover {
  color: var(--color-primary);
}

.delete-btn:hover {
  color: var(--color-danger);
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  transition: background-color var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-card-alt, #f9f9f9);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.btn-close {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
}

.modal-body {
  padding: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}
</style>
