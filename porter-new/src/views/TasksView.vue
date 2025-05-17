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
              <div class="task-time">{{ task.receivedTime }}</div>
            </div>
            <div class="task-journey">
              <span class="from-location">{{ task.fromLocation }}</span>
              <span class="journey-arrow">→</span>
              <span class="to-location">{{ task.toLocation }}</span>
            </div>
            <div class="task-footer">
              <span v-if="task.allocatedStaff" class="allocated-staff">
                Assigned to: {{ task.allocatedStaff }}
              </span>
              <span v-if="task.status === 'Completed'" class="completion-time">
                Completed at: {{ task.completedTime }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Placeholder data (will come from stores)
const isLoading = ref(false)
const activeTab = ref('pending')

// Placeholder tasks
const tasks = ref([
  {
    id: '1',
    jobCategory: 'Patient Transport',
    itemType: 'Wheelchair',
    fromLocation: 'Ward A1',
    toLocation: 'X-Ray Department',
    status: 'Pending',
    receivedTime: '09:30',
    allocatedTime: '09:35',
    allocatedStaff: 'John Porter'
  },
  {
    id: '2',
    jobCategory: 'Specimen Delivery',
    itemType: 'Blood Sample',
    fromLocation: 'Ward B2',
    toLocation: 'Pathology',
    status: 'Completed',
    receivedTime: '10:15',
    allocatedTime: '10:20',
    completedTime: '10:45',
    allocatedStaff: 'Sarah Porter'
  }
])

// Computed properties
const pendingTasksCount = computed(() => {
  return tasks.value.filter(task => task.status === 'Pending').length
})

const completedTasksCount = computed(() => {
  return tasks.value.filter(task => task.status === 'Completed').length
})

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    if (activeTab.value === 'pending') {
      return task.status === 'Pending'
    } else {
      return task.status === 'Completed'
    }
  })
})

// Methods
const openNewTaskForm = () => {
  router.push('/task-form')
}

const editTask = (taskId: string) => {
  router.push(`/task-form/${taskId}`)
}
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
