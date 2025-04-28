<template>
  <main class="home-view">
    <!-- ACTIVE SHIFT VIEW -->
    <section v-if="isShiftActive && currentShift && currentShift.value" class="active-shift">
      <header class="top-header">
        <h1>Current Shift</h1>
      </header>
      
      <div class="shift-card">
        <div class="shift-header">
          <div class="shift-title">
            <h2>{{ shiftTitle }}</h2>
            <div class="shift-badge" :class="currentShift.value.type.toLowerCase()">
              {{ currentShift.value.type }}
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
              <div class="supervisor-name">{{ currentShift.value.supervisor }}</div>
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
              <div class="time-value">{{ formatTime(new Date(currentShift.value.startTime)) }}</div>
            </div>
          </div>
        </div>
        
        <div class="shift-progress">
          <div class="progress-label">
            <span>Task Completion</span>
            <span>{{ Math.round((completedTasksCount / (currentShift.value.tasks.length || 1)) * 100) }}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar" :style="{ width: `${(completedTasksCount / (currentShift.value.tasks.length || 1)) * 100}%` }"></div>
          </div>
        </div>
        
        <div class="shift-stats">
          <div class="stat-item total">
            <div class="stat-value">{{ currentShift.value.tasks.length }}</div>
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

        <!-- Porters Management Section -->
        <div class="porters-section">
          <h3>Porters Assignment</h3>
          <p class="section-description">Assign porters to this shift to manage task assignments</p>
          
          <div class="porters-assignment">
            <div class="porter-selection">
              <select 
                v-model="selectedPorter" 
                class="form-control"
                :disabled="!availablePorters.length"
              >
                <option value="" disabled>Select porter</option>
                <option v-for="porter in availablePorters" :key="porter" :value="porter">
                  {{ porter }}
                </option>
              </select>
              <button 
                class="btn-primary" 
                @click="handleAddPorterToShift"
                :disabled="!selectedPorter"
              >
                Add Porter
              </button>
            </div>
            
            <div v-if="assignedPorters.length === 0" class="empty-porters">
              <p>No porters assigned to this shift yet.</p>
            </div>
            
            <div v-else class="assigned-porters">
              <h4>Assigned Porters:</h4>
              <div class="porter-tags">
                <div v-for="porter in assignedPorters" :key="porter" class="porter-tag">
                  <span class="porter-name">{{ porter }}</span>
                  <button class="remove-porter" @click="handleRemovePorterFromShift(porter)" title="Remove porter">
                    &times;
                  </button>
                </div>
              </div>
            </div>
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
    </section>
    
    <!-- NEW SHIFT VIEW -->
    <section v-else class="new-shift">
      <!-- Active Shift Notification Banner -->
      <div v-if="isShiftActive" class="active-shift-notification">
        <div class="notification-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="notification-content">
          <h3>Active Shift in Progress</h3>
          <p>There is currently an active shift. You need to end the current shift before starting a new one.</p>
        </div>
        <div class="notification-actions">
          <button class="btn-primary" @click="navigate('tasks')">
            Open Current Shift
          </button>
          <button class="btn-danger" @click="showEndShiftConfirm = true">
            End Current Shift
          </button>
        </div>
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
        
        <!-- Porter Assignment Section -->
        <div class="form-group porters-section">
          <label>Porters Assignment</label>
          <p class="section-description">Select porters who will be working during this shift</p>
          
          <div class="porters-assignment">
            <div class="porter-selection">
              <select 
                v-model="selectedPorter" 
                class="form-control"
                :disabled="!availableInitialPorters.length"
              >
                <option value="" disabled>Select porter</option>
                <option v-for="porter in allPorters" :key="porter" :value="porter">
                  {{ porter }}
                </option>
              </select>
              <button 
                class="btn-primary" 
                @click="handleAddInitialPorter"
                :disabled="!selectedPorter"
              >
                Add Porter
              </button>
            </div>
            
            <div v-if="initialPorters.length === 0" class="empty-porters">
              <p>No porters assigned to this shift yet.</p>
            </div>
            
            <div v-else class="assigned-porters">
              <h4>Assigned Porters:</h4>
              <div class="porter-tags">
                <div v-for="porter in initialPorters" :key="porter" class="porter-tag">
                  <span class="porter-name">{{ porter }}</span>
                  <button class="remove-porter" @click="handleRemoveInitialPorter(porter)" title="Remove porter">
                    &times;
                  </button>
                </div>
              </div>
            </div>
          </div>
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
    </section>
    
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
    
    <!-- Removed TabNavigation as all navigation items are in header -->
  </main>
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
  endShift,
  addPorterToShift,
  removePorterFromShift
} = shiftStore

const { supervisors, porters: allPorters } = settingsStore

// Local state
const shiftType = ref<'Day' | 'Night'>('Day')
const supervisor = ref('')
const showEndShiftConfirm = ref(false)
const selectedPorter = ref('')
const initialPorters = ref<string[]>([])

// Computed
const shiftTitle = computed(() => {
  if (!currentShift.value) return ''
  
  const date = new Date(currentShift.value.date)
  return `${formatDate(date)}`
})

