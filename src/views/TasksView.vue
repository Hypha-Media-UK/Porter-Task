<template>
  <div class="tasks-view">
    <div class="task-summary">
      <div v-if="currentShift" class="shift-info">
        <div class="shift-meta">
          <span>{{ currentShift.type }} Shift</span>
          <span>{{ formatDate(new Date(currentShift.date)) }}</span>
        </div>
        
        <div class="tasks-count">
          <div class="count-item">
            <div class="count-label">Pending</div>
            <div class="count-value">{{ pendingTasks.length }}</div>
          </div>
          <div class="count-item">
            <div class="count-label">Completed</div>
            <div class="count-value">{{ completedTasks.length }}</div>
          </div>
        </div>
      </div>
      
      <div class="shift-actions">
        <button class="btn-secondary btn-end-shift" @click="confirmEndShift">
          End Shift
        </button>
      </div>
      
      <button class="btn-primary new-task-btn" @click="navigateToTaskForm">
        <span class="plus-icon">+</span>
        New Task
      </button>
    </div>
    
    <div class="task-nav">
      <div 
        class="nav-item pending"
        :class="{ active: pendingTasks.length > 0 }"
        @click="navigateToPendingTasks"
      >
        <div class="nav-icon">
          <div class="badge">{{ pendingTasks.length }}</div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </div>
        <div class="nav-label">Pending Tasks</div>
        <div class="chevron">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
      
      <div 
        class="nav-item completed"
        :class="{ active: completedTasks.length > 0 }"
        @click="navigateToCompletedTasks"
      >
        <div class="nav-icon">
          <div class="badge">{{ completedTasks.length }}</div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="nav-label">Completed Tasks</div>
        <div class="chevron">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="recent-tasks" v-if="pendingTasks.length > 0">
      <h2>Recent Tasks</h2>
      
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
    
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M12 11v6"></path>
          <path d="M9 18h6"></path>
        </svg>
      </div>
      <h3>No Tasks</h3>
      <p>There are no pending tasks. Create a new task to get started.</p>
      <button class="btn-primary" @click="navigateToTaskForm">
        Create New Task
      </button>
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
  if (confirm('Are you sure you want to end the current shift?')) {
    endShift()
    
    // Navigate to home screen after ending shift
    if (navigate) navigate('home')
  }
}
</script>

<style scoped>
.tasks-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 70px; /* Space for tab navigation */
}

.task-summary {
  padding: var(--spacing-md);
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.shift-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-primary-light, #e6f4ff);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.shift-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.shift-meta span:first-child {
  font-weight: var(--font-weight-semibold);
}

.shift-meta span:last-child {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.tasks-count {
  display: flex;
  gap: var(--spacing-md);
}

.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.count-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.count-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.count-item:first-child .count-value {
  color: var(--color-pending);
}

.count-item:last-child .count-value {
  color: var(--color-success);
}

.shift-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-end-shift {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-text-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-end-shift:hover {
  background-color: var(--color-text);
}

.new-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.plus-icon {
  font-size: 1.2em;
  font-weight: var(--font-weight-bold);
}

.task-nav {
  display: flex;
  flex-direction: column;
  background-color: white;
  margin-top: var(--spacing-md);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.nav-icon {
  position: relative;
  margin-right: var(--spacing-md);
  color: var(--color-text-secondary);
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--color-text-secondary);
  color: white;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  height: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0 4px;
}

.nav-item.pending.active .nav-icon {
  color: var(--color-pending);
}

.nav-item.pending.active .badge {
  background-color: var(--color-pending);
}

.nav-item.completed.active .nav-icon {
  color: var(--color-success);
}

.nav-item.completed.active .badge {
  background-color: var(--color-success);
}

.nav-label {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.chevron {
  color: var(--color-text-light);
}

.recent-tasks {
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.recent-tasks h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.task-item {
  cursor: pointer;
}

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-md);
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

@media (min-width: 768px) {
  .tasks-view {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
