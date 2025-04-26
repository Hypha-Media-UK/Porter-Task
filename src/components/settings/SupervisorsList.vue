<template>
  <section class="settings-section">
    <h2>Supervisors</h2>
    
    <div class="setting-group">
      <div class="supervisor-list">
        <div v-if="supervisors.length === 0" class="empty-state">
          <p>No supervisors added yet</p>
        </div>
        
        <div v-else class="list-items">
          <div v-for="(supervisor, index) in supervisors" :key="index" class="list-item">
            <div class="supervisor-info">
              <span v-if="editingSupervisor !== supervisor" class="supervisor-name">{{ supervisor }}</span>
              <input 
                v-else
                type="text" 
                v-model="editedSupervisorName" 
                @keyup.enter="confirmEditSupervisor(supervisor)"
                @keyup.esc="cancelEditSupervisor"
                ref="supervisorEditInput"
                class="edit-input"
              >
            </div>
            <div class="supervisor-actions">
              <button 
                v-if="editingSupervisor !== supervisor"
                class="btn-icon" 
                @click="startEditSupervisor(supervisor)"
                aria-label="Edit supervisor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                v-if="editingSupervisor === supervisor"
                class="btn-icon" 
                @click="confirmEditSupervisor(supervisor)"
                aria-label="Save supervisor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </button>
              <button 
                v-if="editingSupervisor === supervisor"
                class="btn-icon" 
                @click="cancelEditSupervisor"
                aria-label="Cancel edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button 
                v-if="editingSupervisor !== supervisor"
                class="btn-icon" 
                @click="removeSupervisor(supervisor)"
                aria-label="Remove supervisor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="add-supervisor">
          <input 
            type="text" 
            v-model="newSupervisor" 
            placeholder="Enter supervisor name"
            @keyup.enter="addSupervisor"
          >
          <button 
            class="btn-primary" 
            @click="addSupervisor"
            :disabled="!newSupervisor.trim()"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useSettingsStore } from '../../stores/settings'

// Store
const settingsStore = useSettingsStore()
const { supervisors } = settingsStore

// Local state
const newSupervisor = ref('')
const editingSupervisor = ref<string | null>(null)
const editedSupervisorName = ref('')
const supervisorEditInput = ref<HTMLInputElement | null>(null)

// Supervisor management
const addSupervisor = () => {
  const name = newSupervisor.value.trim()
  if (name && !supervisors.includes(name)) {
    if (settingsStore.addSupervisor(name)) {
      newSupervisor.value = ''
    }
  }
}

const startEditSupervisor = (supervisor: string) => {
  editingSupervisor.value = supervisor
  editedSupervisorName.value = supervisor
  
  // Focus the input after render
  nextTick(() => {
    supervisorEditInput.value?.focus()
  })
}

const confirmEditSupervisor = (oldName: string) => {
  const newName = editedSupervisorName.value.trim()
  if (newName && settingsStore.updateSupervisor(oldName, newName)) {
    editingSupervisor.value = null
  }
}

const cancelEditSupervisor = () => {
  editingSupervisor.value = null
  editedSupervisorName.value = ''
}

const removeSupervisor = (name: string) => {
  if (confirm(`Are you sure you want to remove supervisor "${name}"?`)) {
    settingsStore.deleteSupervisor(name)
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

.supervisor-list {
  padding: var(--spacing-md);
}

.list-items {
  margin-bottom: var(--spacing-md);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.list-item:last-child {
  border-bottom: none;
}

.supervisor-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.supervisor-actions {
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

.empty-state {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-light);
  font-style: italic;
}

.add-supervisor {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.add-supervisor input, .edit-input {
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
</style>
