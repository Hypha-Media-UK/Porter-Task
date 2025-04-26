<template>
  <div class="home-view">
    <div class="content">
      <div v-if="isShiftActive && currentShift" class="active-shift">
        <div class="shift-card">
          <div class="shift-header">
            <h2>{{ shiftTitle }}</h2>
            <div class="shift-meta">
              <span class="supervisor">Supervisor: {{ currentShift.supervisor }}</span>
              <span class="time">Started: {{ formatTime(new Date(currentShift.startTime)) }}</span>
            </div>
          </div>
          
          <div class="shift-stats">
            <div class="stat-item">
              <div class="stat-value">{{ currentShift.tasks.length }}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ pendingTasksCount }}</div>
              <div class="stat-label">Pending</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ completedTasksCount }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
          
          <div class="actions">
            <button class="btn-danger" @click="showEndShiftConfirm = true">
              End Shift
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="new-shift">
        <h2>Start New Shift</h2>
        
        <form class="shift-form" @submit.prevent="startNewShift">
          <div class="form-group">
            <label>Shift Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="shiftType" value="Day" />
                <span>Day Shift</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="shiftType" value="Night" />
                <span>Night Shift</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="supervisor">Supervisor</label>
            <select 
              id="supervisor" 
              v-model="supervisor" 
              required
              class="form-control"
            >
              <option value="" disabled>Select Supervisor</option>
              <option v-for="sup in supervisors" :key="sup" :value="sup">{{ sup }}</option>
            </select>
          </div>
          
          <button type="submit" class="btn-primary btn-large start-btn">
            Start Shift
          </button>
        </form>
        
        <div class="recent-shifts" v-if="recentShifts.length > 0">
          <h3>Recent Shifts</h3>
          <div class="shift-list">
            <div 
              v-for="shift in recentShifts" 
              :key="shift.id" 
              class="recent-shift-item"
              @click="viewShiftDetails(shift.id)"
            >
              <div class="shift-info">
                <span class="shift-date">{{ formatDate(new Date(shift.date)) }}</span>
                <span class="shift-type">{{ shift.type }} Shift</span>
              </div>
              <div class="shift-details">
                <span class="supervisor">{{ shift.supervisor }}</span>
                <span class="tasks-count">{{ shift.tasks.length }} tasks</span>
              </div>
              <div class="chevron">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="view-all-shifts">
            <button class="btn-secondary" @click="navigateToArchive">
              View All Shifts
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- End Shift Confirmation Modal -->
    <div v-if="showEndShiftConfirm" class="modal-backdrop" @click.self="showEndShiftConfirm = false">
      <div class="modal-content">
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
    
    <TabNavigation current-route="home" @navigate="navigate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useShiftStore } from '../stores/shift'
import { useSettingsStore } from '../stores/settings'
import { formatDate, formatTime } from '../utils/date'
import type { RouteParams } from '../types'
import TabNavigation from '../components/TabNavigation.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Store
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

const {
  isShiftActive,
  currentShift,
  archivedShifts,
  startShift,
  endShift
} = shiftStore

const { supervisors } = settingsStore

// Local state
const shiftType = ref<'Day' | 'Night'>('Day')
const supervisor = ref('')
const showEndShiftConfirm = ref(false)

// Computed
const shiftTitle = computed(() => {
  if (!currentShift) return ''
  
  const date = new Date(currentShift.date)
  return `${currentShift.type} Shift - ${formatDate(date)}`
})

const pendingTasksCount = computed(() => {
  if (!currentShift) return 0
  return currentShift.tasks.filter(task => task.status === 'Pending').length
})

const completedTasksCount = computed(() => {
  if (!currentShift) return 0
  return currentShift.tasks.filter(task => task.status === 'Completed').length
})

const recentShifts = computed(() => {
  return archivedShifts.slice(0, 3)
})

// Methods
const startNewShift = () => {
  if (supervisor.value) {
    startShift(shiftType.value, supervisor.value)
    if (navigate) navigate('tasks')
  }
}

const endCurrentShift = () => {
  endShift()
  showEndShiftConfirm.value = false
}

const viewShiftDetails = (shiftId: string) => {
  if (navigate) navigate('shiftDetail', { shiftId })
}

const navigateToArchive = () => {
  if (navigate) navigate('archive')
}

// Initialize form data
onMounted(() => {
  // Set default shift type based on current time
  const hour = new Date().getHours()
  shiftType.value = hour >= 8 && hour < 20 ? 'Day' : 'Night'
  
  // Set default supervisor if available
  if (supervisors.length > 0) {
    supervisor.value = supervisors[0]
  }
})
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 70px; /* Space for fixed tab navigation */
}

.content {
  flex: 1;
  padding: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

/* Active Shift styles */
.shift-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.shift-header {
  margin-bottom: var(--spacing-md);
}

.shift-header h2 {
  margin-bottom: var(--spacing-xs);
}

.shift-meta {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.shift-stats {
  display: flex;
  justify-content: space-around;
  margin: var(--spacing-lg) 0;
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--spacing-md) 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

/* New Shift Form styles */
.shift-form {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.radio-group {
  display: flex;
  gap: var(--spacing-lg);
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: var(--spacing-sm);
  width: auto;
}

.form-control {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}

.start-btn {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
}

/* Recent Shifts styles */
.recent-shifts {
  margin-top: var(--spacing-2xl);
}

.shift-list {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.recent-shift-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.recent-shift-item:last-child {
  border-bottom: none;
}

.recent-shift-item:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.shift-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shift-date {
  font-weight: var(--font-weight-semibold);
}

.shift-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.shift-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: var(--spacing-md);
}

.supervisor {
  font-size: var(--font-size-sm);
}

.tasks-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.chevron {
  display: flex;
  align-items: center;
  color: var(--color-text-light);
}

.view-all-shifts {
  margin-top: var(--spacing-md);
  text-align: center;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-actions {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}
</style>
