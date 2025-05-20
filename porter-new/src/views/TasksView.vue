<template>
  <div class="tasks-view">
    <header class="tasks-header">
      <h1>Shift Tasks</h1>
      <button class="btn-primary" @click="openNewTaskForm">New Task</button>
    </header>
    
    <div class="tasks-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        Pending Tasks <span class="count">({{ pendingTasksCount }})</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        Completed Tasks <span class="count">({{ completedTasksCount }})</span>
      </button>
    </div>
    
    <div class="tasks-list">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading tasks...</p>
      </div>
      
      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <p>No {{ activeTab }} tasks found.</p>
        <button v-if="activeTab === 'pending'" class="btn-secondary" @click="openNewTaskForm">
          Create First Task
        </button>
      </div>
      
      <div v-else class="task-cards">
        <!-- Task cards will be displayed here -->
        <div 
          v-for="task in filteredTasks" 
          :key="task.id"
          class="task-card"
          @click="editTask(task.id)"
        >
          <div class="task-status" :class="task.status.toLowerCase()"></div>
          <div class="task-info">
            <div class="task-header">
              <div class="task-type">{{ task.jobCategory }} - {{ task.itemType }}</div>
              <div class="task-time">{{ formatDateTime(task.receivedTime) }}</div>
            </div>
            <div class="task-journey">
              <span class="from-location">{{ task.fromLocation.displayName }}</span>
              <span class="journey-arrow">→</span>
              <span class="to-location">{{ task.toLocation.displayName }}</span>
            </div>
            <div class="task-footer">
              <span v-if="task.allocatedStaff" class="allocated-staff">
                Assigned to: {{ task.allocatedStaff }}
              </span>
              <span v-if="task.status === 'Completed'" class="completion-time">
                Completed at: {{ formatDateTime(task.completedTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useShiftStore } from '@/stores/shiftStore'
import type { Task } from '@/types'

// Router
const router = useRouter()

// Stores
const taskStore = useTaskStore()
const shiftStore = useShiftStore()

// State
const activeTab = ref('pending')
const error = ref<string | null>(null)

// Computed properties
const isLoading = computed(() => taskStore.isLoading)

const pendingTasksCount = computed(() => {
  return taskStore.pendingTasks.length
})

const completedTasksCount = computed(() => {
  return taskStore.completedTasks.length
})

const filteredTasks = computed(() => {
  return activeTab.value === 'pending' ? taskStore.pendingTasks : taskStore.completedTasks
})

// Methods
const openNewTaskForm = () => {
  if (!shiftStore.currentShift) {
    alert('You must start a shift before creating tasks')
    return
  }
  
  router.push('/task-form')
}

const editTask = (taskId: string) => {
  router.push(`/task-form/${taskId}`)
}

function formatDateTime(isoString: string | undefined): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// Load tasks on component mount
onMounted(async () => {
  // Load shift data if not already loaded
  if (!shiftStore.currentShift) {
    await shiftStore.loadShiftData()
  }
  
  // Load tasks for the current shift
  if (shiftStore.currentShift) {
    await taskStore.loadTasks(shiftStore.currentShift.id)
  }
})

// When the current shift changes, reload tasks
watch(() => shiftStore.currentShift, async (newShift) => {
  if (newShift) {
    await taskStore.loadTasks(newShift.id)
  } else {
    // Clear tasks if no shift is active
    taskStore.tasks = []
  }
})
</script>

<style scoped>
.tasks-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  font-size: 24px;
  margin: 0;
}

.tasks-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background-color: #0066cc;
  color: white;
  border-color: #0066cc;
}

.count {
  font-size: 0.85em;
  opacity: 0.8;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 102, 204, 0.2);
  border-top-color: #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
}

.task-status {
  width: 4px;
}

.task-status.pending {
  background-color: #ffc107;
}

.task-status.completed {
  background-color: #28a745;
}

.task-info {
  flex: 1;
  padding: 0.75rem;
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.task-type {
  font-weight: bold;
}

.task-time {
  color: #666;
  font-size: 0.875rem;
}

.task-journey {
  margin-bottom: 0.5rem;
}

.from-location {
  color: #0066cc;
}

.to-location {
  color: #28a745;
}

.journey-arrow {
  margin: 0 0.5rem;
  color: #666;
}

.task-footer {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  justify-content: space-between;
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
