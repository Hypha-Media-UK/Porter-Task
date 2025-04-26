<template>
  <div class="home-view">
    <div class="content">
      <!-- ACTIVE SHIFT VIEW -->
      <div v-if="isShiftActive && currentShift" class="active-shift">
        <div class="top-header">
          <h1>Current Shift</h1>
        </div>
        
        <div class="shift-card">
          <div class="shift-header">
            <div class="shift-title">
              <h2>{{ shiftTitle }}</h2>
              <div class="shift-badge" :class="currentShift.type.toLowerCase()">
                {{ currentShift.type }}
              </div>
            </div>
            
            <div class="shift-supervisor">
              <div class="supervisor-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="supervisor-info">
                <div class="supervisor-label">Supervisor</div>
                <div class="supervisor-name">{{ currentShift.supervisor }}</div>
              </div>
            </div>
            
            <div class="shift-time">
              <div class="time-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="time-details">
                <div class="time-label">Started</div>
                <div class="time-value">{{ formatTime(new Date(currentShift.startTime)) }}</div>
              </div>
            </div>
          </div>
          
          <div class="shift-progress">
            <div class="progress-label">
              <span>Task Completion</span>
              <span>{{ Math.round((completedTasksCount / (currentShift.tasks.length || 1)) * 100) }}%</span>
            </div>
            <div class="progress">
              <div class="progress-bar" :style="{ width: `${(completedTasksCount / (currentShift.tasks.length || 1)) * 100}%` }"></div>
            </div>
          </div>
          
          <div class="shift-stats">
            <div class="stat-item total">
              <div class="stat-value">{{ currentShift.tasks.length }}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
            
            <div class="stat-item pending">
              <div class="stat-value">{{ pendingTasksCount }}</div>
              <div class="stat-label">Pending</div>
            </div>
            
            <div class="stat-item completed">
              <div class="stat-value">{{ completedTasksCount }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
          
          <div class="shift-actions">
            <button class="btn-primary btn-large" @click="navigate('tasks')">
              View Tasks
            </button>
            <button class="btn-danger btn-large" @click="showEndShiftConfirm = true">
              End Shift
            </button>
          </div>
        </div>
        
        <!-- Quick Actions Section -->
        <div v-if="pendingTasksCount > 0" class="quick-actions-section">
          <h3>Pending Tasks</h3>
          <div class="quick-action-card" @click="navigate('pendingTasks')">
            <div class="action-icon pending">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">View Pending Tasks</div>
              <div class="action-subtitle">{{ pendingTasksCount }} tasks waiting to be completed</div>
            </div>
            <div class="action-chevron">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- NEW SHIFT VIEW -->
      <div v-else class="new-shift">
        <div class="top-header">
          <h1>Porter Track</h1>
        </div>
        
        <div class="welcome-card">
          <div class="welcome-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 14l2 2 4-4"></path>
            </svg>
          </div>
          <h2>Start a New Shift</h2>
          <p>Create a new porter shift to start tracking and managing tasks.</p>
        </div>
        
        <div class="shift-form card">
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
          
          <div class="shift-actions">
            <button 
              type="button" 
              class="btn-primary btn-large"
              @click="startSpecificShift('Day')"
              :disabled="!supervisor"
            >
              <span class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              </span>
              Start Day Shift
            </button>
            <button 
              type="button" 
              class="btn-secondary btn-large"
              @click="startSpecificShift('Night')"
              :disabled="!supervisor"
            >
              <span class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </span>
              Start Night Shift
            </button>
          </div>
        </div>
        
        <div class="recent-shifts" v-if="recentShifts.length > 0">
          <div class="section-header">
            <h3>Recent Shifts</h3>
            <button class="view-all-link" @click="navigateToArchive">View All</button>
          </div>
          
          <div class="shift-list">
            <div 
              v-for="shift in recentShifts" 
              :key="shift.id" 
              class="shift-list-item"
              @click="viewShiftDetails(shift.id)"
            >
              <div class="shift-list-icon" :class="shift.type.toLowerCase()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
              
              <div class="shift-list-content">
                <div class="shift-list-title">
                  {{ shift.type }} Shift - {{ formatDate(new Date(shift.date)) }}
                </div>
                <div class="shift-list-details">
                  <span class="shift-list-supervisor">{{ shift.supervisor }}</span>
                  <span class="separator">•</span>
                  <span class="shift-list-tasks">{{ shift.tasks.length }} tasks</span>
                </div>
              </div>
              
              <div class="shift-list-chevron">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
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
  return `${formatDate(date)}`
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
const startSpecificShift = (type: 'Day' | 'Night') => {
  if (supervisor.value) {
    startShift(type, supervisor.value)
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
  padding-bottom: calc(70px + var(--safe-area-inset-bottom)); /* Space for fixed tab navigation */
}

.content {
  flex: 1;
  padding: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.top-header {
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-md);
}

h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

p {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Card styles */
.card {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

/* Active Shift styles */
.shift-card {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.shift-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.shift-title {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.shift-title h2 {
  margin: 0;
  margin-right: var(--spacing-sm);
}

.shift-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: white;
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-pill);
  text-transform: uppercase;
}

.shift-badge.day {
  background-color: var(--color-primary);
}

.shift-badge.night {
  background-color: var(--color-secondary);
}

.shift-supervisor {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.supervisor-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  margin-right: var(--spacing-sm);
}

.supervisor-info {
  flex: 1;
}

.supervisor-label, .time-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.supervisor-name, .time-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.shift-time {
  display: flex;
  align-items: flex-start;
}

.time-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-secondary-light);
  color: var(--color-secondary);
  border-radius: 50%;
  margin-right: var(--spacing-sm);
}

.shift-progress {
  margin: var(--spacing-md) 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-secondary);
}

.progress {
  height: 8px;
  background-color: var(--color-border-light);
  border-radius: var(--border-radius-pill);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-success);
  border-radius: var(--border-radius-pill);
  transition: width 0.5s ease;
}

