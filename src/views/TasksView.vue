<template>
  <main class="tasks-view">
    <header class="page-header">
      <h1>Shift Management</h1>
    </header>
    
    <section v-if="currentShift" class="shift-dashboard">
      <!-- Shift Overview Card -->
      <div class="dashboard-card shift-overview">
        <div class="card-header">
          <div class="title-area">
            <h2 :class="currentShift.type.toLowerCase() + '-text'">{{ currentShift.type }} Shift</h2>
          </div>
          <button class="btn-danger" @click="confirmEndShift">
            End Shift
          </button>
        </div>
        
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Date</span>
              <span class="info-value">{{ formatDate(new Date(currentShift.date)) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Start Time</span>
              <span class="info-value">{{ formatTime(new Date(currentShift.startTime)) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Supervisor</span>
              <span class="info-value">{{ currentShift.supervisor }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'tasks' }" 
            @click="activeTab = 'tasks'"
          >
            Tasks
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'porters' }" 
            @click="activeTab = 'porters'"
          >
            Porters
          </button>
        </div>
      </div>
      
      <!-- Tasks Tab Content -->
      <div v-if="activeTab === 'tasks'" class="tab-content-container">
        <!-- Task Statistics Card -->
        <div class="dashboard-card stats-card">
          <div class="card-header">
            <div class="title-area">
              <h2>Task Statistics</h2>
            </div>
          </div>
          
          <div class="card-content">
            <div class="stats-grid">
              <div class="stat-box" @click="navigateToPendingTasks">
                <div class="stat-header">
                  <span class="stat-label">Pending Tasks</span>
                  <span class="stat-indicator pending"></span>
                </div>
                <div class="stat-value">{{ pendingTasks.length }}</div>
                <div class="stat-action">View &rarr;</div>
              </div>
              
              <div class="stat-box" @click="navigateToCompletedTasks">
                <div class="stat-header">
                  <span class="stat-label">Completed Tasks</span>
                  <span class="stat-indicator completed"></span>
                </div>
                <div class="stat-value">{{ completedTasks.length }}</div>
                <div class="stat-action">View &rarr;</div>
              </div>
              
              <div class="stat-box total">
                <div class="stat-header">
                  <span class="stat-label">Total Tasks</span>
                  <span class="stat-indicator total"></span>
                </div>
                <div class="stat-value">{{ currentShift.tasks.length }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Tasks Card -->
        <div v-if="pendingTasks.length > 0" class="dashboard-card tasks-card">
          <div class="card-header">
            <div class="title-area">
              <h2>Recent Tasks</h2>
            </div>
            <button class="btn-text" @click="navigateToPendingTasks">View All</button>
          </div>
          
          <div class="card-content">
            <div class="tasks-list">
              <div 
                v-for="task in recentPendingTasks" 
                :key="task.id"
                class="task-item"
                @click="viewTaskDetail(task.id)"
              >
                <TaskCard :task="task" :compact="true" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="currentShift.tasks.length === 0" class="dashboard-card empty-card">
          <div class="card-content centered">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <path d="M12 11v6"></path>
                <path d="M9 18h6"></path>
              </svg>
            </div>
            <h3>No Tasks Yet</h3>
            <p>Click the + button to create your first task</p>
          </div>
        </div>
      </div>
      
      <!-- Porters Tab Content -->
      <div v-else-if="activeTab === 'porters'" class="tab-content-container">
        <div class="dashboard-card porters-card">
          <div class="card-header">
            <div class="title-area">
              <h2>Porters Management</h2>
            </div>
            <button 
              v-if="!showPorterManager" 
              class="btn-primary"
              @click="showPorterManager = true"
            >
              Add Porter
            </button>
            <button 
              v-else 
              class="btn-secondary"
              @click="showPorterManager = false"
            >
              Done
            </button>
          </div>
          
          <div v-if="showPorterManager" class="porter-manager">
            <div class="porter-selection">
              <select 
                v-model="selectedPorter" 
                class="form-control"
                :disabled="!availablePorters.length"
              >
                <option value="" disabled>Select porter to add</option>
                <option v-for="porter in availablePorters" :key="porter" :value="porter">
                  {{ porter }}
                </option>
              </select>
              <button 
                class="btn-primary" 
                @click="handleAddPorterToShift"
                :disabled="!selectedPorter"
              >
                Add
              </button>
            </div>
          </div>
          
          <div class="card-content">
            <div v-if="assignedPorters.length === 0" class="empty-state">
              <p>No porters assigned to this shift.</p>
              <button v-if="!showPorterManager" class="btn-outline" @click="showPorterManager = true">Assign Porters</button>
            </div>
            
            <div v-else class="porter-list">
              <div v-for="porter in assignedPorters" :key="porter" class="porter-item">
                <div class="porter-avatar">{{ porter.charAt(0) }}</div>
                <span class="porter-name">{{ porter }}</span>
                <button 
                  class="btn-icon remove-porter" 
                  @click="handleRemovePorterFromShift(porter)" 
                  title="Remove porter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Loading State -->
    <section v-else-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading shift data...</p>
    </section>
    
    <!-- Floating Action Button for creating a new task -->
    <button class="fab" @click="navigateToTaskForm" aria-label="Create new task">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
    
    <!-- End Shift Confirmation Modal -->
    <div v-if="showEndShiftConfirm" class="modal-backdrop" @click.self="showEndShiftConfirm = false">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h3>End Shift?</h3>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to end the current shift? This action cannot be undone.</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn-secondary" @click="showEndShiftConfirm = false">
            Cancel
          </button>
          <button class="btn-danger" @click="endCurrentShift">
            End Shift
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useShiftStore } from '../stores/shift'
import { useSettingsStore } from '../stores/settings'
import { formatDate, formatTime } from '../utils/date'
import type { RouteParams } from '../types'
import TaskCard from '../components/TaskCard.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// State
const showEndShiftConfirm = ref(false)
const showPorterManager = ref(false)
const selectedPorter = ref('')
const activeTab = ref('tasks') // Default tab

// Stores
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()
const { isLoading, pendingTasks, completedTasks, endShift, addPorterToShift, removePorterFromShift } = shiftStore
const currentShift = shiftStore.currentShift
const { porters: allPorters } = settingsStore

// Computed
const recentPendingTasks = computed(() => {
  return pendingTasks.slice(0, 3)
})

// Porter management computed properties
const assignedPorters = computed(() => {
  if (!currentShift || !currentShift.assignedPorters) return []
  return currentShift.assignedPorters
})

const availablePorters = computed(() => {
  // Filter out porters that are already assigned
  return allPorters.filter(porter => !assignedPorters.value.includes(porter))
})

// Methods
const navigateToTaskForm = () => {
  if (navigate) navigate('taskForm')
}

const navigateToPendingTasks = () => {
  if (navigate) navigate('pendingTasks')
}

const navigateToCompletedTasks = () => {
  if (navigate) navigate('completedTasks')
}

const viewTaskDetail = (taskId: string) => {
  if (navigate) navigate('taskForm', { taskId })
}

const confirmEndShift = () => {
  showEndShiftConfirm.value = true
}

const endCurrentShift = () => {
  endShift()
  showEndShiftConfirm.value = false
  
  // Navigate to home screen after ending shift
  if (navigate) navigate('home')
}

// Porter management methods
const handleAddPorterToShift = () => {
  if (!selectedPorter.value) return
  
  try {
    // Add the porter to the current shift
    addPorterToShift(selectedPorter.value)
    
    // Reset selection after adding
    selectedPorter.value = ''
  } catch (error) {
    console.error('Error adding porter:', error)
    alert('Failed to add porter: ' + (error instanceof Error ? error.message : String(error)))
  }
}

const handleRemovePorterFromShift = (porter: string) => {
  try {
    // Remove the porter from the current shift
    removePorterFromShift(porter)
  } catch (error) {
    console.error('Error removing porter:', error)
    alert('Failed to remove porter: ' + (error instanceof Error ? error.message : String(error)))
  }
}
</script>

<style scoped>
.tasks-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--spacing-md);
  padding-bottom: var(--spacing-xl);
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

/* Dashboard Layout */
.shift-dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .shift-dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .shift-overview, .tabs-container {
    grid-column: 1 / 3;
  }
  
  .porters-card {
    grid-column: span 1;
  }
  
  .stats-card {
    grid-column: 1 / 3;
  }
  
  .tasks-card, .empty-card {
    grid-column: 1 / 3;
  }
}

/* Card Styles */
.dashboard-card {
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-card);
}