const pendingTasksCount = computed(() => {
  if (!currentShift.value) return 0
  return currentShift.value.tasks.filter(task => task.status === 'Pending').length
})

const completedTasksCount = computed(() => {
  if (!currentShift.value) return 0
  return currentShift.value.tasks.filter(task => task.status === 'Completed').length
})

const recentShifts = computed(() => {
  if (!archivedShifts.value) return []
  return archivedShifts.value.slice(0, 3)
})

// Computed properties for porter management
const assignedPorters = computed(() => {
  if (!currentShift.value || !currentShift.value.assignedPorters) return []
  return currentShift.value.assignedPorters
})

const availablePorters = computed(() => {
  // Filter out porters that are already assigned
  return allPorters.filter(porter => !assignedPorters.value.includes(porter))
})

// Computed properties for initial porter assignment (before shift starts)
const availableInitialPorters = computed(() => {
  // Filter out porters that are already in the initialPorters list
  return allPorters.filter(porter => !initialPorters.value.includes(porter))
})

// Methods
const startSpecificShift = (type: 'Day' | 'Night') => {
  try {
    if (!supervisor.value) {
      console.error('No supervisor selected');
      return;
    }

    console.log(`Starting ${type} shift with supervisor:`, supervisor.value);
    
    // Check if there's already an active shift
    if (isShiftActive.value && currentShift.value) {
      console.log('There is already an active shift. Ending current shift before starting a new one.');
      
      // End the current shift
      endShift();
      
      // Reload the page to fully reset the state
      window.location.reload();
      return;
    }
    
    // Clear any existing shift data from localStorage
    localStorage.removeItem('porter-track-current-shift');
    
    // Start the shift with the supervisor
    const newShift = startShift(type, supervisor.value);
    console.log('New shift created:', newShift);
    
    // Add any porters that were pre-selected
    if (initialPorters.value && initialPorters.value.length > 0) {
      console.log(`Adding ${initialPorters.value.length} porters to shift:`, initialPorters.value);
      
      initialPorters.value.forEach(porter => {
        try {
          const success = addPorterToShift(porter);
          console.log(`Added porter ${porter}: ${success ? 'Success' : 'Failed'}`);
        } catch (err) {
          console.error(`Error adding porter ${porter}:`, err);
        }
      });
      
      // Clear the initial porters list
      initialPorters.value = [];
    }
    
    // Force a UI refresh by navigating to the tasks page
    console.log('Navigating to tasks view...');
    window.location.href = '/tasks';
  } catch (error) {
    console.error('Critical error starting shift:', error);
    alert('Error starting shift: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Methods for initial porter assignment (before shift starts)
const handleAddInitialPorter = () => {
  if (selectedPorter.value && !initialPorters.value.includes(selectedPorter.value)) {
    console.log('Adding porter to initial list:', selectedPorter.value);
    initialPorters.value.push(selectedPorter.value);
    // Reset selection after successful add
    selectedPorter.value = '';
  } else {
    console.warn('Porter already in list or no porter selected');
  }
}

const handleRemoveInitialPorter = (porter: string) => {
  const index = initialPorters.value.indexOf(porter)
  if (index !== -1) {
    initialPorters.value.splice(index, 1)
  }
}

const endCurrentShift = () => {
  endShift()
  showEndShiftConfirm.value = false
  
  // Force UI refresh by navigating back to home
  if (navigate) navigate('home')
}

const viewShiftDetails = (shiftId: string) => {
  if (navigate) navigate('shiftDetail', { shiftId })
}

const navigateToArchive = () => {
  if (navigate) navigate('archive')
}

const handleAddPorterToShift = () => {
  if (selectedPorter.value) {
    addPorterToShift(selectedPorter.value)
    // Reset selection after adding
    selectedPorter.value = ''
  }
}

const handleRemovePorterFromShift = (porter: string) => {
  removePorterFromShift(porter)
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
  padding: var(--spacing-md);
  padding-bottom: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.active-shift, .new-shift {
  flex: 1;
}

.top-header {
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

h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  margin-top: 0;
}

p {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Card styles */
.card, .shift-card {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
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

.porters-section {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.porter-selection {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.porter-selection select {
  flex: 1;
}

.empty-porters {
  background-color: var(--color-secondary-light);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  text-align: center;
}

.porter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.porter-tag {
  display: flex;
  align-items: center;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-pill);
}

.remove-porter {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
}

.shift-list-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.shift-list-item:last-child {
  border-bottom: none;
}

/* Active Shift Notification Banner */
.active-shift-notification {
  display: flex;
  align-items: center;
  background-color: #feecec;
  border: 1px solid var(--color-danger);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  position: relative;
}

.notification-icon {
  color: var(--color-danger);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  color: var(--color-danger);
  font-size: var(--font-size-md);
  margin-top: 0;
  margin-bottom: var(--spacing-xs);
}

.notification-content p {
  margin: 0;
  color: var(--color-text);
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-md);
}

.notification-actions button {
  white-space: nowrap;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .notification-actions {
    flex-direction: row;
  }
}
</style>
