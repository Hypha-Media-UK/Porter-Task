import { ref, computed } from 'vue'
import type { Shift, Task, PorterAssignment } from '@/types'

// State - exported for use in store modules
export const currentShift = ref<Shift | null>(null)
export const archivedShifts = ref<Shift[]>([])
export const isLoading = ref(false)
export const error = ref<string | null>(null)

// LocalStorage keys for fallback
export const CURRENT_SHIFT_STORAGE_KEY = 'porter-track-current-shift'
export const ARCHIVED_SHIFTS_STORAGE_KEY = 'porter-track-archived-shifts'
// Add session storage key for persistent shift ID
export const CURRENT_SHIFT_ID_SESSION_KEY = 'porter-track-current-shift-id'

// Computed values
export const isShiftActive = computed(() => !!currentShift.value)

export const pendingTasks = computed(() => {
  if (!currentShift.value) return []
  return currentShift.value.tasks.filter(task => task.status === 'Pending')
})

export const completedTasks = computed(() => {
  if (!currentShift.value) return []
  return currentShift.value.tasks.filter(task => task.status === 'Completed')
})

// Porter assignments computed properties
export const porterAssignments = computed(() => {
  if (!currentShift.value || !currentShift.value.porterAssignments) return []
  return currentShift.value.porterAssignments
})

export const currentPorterAssignments = computed(() => {
  if (!currentShift.value || !currentShift.value.porterAssignments) return []
  
  const now = new Date().toISOString()
  
  // Return assignments that are currently active (started and not ended, or ended in future)
  return currentShift.value.porterAssignments.filter(assignment => {
    const hasStarted = assignment.startTime <= now
    const hasNotEnded = !assignment.endTime || assignment.endTime > now
    return hasStarted && hasNotEnded
  })
})

// Utility functions for shift management
export function saveCurrentShiftToLocalStorage() {
  if (currentShift.value) {
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    // Also save the shift ID in sessionStorage for persistent session across refreshes
    sessionStorage.setItem(CURRENT_SHIFT_ID_SESSION_KEY, currentShift.value.id)
  }
}

export function saveArchivedShiftsToLocalStorage() {
  localStorage.setItem(ARCHIVED_SHIFTS_STORAGE_KEY, JSON.stringify(archivedShifts.value))
}

export function clearCurrentShiftFromLocalStorage() {
  localStorage.removeItem(CURRENT_SHIFT_STORAGE_KEY)
  sessionStorage.removeItem(CURRENT_SHIFT_ID_SESSION_KEY)
}

// Force a UI update (used when updating task status to refresh computed properties)
export function forceShiftUpdate() {
  if (currentShift.value) {
    // Create a shallow copy of tasks to trigger reactivity
    currentShift.value = {
      ...currentShift.value,
      tasks: [...currentShift.value.tasks]
    }
  }
}

// Helper to ensure arrays exist on the shift object
export function ensureShiftArrays(shift: Shift) {
  if (!shift.assignedPorters) {
    shift.assignedPorters = []
  }
  
  if (!shift.porterAssignments) {
    shift.porterAssignments = []
  }
  
  if (!shift.tasks) {
    shift.tasks = []
  }
  
  return shift
}