.shift-stats {
  display: flex;
  justify-content: space-between;
  margin: var(--spacing-lg) 0;
  background-color: var(--color-secondary-light);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.stat-item.total .stat-value {
  color: var(--color-primary);
}

.stat-item.pending .stat-value {
  color: var(--color-pending);
}

.stat-item.completed .stat-value {
  color: var(--color-success);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.shift-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.shift-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  flex: 1;
  padding: var(--spacing-md);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .shift-actions {
    flex-direction: row;
  }
}

/* Quick Actions Section */
.quick-actions-section {
  margin-top: var(--spacing-lg);
}

.quick-action-card {
  display: flex;
  align-items: center;
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--box-shadow);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.quick-action-card:active {
  transform: scale(0.98);
  box-shadow: var(--box-shadow-sm);
}

.action-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  margin-right: var(--spacing-md);
}

.action-icon.pending {
  background-color: rgba(var(--color-pending-rgb), 0.1);
  color: var(--color-pending);
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.action-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.action-chevron {
  color: var(--color-text-light);
}

/* Welcome card */
.welcome-card {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.welcome-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
}

/* Shift Form */
.shift-form {
  padding: var(--spacing-lg);
}

.segmented-control {
  display: flex;
  background-color: var(--color-secondary-light);
  border-radius: var(--border-radius-pill);
  padding: 2px;
  margin-bottom: var(--spacing-md);
  position: relative;
  overflow: hidden;
}

.segment {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  position: relative;
  z-index: 1;
  transition: color var(--transition-fast);
  cursor: pointer;
  border-radius: var(--border-radius-pill);
}

.segment.active {
  color: white;
}

.segment-highlighter {
  position: absolute;
  height: calc(100% - 4px);
  top: 2px;
  left: 2px;
  background-color: var(--color-primary);
  border-radius: var(--border-radius-pill);
  transition: transform var(--transition-fast), width var(--transition-fast);
  z-index: 0;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.start-btn {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
}

/* Recent Shifts styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.section-header h3 {
  margin: 0;
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

.shift-list {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.shift-list-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.shift-list-item:last-child {
  border-bottom: none;
}

.shift-list-item:active {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.shift-list-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  margin-right: var(--spacing-md);
}

.shift-list-icon.day {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.shift-list-icon.night {
  background-color: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.shift-list-content {
  flex: 1;
}

.shift-list-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
}

.shift-list-details {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.separator {
  margin: 0 var(--spacing-xs);
}

.shift-list-chevron {
  color: var(--color-text-light);
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
  animation: slideInUp 0.4s cubic-bezier(0.19, 1, 0.22, 1);
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

/* Responsive adjustments */
@media (min-width: 768px) {
  .shift-actions {
    justify-content: flex-end;
  }
  
  .shift-actions button {
    flex: 0 0 auto;
    min-width: 150px;
  }
}
</style>
