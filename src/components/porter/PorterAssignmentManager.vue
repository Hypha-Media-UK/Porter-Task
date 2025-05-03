<template>
  <div class="porter-assignments">
    <!-- Department Assignments Section -->
    <div class="section-header">
      <h3>Department Assignments</h3>
      <pre v-if="debug" style="font-size: 10px; overflow: auto; max-height: 100px; background: #f5f5f5; padding: 5px; margin-bottom: 10px;">
Assigned Porters: {{ JSON.stringify(assignedPorters) }}
</pre>
      <button 
        class="btn-primary add-btn" 
        @click="showAssignmentModal = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Assign Porter
      </button>
    </div>
    
    <div v-if="assignedPorters.length === 0" class="empty-state">
      <p>No porters have been assigned to this shift yet.</p>
      <p>Add porters to the shift first, then you can assign them to departments.</p>
    </div>
    
    <div v-else-if="assignments.length === 0" class="empty-state">
      <p>No department assignments have been created yet.</p>
      <button class="btn-primary" @click="showAssignmentModal = true">
        Create First Assignment
      </button>
    </div>
    
    <div v-else class="departments-grid">
      <div 
        v-for="department in departmentsWithAssignments" 
        :key="department.id"
        class="department-card"
      >
        <div 
          class="department-header"
          :style="{ backgroundColor: department.color ? `${department.color}22` : '#f0f0f0', 
                    color: department.color || '#666' }"
        >
          <span class="department-name">{{ department.name }}</span>
          <span class="department-count">{{ department.assignments.length }} Porter{{ department.assignments.length !== 1 ? 's' : '' }}</span>
        </div>
        
        <div class="department-content">
          <div v-if="department.assignments.length === 0" class="empty-assignments">
            <p>No porters assigned to this department</p>
          </div>
          
          <div v-else class="assignment-list">
            <div 
              v-for="assignment in department.assignments" 
              :key="assignment.id"
              class="assignment-item"
            >
              <div class="assignment-info">
                <div class="assignment-porter">{{ assignment.porterId }}</div>
                <div class="assignment-time">
                  {{ formatTime(new Date(assignment.startTime)) }}
                  {{ assignment.endTime ? ` - ${formatTime(new Date(assignment.endTime))}` : '' }}
                  {{ !assignment.endTime ? '(until end of shift)' : '' }}
                </div>
                <div v-if="assignment.notes" class="assignment-notes">
                  {{ assignment.notes }}
                </div>
              </div>
              <div class="assignment-actions">
                <button class="btn-icon" @click="editAssignment(assignment)" title="Edit assignment">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="btn-icon" @click="deleteAssignment(assignment)" title="Delete assignment">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Timeline View -->
    <div v-if="assignments.length > 0" class="timeline-section">
      <div class="section-header">
        <h3>Timeline View</h3>
        <span class="time-now-indicator">
          Current Time: {{ formatTime(new Date()) }}
        </span>
      </div>
      
      <div class="timeline-container">
        <div class="timeline">
          <div class="timeline-hours">
            <div 
              v-for="hour in timelineHours" 
              :key="hour.label" 
              class="timeline-hour"
              :style="{ width: `${100 / timelineHours.length}%` }"
            >
              {{ hour.label }}
            </div>
          </div>
          
          <div 
            v-for="porter in portersWithAssignments" 
            :key="porter.id" 
            class="timeline-porter"
          >
            <div class="timeline-porter-name">{{ porter.id }}</div>
            <div class="timeline-assignments">
              <div 
                v-for="assignment in porter.assignments" 
                :key="assignment.id"
                class="timeline-assignment"
                :style="{ 
                  left: `${calculateTimePosition(assignment.startTime)}%`,
                  width: `${calculateTimeWidth(assignment.startTime, assignment.endTime)}%`,
                  backgroundColor: getDepartmentColor(assignment.departmentId)
                }"
                @click="editAssignment(assignment)"
              >
                {{ getDepartmentName(assignment.departmentId) }}
              </div>
            </div>
          </div>
          
          <!-- Current time indicator -->
          <div 
            class="current-time-marker"
            :style="{ left: `${calculateCurrentTimePosition()}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Assignment Modal -->
    <PorterAssignmentModal
      v-if="showAssignmentModal"
      :editing="!!editingAssignment"
      :assignment="editingAssignment"
      :porters="assignedPorters"
      @save="saveAssignment"
      @cancel="cancelAssignment"
    />
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Delete Assignment</h3>
          <button class="btn-close" @click="cancelDelete">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to remove 
            <strong>{{ deletingAssignment?.porterId }}</strong> 
            from the 
            <strong>{{ getDepartmentName(deletingAssignment?.departmentId || '') }}</strong> 
            department?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelDelete">Cancel</button>
          <button class="btn-danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useShiftStore } from '../../stores/shift'
