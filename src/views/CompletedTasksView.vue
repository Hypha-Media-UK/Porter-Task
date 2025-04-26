<template>
  <div class="completed-tasks-view">
    <div class="tasks-header">
      <h1>Completed Tasks</h1>
      
      <div v-if="completedTasks.length > 0" class="tasks-count">
        {{ completedTasks.length }} {{ completedTasks.length === 1 ? 'task' : 'tasks' }}
      </div>
    </div>
    
    <div class="content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading tasks...</p>
      </div>
      
      <div v-else-if="completedTasks.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3>No Completed Tasks</h3>
        <p>There are no completed tasks for this shift yet.</p>
        <button class="btn-primary" @click="navigateToPendingTasks">
          View Pending Tasks
        </button>
      </div>
      
      <div v-else class="tasks-list">
        <div 
          v-for="task in completedTasks" 
          :key="task.id" 
          class="task-item"
          @click="viewTaskDetail(task.id)"
        >
          <TaskCard :task="task" />
        </div>
      </div>
    </div>
    
    <TabNavigation current-route="tasks" @navigate="navigate" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useShiftStore } from '../stores/shift'
import type { RouteParams } from '../types'
import TaskCard from '../components/TaskCard.vue'
import TabNavigation from '../components/TabNavigation.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Store
const shiftStore = useShiftStore()
const { completedTasks, isLoading } = shiftStore

// Methods
const viewTaskDetail = (taskId: string) => {
  if (navigate) navigate('taskForm', { taskId })
}

const navigateToPendingTasks = () => {
  if (navigate) navigate('pendingTasks')
}
</script>

<style scoped>
.completed-tasks-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 70px; /* Space for tab navigation */
}

.tasks-header {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.tasks-count {
  background-color: var(--color-success);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-pill);
}

.content {
  flex: 1;
  padding: 0 var(--spacing-md);
  overflow-y: auto;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-xl);
}

/* Empty and loading states */
.loading-state, .empty-state {
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
  .completed-tasks-view {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
