<template>
  <div class="tasks-view">
    <div class="top-header">
      <h1>Task Management</h1>
    </div>
    
    <div v-if="currentShift" class="task-summary-card">
      <div class="summary-header">
        <div class="shift-info">
          <div class="shift-badge" :class="currentShift.type.toLowerCase()">
            {{ currentShift.type }} Shift
          </div>
          <div class="shift-date">{{ formatDate(new Date(currentShift.date)) }}</div>
        </div>
        
        <button class="btn-outline btn-small btn-danger" @click="confirmEndShift">
          End Shift
        </button>
      </div>
      
      <div class="task-stats">
        <div class="stat-item" @click="navigateToPendingTasks">
          <div class="stat-icon pending">
            <span>{{ pendingTasks.length }}</span>
          </div>
          <div class="stat-label">Pending</div>
        </div>
        
        <div class="stat-item" @click="navigateToCompletedTasks">
          <div class="stat-icon completed">
            <span>{{ completedTasks.length }}</span>
          </div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
    </div>
    
    <div class="section-header">
      <h2>Task Categories</h2>
    </div>
    
    <div class="category-grid">
      <div 
        class="category-card pending"
        :class="{ active: pendingTasks.length > 0 }"
        @click="navigateToPendingTasks"
      >
        <div class="category-badge">{{ pendingTasks.length }}</div>
        <div class="category-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="category-title">Pending Tasks</div>
        <div class="category-description">
          Tasks waiting to be completed
        </div>
      </div>
      
      <div 
        class="category-card completed"
        :class="{ active: completedTasks.length > 0 }"
        @click="navigateToCompletedTasks"
      >
        <div class="category-badge">{{ completedTasks.length }}</div>
        <div class="category-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="category-title">Completed Tasks</div>
        <div class="category-description">
          Tasks that have been finished
        </div>
      </div>
    </div>
    
    <div v-if="pendingTasks.length > 0" class="recent-task-section">
      <div class="section-header">
        <h2>Recent Tasks</h2>
        <button class="view-all-link" @click="navigateToPendingTasks">View All</button>
      </div>
      
      <div class="task-list">
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
    
    <div v-else-if="isLoading && !currentShift" class="loading-state">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>
    
    <div v-else-if="currentShift && currentShift.tasks.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M12 11v6"></path>
          <path d="M9 18h6"></path>
        </svg>
      </div>
      <h3>No Tasks Yet</h3>
      <p>Create your first task to get started</p>
    </div>
    
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
    
    <TabNavigation current-route="tasks" @navigate="navigate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useShiftStore } from '../stores/shift'
import { formatDate } from '../utils/date'
import type { RouteParams } from '../types'
import TaskCard from '../components/TaskCard.vue'
import TabNavigation from '../components/TabNavigation.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// State
const showEndShiftConfirm = ref(false)

// Store
const shiftStore = useShiftStore()
const { currentShift, isLoading, pendingTasks, completedTasks, endShift } = shiftStore

// Computed
const recentPendingTasks = computed(() => {
  return pendingTasks.slice(0, 3)
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
</script>

<style scoped>
.tasks-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: var(--spacing-lg); /* Reduced padding since we removed bottom navigation */
}

.top-header {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
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
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

/* Task Summary Card */
.task-summary-card {
  margin: 0 var(--spacing-md) var(--spacing-md);
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.summary-header {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-light);
}

.shift-info {
  display: flex;
  flex-direction: column;
}

.shift-badge {
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: white;
  padding: 2px var(--spacing-sm);
  border-radius: var(--border-radius-pill);
  margin-bottom: 2px;
}

.shift-badge.day {
  background-color: var(--color-primary);
}

.shift-badge.night {
  background-color: var(--color-secondary);
}

.shift-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.task-stats {
  display: flex;
  padding: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  cursor: pointer;
}

.stat-item:after {
  content: "";
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background-color: var(--color-border-light);
}

.stat-item:last-child:after {
  display: none;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.stat-icon.pending {
  background-color: rgba(var(--color-pending-rgb), 0.1);
  color: var(--color-pending);
}

.stat-icon.completed {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

/* Section headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
}

.view-all-link {
  color: var(--color-primary);
  background: none;
  border: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
}

/* Category Cards */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.category-card {
  position: relative;
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.category-card:active {
  transform: scale(0.98);
  box-shadow: var(--box-shadow-sm);
}

.category-card.pending {
  border-top: 4px solid var(--color-pending);
}

.category-card.completed {
  border-top: 4px solid var(--color-success);
}

.category-badge {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: var(--color-text-light);
  color: white;
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-xs);
}

.category-card.pending.active .category-badge {
  background-color: var(--color-pending);
}

.category-card.completed.active .category-badge {
  background-color: var(--color-success);
}

.category-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: var(--spacing-md);
  background-color: var(--color-secondary-light);
  color: var(--color-text-secondary);
}

.category-card.pending.active .category-icon {
  background-color: rgba(var(--color-pending-rgb), 0.1);
  color: var(--color-pending);
}

.category-card.completed.active .category-icon {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.category-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.category-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Recent Tasks */
.recent-task-section {
  margin-bottom: var(--spacing-lg);
}

.task-list {
  padding: 0 var(--spacing-md);
}

.task-item {
  margin-bottom: var(--spacing-md);
}

/* Empty & Loading states */
.empty-state, .loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: calc(80px + var(--safe-area-inset-bottom));
  right: var(--spacing-md);
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--box-shadow-lg);
  border: none;
  cursor: pointer;
  z-index: 10;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.fab:active {
  transform: scale(0.95) translateY(2px);
  box-shadow: var(--box-shadow);
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

/* Tablet and larger screens */
@media (min-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