import { useSettingsStore } from '../../stores/settings'
import PorterAssignmentModal from './PorterAssignmentModal.vue'
import { formatTime } from '../../utils/date'
import type { PorterAssignment } from '@/types'

// Store access
const shiftStore = useShiftStore()
const settingsStore = useSettingsStore()

// Computed data
const assignments = computed(() => shiftStore.porterAssignments)
const allDepartments = computed(() => settingsStore.designationDepartments)
const assignedPorters = computed(() => {
  const porters = shiftStore.currentShift?.assignedPorters || []
  console.log("PorterAssignmentManager - Assigned porters:", porters)
  return porters
})

// State for modals
const showAssignmentModal = ref(false)
const editingAssignment = ref<PorterAssignment | undefined>(undefined)
const showDeleteModal = ref(false)
const deletingAssignment = ref<PorterAssignment | undefined>(undefined)
const debug = ref(true) // Enable debug info

// Timeline data
const timelineHours = computed(() => {
  // Create an array of hour labels for the timeline (usually 24 hours)
  // Adjusted to only show relevant hours based on shift times
  const hours = []
  const startHour = 6 // 6 AM
  const endHour = 23 // 11 PM
  
  for (let i = startHour; i <= endHour; i++) {
    hours.push({
      hour: i,
      label: `${i % 12 === 0 ? 12 : i % 12}${i < 12 ? 'am' : 'pm'}`
    })
  }
  
  // If night shift, also add hours from midnight to 6 AM
  for (let i = 0; i < startHour; i++) {
    hours.push({
      hour: i,
      label: `${i % 12 === 0 ? 12 : i % 12}${i < 12 ? 'am' : 'pm'}`
    })
  }
  
  return hours
})

// Process data for UI display
const departmentsWithAssignments = computed(() => {
  return allDepartments.value.map(dept => {
    // Find all assignments for this department
    const deptAssignments = assignments.value.filter(a => a.departmentId === dept.id)
    
    return {
      ...dept,
      assignments: deptAssignments
    }
  }).sort((a, b) => {
    // Sort by assignment count (descending) then by name
    if (b.assignments.length !== a.assignments.length) {
      return b.assignments.length - a.assignments.length
    }
    return a.name.localeCompare(b.name)
  })
})

const portersWithAssignments = computed(() => {
  // Group assignments by porter
  const porters = assignedPorters.value.map(porterId => {
    return {
      id: porterId,
      assignments: assignments.value.filter(a => a.porterId === porterId)
    }
  })
  
  // Only include porters with assignments
  return porters.filter(p => p.assignments.length > 0)
})

// Methods for timeline positioning
function calculateTimePosition(timeString: string): number {
  const date = new Date(timeString)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  // Calculate position as percentage of 24 hours
  const totalMinutes = hours * 60 + minutes
  const dayMinutes = 24 * 60
  return (totalMinutes / dayMinutes) * 100
}

function calculateTimeWidth(startTimeString: string, endTimeString?: string): number {
  const startDate = new Date(startTimeString)
  let endDate
  
  if (endTimeString) {
    endDate = new Date(endTimeString)
  } else {
    // If no end time, use end of shift or add 2 hours to start time
    const shift = shiftStore.currentShift
    if (shift && shift.endTime) {
      endDate = new Date(shift.endTime)
    } else {
      endDate = new Date(startDate)
      endDate.setHours(endDate.getHours() + 2) // Default 2 hour duration
    }
  }
  
  // Calculate minutes between start and end
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
  
  // Handle overnight assignments
  let durationMinutes = endMinutes - startMinutes
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60 // Add a full day if overnight
  }
  
  // Calculate width as percentage of 24 hours
  const dayMinutes = 24 * 60
  return (durationMinutes / dayMinutes) * 100
}