.title-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-content {
  padding: var(--spacing-md);
}

.card-content.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xl);
}

/* Shift Badge */
.shift-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: white;
  padding: 2px var(--spacing-sm);
  border-radius: var(--border-radius-pill);
  text-transform: uppercase;
}

.shift-badge.day {
  background-color: var(--color-primary);
}

.shift-badge.night {
  background-color: var(--color-secondary);
}

.day-text {
  color: var(--color-primary);
}

.night-text {
  color: var(--color-secondary);
}

/* Tabs Container */
.tabs-container {
  margin-bottom: var(--spacing-md);
  grid-column: 1 / -1;
}

.tab-content-container {
  display: contents; /* This makes children appear as direct children of the grid parent */
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-xs);
}

.tab {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: none;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  position: relative;
}

.tab.active {
  color: var(--color-primary);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: var(--border-radius-pill);
}

.tab:hover:not(.active) {
  color: var(--color-text);
  background-color: rgba(0, 0, 0, 0.03);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.info-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

/* Porter Management */
.porter-manager {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-card-alt, #f9f9f9);
}

.porter-selection {
  display: flex;
  gap: var(--spacing-sm);
}

.porter-selection select {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.porter-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.porter-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  background-color: var(--color-card-alt, #f9f9f9);
}

.porter-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  margin-right: var(--spacing-sm);
}

.porter-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.stat-box {
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  background-color: var(--color-card-alt, #f9f9f9);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform var(--transition-fast);
  min-height: 120px;
}

.stat-box:hover {
  transform: translateY(-2px);
}

.stat-box.total {
  cursor: default;
}

.stat-box.total:hover {
  transform: none;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.stat-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.stat-indicator.pending {
  background-color: var(--color-pending);
}

.stat-indicator.completed {
  background-color: var(--color-success);
}

.stat-indicator.total {
  background-color: var(--color-primary);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-top: auto;
  margin-bottom: var(--spacing-sm);
}

.stat-action {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  margin-top: auto;
}

/* Tasks List */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-item {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.task-item:hover {
  transform: translateY(-2px);
}

/* Button Styles */
.btn-primary, .btn-secondary, .btn-danger, .btn-outline {
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

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-dark);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}

.btn-outline {
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.btn-text:hover {
  text-decoration: underline;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-text-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.empty-icon {
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) 0;
  text-align: center;
  color: var(--color-text-light);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: var(--spacing-lg);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-md);
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  z-index: 10;
  transition: transform var(--transition-fast);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.fab:hover {
  transform: scale(1.05);
}

.fab:active {
  transform: scale(0.95);
}

/* Modal styles - iOS style */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: var(--z-index-modal);
  animation: fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-content {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  padding-bottom: max(var(--spacing-md), var(--safe-area-inset-bottom));
}

.modal-handle {
  width: 36px;
  height: 5px;
  background-color: var(--color-border);
  border-radius: 3px;
  margin: var(--spacing-sm) auto;
}

.modal-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-body p {
  margin: 0;
  text-align: center;
}

.modal-actions {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
}

.modal-actions button {
  flex: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(50px);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
