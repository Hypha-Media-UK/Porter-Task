<template>
  <div class="modal-backdrop" @click.self="cancel">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ editing ? 'Edit Assignment' : 'Assign Porter to Department' }}</h3>
        <button class="btn-close" @click="cancel">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Porter Selection -->
        <div class="form-group">
          <label class="form-label">Porter</label>
          <select 
            v-model="form.porterId" 
            class="form-control"
            :disabled="availablePorters.length === 0"
          >
            <option value="" disabled>Select a porter</option>
            <option v-for="porter in selectablePorters" :key="porter" :value="porter">
              {{ porter }}
            </option>
          </select>
          <div v-if="!editing && availablePorters.length === 0" class="form-note">
            <em>No available porters. Please add porters to this shift first.</em>
          </div>
        </div>
        
        <!-- Department Selection -->
        <div class="form-group">
          <label class="form-label">Department</label>
          <select 
            v-model="form.departmentId" 
            class="form-control"
          >
            <option value="" disabled>Select a department</option>
            <option 
              v-for="department in departments" 
              :key="department.id" 
              :value="department.id"
              :style="{ color: department.color }"
            >
              {{ department.name }}
            </option>
          </select>
        </div>
        
        <!-- Time Range -->
        <div class="form-group">
          <label class="form-label">Time Range</label>
          <div class="time-inputs">
            <div class="time-input-group">
              <label>Start Time</label>
              <input 
                type="time" 
                v-model="form.startTime" 
                class="form-control"
              >
            </div>
            <span class="time-separator">to</span>
            <div class="time-input-group">
              <label>End Time (optional)</label>
              <input 
                type="time" 
                v-model="form.endTime" 
                class="form-control"
              >
              <div class="form-note">
                Leave blank for "until end of shift"
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        <div class="form-group">
          <label class="form-label">Notes (optional)</label>
          <textarea 
            v-model="form.notes" 
            class="form-control"
            rows="3"
            placeholder="Add any specific notes about this assignment..."
          ></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="cancel">Cancel</button>
        <button 
          class="btn-primary" 
          @click="save"
          :disabled="!isFormValid"
        >
          {{ editing ? 'Update' : 'Assign' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useShiftStore } from '@/stores/shift'
import type { PorterAssignment } from '@/types'

const props = defineProps<{
  editing?: boolean;
  assignment?: PorterAssignment;
  porters?: string[];
}>()

const emit = defineEmits<{
  (e: 'save', assignment: {
    id?: string;
    porterId: string;
    departmentId: string;
    startTime: string;
    endTime?: string;
    notes?: string;
  }): void;
  (e: 'cancel'): void;
}>()

// Store access
const settingsStore = useSettingsStore()
const shiftStore = useShiftStore()
const departments = computed(() => settingsStore.designationDepartments)
const assignedPorters = computed(() => {
  const portersFromProps = props.porters || [];
  const portersFromShift = shiftStore.currentShift?.assignedPorters || [];
  console.log("MODAL - Porters from props:", portersFromProps);
  console.log("MODAL - Porters from shift:", portersFromShift);
  console.log("MODAL - All porters:", settingsStore.porters);
  return portersFromProps.length ? portersFromProps : portersFromShift;
})

// Get list of porters already assigned to departments
const portersWithAssignments = computed(() => {
  const assignments = shiftStore.porterAssignments
  // Extract unique porter IDs from all assignments
  const assigned = [...new Set(assignments.map(a => a.porterId))]
  console.log('Porters with assignments:', assigned)
  return assigned
})

const availablePorters = computed(() => {
  // If editing, show the current porter + all unassigned porters
  if (props.editing && props.assignment) {
    return [...new Set([props.assignment.porterId, ...assignedPorters.value])]
  }
  
  console.log('All assigned porters from the shift:', assignedPorters.value)
  
  // For new assignments, always show all porters assigned to the shift
  // This is the key fix - we're no longer filtering based on existing assignments
  return props.porters || []
})

// Form state
const defaultDateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const form = ref({
  porterId: '',
  departmentId: '',
  startTime: defaultDateTime(),
  endTime: '',
  notes: ''
})

// Computed
const selectablePorters = computed(() => {
  // For editing, show all assigned porters including the current one
  if (props.editing) {
    return availablePorters.value
  }
  return availablePorters.value
})

const isFormValid = computed(() => {
  return form.value.porterId && 
         form.value.departmentId && 
         form.value.startTime
})

// Methods
function save() {
  // Convert time inputs to ISO strings
  const today = new Date()
  const startParts = form.value.startTime.split(':')
  const startTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    parseInt(startParts[0]),
    parseInt(startParts[1])
  ).toISOString()
  
  let endTime: string | undefined = undefined
  if (form.value.endTime) {
    const endParts = form.value.endTime.split(':')
    endTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(endParts[0]),
      parseInt(endParts[1])
    ).toISOString()
    
    // If end time is earlier than start time, assume it's the next day
    if (endTime < startTime) {
      const nextDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        parseInt(endParts[0]),
        parseInt(endParts[1])
      )
      endTime = nextDay.toISOString()
    }
  }
  
  // Prepare and emit assignment data
  const assignmentData = {
    id: props.editing ? props.assignment?.id : undefined,
    porterId: form.value.porterId,
    departmentId: form.value.departmentId,
    startTime,
    endTime,
    notes: form.value.notes || undefined
  }
  
  console.log('Saving assignment with porter:', form.value.porterId);
  emit('save', assignmentData)
}

function cancel() {
  emit('cancel')
}

// Initialization
onMounted(() => {
  // If editing, initialize form with assignment data
  if (props.editing && props.assignment) {
    // Convert ISO dates to time inputs
    const startDate = new Date(props.assignment.startTime)
    const startHours = startDate.getHours().toString().padStart(2, '0')
    const startMinutes = startDate.getMinutes().toString().padStart(2, '0')
    
    form.value = {
      porterId: props.assignment.porterId,
      departmentId: props.assignment.departmentId,
      startTime: `${startHours}:${startMinutes}`,
      endTime: '',
      notes: props.assignment.notes || ''
    }
    
    // If end time exists, set it
    if (props.assignment.endTime) {
      const endDate = new Date(props.assignment.endTime)
      const endHours = endDate.getHours().toString().padStart(2, '0')
      const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
      form.value.endTime = `${endHours}:${endMinutes}`
    }
  }
})
</script>

<style scoped>
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

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
}

.form-note {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-top: var(--spacing-xs);
}

.time-inputs {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.time-input-group {
  flex: 1;
}

.time-input-group label {
  display: block;
  font-size: var(--font-size-xs);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-secondary);
}

.time-separator {
  display: block;
  margin-top: 2rem;
  color: var(--color-text-light);
}

/* Buttons */
.btn-primary, .btn-secondary {
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

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-card-alt, #f9f9f9);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border-light);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .time-inputs {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .time-separator {
    display: none;
  }
}
</style>
