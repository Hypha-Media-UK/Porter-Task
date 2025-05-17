<template>
  <div class="shift-detail-view">
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
      <button class="btn-primary" @click="backToArchive">
        Back to Archive
      </button>
    </section>
    
    <section v-else class="shift-details">
      <article class="shift-card">
        <header class="shift-header">
          <div class="shift-date">{{ shift.date }}</div>
          <div class="shift-type" :class="shift.type.toLowerCase()">
            {{ shift.type }} Shift
          </div>
        </header>
        
        <div class="shift-actions">
          <button class="btn-primary btn-reopen-shift" @click="reopenShift">
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
              <span class="value">{{ shift.startTime }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">End Time</span>
              <span class="value">{{ shift.endTime }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Duration</span>
              <span class="value">{{ shift.duration }}</span>
            </div>
          </div>
        </div>
        
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ shift.tasksCount }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ shift.completedTasksCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ shift.pendingTasksCount }}</div>
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
              All ({{ shift.tasksCount }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'completed' }"
              @click="activeTab = 'completed'"
            >
              Completed ({{ shift.completedTasksCount }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'pending' }"
              @click="activeTab = 'pending'"
            >
              Pending ({{ shift.pendingTasksCount }})
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
                  <div class="task-time">{{ task.receivedTime }}</div>
                </div>
                <div class="task-journey">
                  <span class="from-location">{{ task.fromLocation }}</span>
                  <span class="journey-arrow">→</span>
                  <span class="to-location">{{ task.toLocation }}</span>
                </div>
                <div v-if="task.status === 'Completed' && task.completedTime" class="task-completion">
                  Completed: {{ task.completedTime }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Router
const router = useRouter()
const route = useRoute()

// Props
const props = defineProps<{
  shiftId?: string;
}>()

// State
const isLoading = ref(false)
const activeTab = ref('all')

// Mock shift data (in real app, would come from store)
const shift = ref({
  id: '1',
  date: 'May 16, 2025',
  type: 'Day',
  supervisor: 'John Doe',
  startTime: '08:00',
  endTime: '20:00',
  duration: '12h 0m',
  tasksCount: 12,
  completedTasksCount: 10,
  pendingTasksCount: 2,
  tasks: [
    {
      id: '101',
      jobCategory: 'Patient Transport',
      itemType: 'Wheelchair',
      fromLocation: 'Ward A1',
      toLocation: 'X-Ray Department',
      status: 'Completed',
      receivedTime: '08:30',
      allocatedTime: '08:35',
      completedTime: '08:55'
    },
    {
      id: '102',
      jobCategory: 'Specimen Delivery',
      itemType: 'Blood Sample',
      fromLocation: 'Ward B2',
      toLocation: 'Pathology',
      status: 'Completed',
      receivedTime: '09:15',
      allocatedTime: '09:20',
      completedTime: '09:45'
    },
    {
      id: '103',
      jobCategory: 'Equipment',
      itemType: 'Oxygen Cylinder',
      fromLocation: 'Storage Room',
      toLocation: 'Ward C3',
      status: 'Pending',
      receivedTime: '10:00',
      allocatedTime: '10:05'
    }
  ]
})

// Computed properties
const filteredTasks = computed(() => {
  if (!shift.value) return []
  
  if (activeTab.value === 'all') {
    return shift.value.tasks
  } else if (activeTab.value === 'completed') {
    return shift.value.tasks.filter(task => task.status === 'Completed')
  } else {
    return shift.value.tasks.filter(task => task.status === 'Pending')
  }
})

// Methods
const backToArchive = () => {
  router.push('/archive')
}

const reopenShift = () => {
  // In real app, would call store method to reopen shift
  console.log('Reopening shift:', shift.value.id)
  router.push('/')
}

const confirmDeleteShift = () => {
  if (confirm(`Are you sure you want to delete this shift from ${shift.value.date}?`)) {
    // In real app, would call store method to delete shift
    console.log('Deleting shift:', shift.value.id)
    router.push('/archive')
  }
}

const editTask = (taskId: string) => {
  router.push(`/task-form/${taskId}?from=archive&shift=${props.shiftId}`)
}
</script>

<style scoped>
.shift-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
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

.empty-icon {
  color: #6c757d;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.shift-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.shift-date {
  font-weight: bold;
  font-size: 1.25rem;
}

.shift-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 14px;
  color: white;
}

.shift-type.day {
  background-color: #0066cc;
}

.shift-type.night {
  background-color: #6f42c1;
}

.shift-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.btn-primary, .btn-danger {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
}

.btn-primary:hover {
  background-color: #0055aa;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #bd2130;
}

.shift-info {
  padding: 1rem;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  flex: 1;
  min-width: 120px;
}

.label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: 500;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #eee;
  text-align: center;
  padding: 1rem 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0066cc;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 0.25rem;
}

.tasks-section {
  margin-top: 2rem;
}

.tasks-header {
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.tab-btn.active {
  background-color: #0066cc;
  color: white;
  border-color: #0066cc;
}

.empty-tasks {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  color: #666;
}

.tasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shift-detail-task {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.shift-detail-task:hover {
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
  padding: 1rem;
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
  font-size: 14px;
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

.task-completion {
  font-size: 14px;
  color: #28a745;
}

.edit-button {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  color: #0066cc;
  background: none;
  border: none;
  cursor: pointer;
}

.edit-button span {
  display: none;
  margin-left: 0.25rem;
}

.shift-detail-task:hover .edit-button span {
  display: inline;
}
</style>