function calculateCurrentTimePosition(): number {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // Calculate position as percentage of 24 hours
  const totalMinutes = hours * 60 + minutes
  const dayMinutes = 24 * 60
  return (totalMinutes / dayMinutes) * 100
}

// Helper methods for department data
function getDepartmentName(departmentId: string): string {
  const department = allDepartments.value.find(d => d.id === departmentId)
  return department ? department.name : 'Unknown'
}

function getDepartmentColor(departmentId: string): string {
  const department = allDepartments.value.find(d => d.id === departmentId)
  return department && department.color ? department.color : '#cccccc'
}

// Assignment management methods
function editAssignment(assignment: PorterAssignment) {
  editingAssignment.value = assignment
  showAssignmentModal.value = true
}

function saveAssignment(assignmentData: {
  id?: string;
  porterId: string;
  departmentId: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}) {
  try {
    if (assignmentData.id) {
      // Update existing assignment
      shiftStore.updatePorterAssignment(assignmentData.id, {
        departmentId: assignmentData.departmentId,
        startTime: assignmentData.startTime,
        endTime: assignmentData.endTime,
        notes: assignmentData.notes
      })
    } else {
      // Create new assignment
      shiftStore.addPorterAssignment({
        porterId: assignmentData.porterId,
        departmentId: assignmentData.departmentId,
        startTime: assignmentData.startTime,
        endTime: assignmentData.endTime,
        notes: assignmentData.notes
      })
    }
    
    // Close modal
    showAssignmentModal.value = false
    editingAssignment.value = undefined
  } catch (error) {
    console.error('Error saving assignment:', error)
    alert('Failed to save assignment: ' + (error instanceof Error ? error.message : String(error)))
  }
}

function cancelAssignment() {
  showAssignmentModal.value = false
  editingAssignment.value = undefined
}

function deleteAssignment(assignment: PorterAssignment) {
  deletingAssignment.value = assignment
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deletingAssignment.value) {
    try {
      shiftStore.removePorterAssignment(deletingAssignment.value.id)
      showDeleteModal.value = false
      deletingAssignment.value = undefined
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Failed to delete assignment: ' + (error instanceof Error ? error.message : String(error)))
    }
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  deletingAssignment.value = undefined
}
</script>

<style scoped>
.porter-assignments {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.time-now-indicator {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.empty-state {
  background-color: var(--color-card-alt, #f9f9f9);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.empty-state p {
  margin: var(--spacing-sm) 0;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.department-card {
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.department-header {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-medium);
}

.department-content {
  padding: var(--spacing-sm);
}

.empty-assignments {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.assignment-item {
  padding: var(--spacing-sm);
  background-color: var(--color-card-alt, #f9f9f9);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
}

.assignment-info {
  flex: 1;
}

.assignment-porter {
  font-weight: var(--font-weight-medium);
}

.assignment-time, .assignment-notes {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin-top: var(--spacing-xs);
}

.assignment-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 50%;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: #f0f0f0;
  color: var(--color-text);
}

.btn-icon:first-child:hover {
  color: var(--color-primary);
}

.btn-icon:last-child:hover {
  color: var(--color-danger);
}

/* Timeline styles */
.timeline-section {
  margin-top: var(--spacing-xl);
}

.timeline-container {
  overflow-x: auto;
  margin-bottom: var(--spacing-xl);
}

.timeline {
  position: relative;
  min-width: 800px;
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
  padding: var(--spacing-md);
}

.timeline-hours {
  display: flex;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-xs);
}

.timeline-hour {
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.timeline-porter {
  display: flex;
  margin: var(--spacing-md) 0;
}

.timeline-porter-name {
  width: 100px;
  font-weight: var(--font-weight-medium);
  padding-right: var(--spacing-md);
  flex-shrink: 0;
}

.timeline-assignments {
  position: relative;
  flex: 1;
  height: 28px;
}

.timeline-assignment {
  position: absolute;
  height: 28px;
  border-radius: var(--border-radius);
  padding: 0 var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.timeline-assignment:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-time-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-danger);
  z-index: 1;
}

.current-time-marker::after {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  width: 10px;
  height: 10px;
  background-color: var(--color-danger);
  border-radius: 50%;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-danger {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-card-alt, #f9f9f9);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border-light);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}

@media (max-width: 480px) {
  .timeline-porter-name {
    width: 80px;
  }
}
</style>
