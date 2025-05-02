<template>
  <main class="pending-tasks-view">
    <header class="tasks-header">
      <div class="header-left">
        <button class="back-button" @click="goBack" aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>Pending Tasks</h1>
      </div>
      
      <div v-if="pendingTasks.length > 0" class="tasks-count">
        {{ pendingTasks.length }} {{ pendingTasks.length === 1 ? 'task' : 'tasks' }}
      </div>
    </header>
    
    <section v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </section>
    
    <section v-else-if="pendingTasks.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M12 11v6"></path>
          <path d="M9 18h6"></path>
        </svg>
      </div>
      <h3>No Pending Tasks</h3>
      <p>There are no tasks awaiting completion.</p>
      <button class="btn-primary" @click="navigateToTaskForm">
        Create New Task
      </button>
    </section>
    
    <ul v-else class="tasks-list">
      <li v-for="task in pendingTasks" :key="task.id" class="task-item">
        <TaskCard 
          :task="task" 
          @complete="completeTask"
          @update="viewTaskDetail"
          @click="viewTaskDetail(task.id)"
        />
      </li>
    </ul>
    
    <div class="tasks-actions">
      <button class="btn-primary" @click="navigateToTaskForm">
        <span class="plus-icon">+</span>
        New Task
      </button>
    </div>
    
    <!-- Removed TabNavigation as all navigation items are in header -->
  </main>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useShiftStore } from '../stores/shift'
import type { RouteParams } from '../types'
import TaskCard from '../components/TaskCard.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Store
const shiftStore = useShiftStore()
const { pendingTasks, isLoading, updateTaskStatus } = shiftStore

// Methods
const goBack = () => {
  if (navigate) navigate('tasks');
}

const completeTask = (taskId: string) => {
  updateTaskStatus(taskId, 'Completed')
}

const viewTaskDetail = (taskId: string) => {
  if (navigate) navigate('taskForm', { taskId })
}

const navigateToTaskForm = () => {
  if (navigate) navigate('taskForm')
}
</script>

<style scoped>
.pending-tasks-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.back-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--color-text);
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.tasks-count {
  background-color: var(--color-pending);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-pill);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-xl);
  list-style: none;
  padding-left: 0;
  margin: 0;
  flex: 1;
}

.tasks-actions {
  padding: var(--spacing-md);
  margin: 0 calc(-1 * var(--spacing-md));
  border-top: 1px solid var(--color-border-light);
  background-color: white;
}

.plus-icon {
  font-size: 1.2em;
  font-weight: var(--font-weight-bold);
  margin-right: var(--spacing-xs);
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
