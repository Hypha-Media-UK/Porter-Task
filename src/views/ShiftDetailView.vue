<template>
  <main class="shift-detail-view">
    <section v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading shift details...</p>
    </section>
    
    <section v-else-if="!shift" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>Shift Not Found</h3>
      <p>The shift you're looking for doesn't exist or has been deleted.</p>
      <button class="btn-primary" @click="navigateToArchive">
        Back to Archive
      </button>
    </section>
    
    <section v-else class="shift-details">
      <article class="shift-card">
        <header class="shift-header">
          <div class="shift-date">
            {{ formatDate(new Date(shift.date)) }}
          </div>
          <div class="shift-type" :class="shift.type.toLowerCase()">
            {{ shift.type }} Shift
          </div>
        </header>
        
        <div class="shift-actions">
          <button class="btn-primary btn-reopen-shift" @click="confirmReopenShift">
            Reopen Shift
          </button>
          <button class="btn-danger btn-delete-shift" @click="confirmDeleteShift">
            Delete Shift
          </button>
        </div>
        
        <div class="shift-info">
          <div class="info-row">
            <div class="info-item">
              <span class="label">Supervisor</span>
              <span class="value">{{ shift.supervisor }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Start Time</span>
              <span class="value">{{ formatTime(new Date(shift.startTime)) }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">End Time</span>
              <span class="value">{{ shift.endTime ? formatTime(new Date(shift.endTime)) : 'Ongoing' }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Duration</span>
              <span class="value">{{ formatDuration(shift.startTime, shift.endTime || '') }}</span>
            </div>
          </div>
        </div>
        
        <!-- Porters Management Section -->
        <div v-if="isOngoing" class="porters-section">
          <h3>Porters Assignment</h3>
          <p class="section-description">Assign porters to this shift to manage task assignments</p>
          
          <div class="porters-assignment">
            <div class="porter-selection">
              <select 
                v-model="selectedPorter" 
                class="form-control"
                :disabled="!availablePorters.length"
              >
                <option value="" disabled>Select porter</option>
                <option v-for="porter in availablePorters" :key="porter" :value="porter">
                  {{ porter }}
                </option>
              </select>
              <button 
                class="btn-primary" 
                @click="handleAddPorterToShift"
                :disabled="!selectedPorter"
              >
                Add Porter
              </button>
            </div>
            
            <div v-if="!assignedPorters.length" class="empty-porters">
              <p>No porters assigned to this shift yet.</p>
            </div>
            
            <div v-else class="assigned-porters">
              <h4>Assigned Porters:</h4>
              <div class="porter-tags">
                <div v-for="porter in assignedPorters" :key="porter" class="porter-tag">
                  <span class="porter-name">{{ porter }}</span>
                  <button class="remove-porter" @click="handleRemovePorterFromShift(porter)" title="Remove porter">
                    &times;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Porters for Completed Shifts -->
        <div v-else class="porters-section">
          <h3>Assigned Porters</h3>
          <div class="porter-actions">
            <button 
              class="btn-primary btn-sm"
              @click="showPorterManager = true"
            >
              Manage Porters
            </button>
          </div>
          
          <div v-if="showPorterManager" class="porters-assignment">
            <div class="porter-selection">
              <select 
                v-model="selectedPorter" 
                class="form-control"
                :disabled="!availablePorters.length"
              >
                <option value="" disabled>Select porter</option>
                <option v-for="porter in availablePorters" :key="porter" :value="porter">
                  {{ porter }}
                </option>
              </select>
              <button 
                class="btn-primary" 
                @click="handleAddPorterToShift"
                :disabled="!selectedPorter"
              >
                Add Porter
              </button>
            </div>
            
            <div v-if="!assignedPorters.length" class="empty-porters">
              <p>No porters assigned to this shift.</p>
            </div>
            
            <div v-else class="assigned-porters with-controls">
              <div class="porter-tags">
                <div v-for="porter in assignedPorters" :key="porter" class="porter-tag">
                  <span class="porter-name">{{ porter }}</span>
                  <button class="remove-porter" @click="handleRemovePorterFromShift(porter)" title="Remove porter">
                    &times;
                  </button>
                </div>
              </div>
            </div>
            
            <div class="porter-management-info">
              <p>Note: Modifying porters on a completed shift will temporarily reopen it.</p>
            </div>
          </div>
          
          <div v-else-if="assignedPorters.length" class="assigned-porters">
            <div class="porter-tags">
              <div v-for="porter in assignedPorters" :key="porter" class="porter-tag">
                <span class="porter-name">{{ porter }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-porters">
            <p>No porters were assigned to this shift.</p>
          </div>
        </div>
        
        <!-- Department Assignment Section -->
        <div v-if="assignedPorters && assignedPorters.length > 0" class="department-assignments-section">
          <h3>Department Assignments</h3>
          <p class="section-description">Assign porters to departments during the shift</p>
          <PorterAssignmentManager :key="refreshKey"/>
        </div>
        
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ shift.tasks.length }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ completedTasksCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ pendingTasksCount }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </article>
      
      <section class="tasks-section">
        <header class="tasks-header">
          <h2>Tasks</h2>
          
          <nav class="tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'all' }"
              @click="activeTab = 'all'"
            >
              All ({{ shift.tasks.length }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'completed' }"
              @click="activeTab = 'completed'"
            >
              Completed ({{ completedTasksCount }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'pending' }"
              @click="activeTab = 'pending'"
            >
              Pending ({{ pendingTasksCount }})
            </button>
          </nav>
        </header>
        
        <div v-if="filteredTasks.length === 0" class="empty-tasks">
          <p>No {{ activeTab === 'all' ? '' : activeTab }} tasks for this shift.</p>
        </div>
        
        <ul v-else class="tasks-list">
          <li 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-item"
          >
            <article class="shift-detail-task" @click="editTask(task.id)">
              <div class="task-status" :class="task.status.toLowerCase()"></div>
              <div class="task-info">
                <div class="task-header">
                  <div class="task-type">{{ task.jobCategory }} - {{ task.itemType }}</div>
                  <div class="task-time">{{ formatTime(new Date(task.receivedTime)) }}</div>
                </div>
                <div class="task-journey">
                  <span class="from-location">{{ task.fromLocation.displayName }}</span>
                  <span class="journey-arrow">→</span>
                  <span class="to-location">{{ task.toLocation.displayName }}</span>
                </div>
                <div v-if="task.status === 'Completed' && task.completedTime" class="task-completion">
                  Completed: {{ formatTime(new Date(task.completedTime)) }}
                </div>
              </div>
              <button class="edit-button" aria-label="Edit task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 1 2 2h14a2 2 0 0 1 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit</span>
              </button>
            </article>
          </li>
        </ul>
      </section>
    </section>
    
    <TabNavigation current-route="archive" @navigate="navigate" />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useShiftStore } from '../stores/shift'
import { useSettingsStore } from '../stores/settings'
import { formatDate, formatTime, formatDuration } from '../utils/date'
import type { RouteParams, Shift, Task } from '../types'
import TaskCard from '../components/TaskCard.vue'
import TabNavigation from '../components/TabNavigation.vue'
import PorterAssignmentManager from '../components/porter/PorterAssignmentManager.vue'

// Props
const props = defineProps<{
  shiftId?: string;
}>()

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Stores
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore() // Added to get the list of porters

const { getShift, isLoading, deleteShift, reopenShift, addPorterToShift, removePorterFromShift } = shiftStore
const { porters: allPorters } = settingsStore

// For delete confirmation
const showDeleteConfirm = ref(false)

// Porter management
const selectedPorter = ref('')
const showPorterManager = ref(false)

// State
const shift = ref<Shift | null>(null)
const activeTab = ref<'all' | 'completed' | 'pending'>('all')
const refreshKey = ref(0) // Key for forcing component refresh

// Load shift data
const loadShift = async () => {
  if (!props.shiftId) return
  
  try {
    const shiftData = await getShift(props.shiftId)
    shift.value = shiftData || null
  } catch (error) {
    console.error('Error loading shift details:', error)
    shift.value = null
  }
}

// Computed
const completedTasksCount = computed(() => {
  if (!shift.value) return 0
  return shift.value.tasks.filter(task => task.status === 'Completed').length
})

const pendingTasksCount = computed(() => {
  if (!shift.value) return 0
  return shift.value.tasks.filter(task => task.status === 'Pending').length
})

const filteredTasks = computed(() => {
  if (!shift.value) return []
  
  if (activeTab.value === 'all') {
    return [...shift.value.tasks].sort((a, b) => {
      return new Date(b.receivedTime).getTime() - new Date(a.receivedTime).getTime()
    })
  } else if (activeTab.value === 'completed') {
    return shift.value.tasks
      .filter(task => task.status === 'Completed')
      .sort((a, b) => {
        const aTime = a.completedTime ? new Date(a.completedTime).getTime() : 0
        const bTime = b.completedTime ? new Date(b.completedTime).getTime() : 0
        return bTime - aTime
      })
  } else {
    return shift.value.tasks
      .filter(task => task.status === 'Pending')
      .sort((a, b) => {
        return new Date(b.receivedTime).getTime() - new Date(a.receivedTime).getTime()
      })
  }
})

// Porter management computed properties
const assignedPorters = computed(() => {
  if (!shift.value || !shift.value.assignedPorters) return []
  return shift.value.assignedPorters
})

const availablePorters = computed(() => {
  // Filter out porters that are already assigned
  return allPorters.filter(porter => !assignedPorters.value.includes(porter))
})

const isOngoing = computed(() => {
  return shift.value && !shift.value.endTime
})

// Methods
const navigateToArchive = () => {
  if (navigate) navigate('archive')
}

const confirmDeleteShift = () => {
  if (!shift.value || !props.shiftId) return
  
  if (confirm(`Are you sure you want to delete this shift from ${formatDate(new Date(shift.value.date))}?`)) {
    deleteShift(props.shiftId)
    navigateToArchive()
  }
}

// Force UI refresh after adding/removing porters
const refreshShift = async () => {
  if (!props.shiftId) return
  
  const shiftData = await getShift(props.shiftId)
  shift.value = shiftData || null
  console.log('Shift refreshed:', shift.value)
}

const confirmReopenShift = () => {
  if (!shift.value || !props.shiftId) return
  
  try {
    if (confirm(`Are you sure you want to reopen this shift from ${formatDate(new Date(shift.value.date))}?`)) {
      reopenShift(props.shiftId)
      
      // Navigate to home screen to show reopened shift
      if (navigate) navigate('home')
    }
  } catch (error) {
    // Handle case where another shift is already active
    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Could not reopen shift. Another shift might be active.')
    }
  }
}

const editTask = (taskId: string) => {
  if (navigate) navigate('taskForm', { taskId: taskId })
}

// Porter management methods
const handleAddPorterToShift = async () => {
  if (!selectedPorter.value || !shift.value) return
  
  try {
    // First reopen the shift to make it the current active shift
    if (!isOngoing.value) {
      if (!confirm(`This will reopen the shift from ${formatDate(new Date(shift.value.date))}. Continue?`)) {
        return
      }
      
      reopenShift(props.shiftId || '')
    }
    
    // Add the porter to the current shift
    addPorterToShift(selectedPorter.value)
    
    // Reset selection after adding
    selectedPorter.value = ''
    
    // Refresh the shift data
    await refreshShift()
    
    // Increment refreshKey to force component refresh
    refreshKey.value++
    
    // Increment refreshKey to force component refresh
    refreshKey.value++
  } catch (error) {
    console.error('Error adding porter:', error)
    alert('Failed to add porter: ' + (error instanceof Error ? error.message : String(error)))
  }
}

const handleRemovePorterFromShift = async (porter: string) => {
  if (!shift.value) return
  
  try {
    // First reopen the shift to make it the current active shift
    if (!isOngoing.value) {
      if (!confirm(`This will reopen the shift from ${formatDate(new Date(shift.value.date))}. Continue?`)) {
        return
      }
      
      reopenShift(props.shiftId || '')
    }
    
    // Remove the porter from the current shift
    removePorterFromShift(porter)
    
    // Refresh the shift data
    await refreshShift()
    
    // Increment refreshKey to force component refresh
    refreshKey.value++
  } catch (error) {
    console.error('Error removing porter:', error)
    alert('Failed to remove porter: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Initialize
onMounted(loadShift)

// Watch for changes to shiftId
watch(() => props.shiftId, loadShift)
</script>

<style scoped>
.shift-detail-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--spacing-md);
  padding-bottom: calc(70px + var(--safe-area-inset-bottom));
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.shift-card {
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-lg);
  overflow: hidden;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.shift-date {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.shift-type {
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-pill);
  background-color: var(--color-primary);
  color: white;
}

.shift-type.day {
  background-color: var(--color-primary);
}

.shift-type.night {
  background-color: var(--color-primary-dark);
}

.shift-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  justify-content: flex-end;
  border-bottom: 1px solid var(--color-border-light);
}

.btn-reopen-shift, .btn-delete-shift {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  color: white;
  transition: background-color var(--transition-fast);
}

.btn-reopen-shift {
  background-color: var(--color-primary);
}

.btn-reopen-shift:hover {
  background-color: var(--color-primary-dark);
}

.btn-delete-shift {
  background-color: var(--color-danger);
}

.btn-delete-shift:hover {
  background-color: var(--color-danger-dark, #c82333);
}

.shift-info {
  padding: var(--spacing-md);
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.value {
  font-weight: var(--font-weight-medium);
}

/* Porter Management Styles */
.porters-section, .department-assignments-section {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin: var(--spacing-md);
  border: 1px solid var(--color-border-light);
}

.porter-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-md);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.with-controls {
  margin-top: var(--spacing-md);
}

.porter-management-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: #fff8e1;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  color: #856404;
}

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.porter-selection {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.porter-selection select {
  flex: 1;
}

.porter-selection button {
  white-space: nowrap;
}

.empty-porters {
  background-color: var(--color-secondary-light);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  text-align: center;
  color: var(--color-text-secondary);
}

.porter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.porter-tag {
  display: flex;
  align-items: center;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-pill);
}

.remove-porter {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-md);
  line-height: 1;
  padding: 0 0 0 var(--spacing-xs);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--color-border-light);
  text-align: center;
  padding: var(--spacing-md) 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-top: var(--spacing-xs);
}

.tasks-section {
  margin-top: var(--spacing-lg);
}

.tasks-header {
  margin-bottom: var(--spacing-md);
}

.tasks-header h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-sm);
}

.tabs {
  display: flex;
  gap: var(--spacing-xs);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.tab-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.tab-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.empty-tasks {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-light);
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  transition: transform var(--transition-fast);
}

.task-item:hover {
  transform: translateY(-2px);
}

/* Custom task card styling for shift detail view */
.shift-detail-task {
  display: flex;
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: white;
  cursor: pointer;
  position: relative;
}

.task-status {
  width: 4px;
  background-color: var(--color-border);
}

.task-status.pending {
  background-color: var(--color-pending);
}

.task-status.completed {
  background-color: var(--color-success);
}

.task-info {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
}

.edit-button {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-md);
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  gap: var(--spacing-xs);
}

.edit-button span {
  display: none;
}

.shift-detail-task:hover .edit-button {
  background-color: rgba(var(--color-primary-rgb), 0.05);
  border-radius: var(--border-radius);
  padding: var(--spacing-xs) var(--spacing-md);
}

.shift-detail-task:hover .edit-button span {
  display: inline;
}

/* Add a subtle indicator that items are clickable */
.shift-detail-task::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  pointer-events: none;
  transition: background-color var(--transition-fast);
}

.shift-detail-task:hover::after {
  background-color: rgba(0, 0, 0, 0.02);
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.task-type {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.task-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.task-journey {
  display: flex;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  align-items: center;
}

.from-location {
  color: var(--color-primary);
}

.to-location {
  color: var(--color-success);
}

.journey-arrow {
  color: var(--color-text-light);
  font-size: 14px;
}

.task-completion {
  font-size: var(--font-size-xs);
  color: var(--color-success);
  font-style: italic;
}

/* Empty and loading states */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-2xl) 0;
  flex: 1;
  color: var(--color-text-light);
}

.empty-icon, .spinner {
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  max-width: 300px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
