import { defineStore } from 'pinia'

// Import core state and computed properties
import { 
  currentShift, 
  archivedShifts, 
  isLoading, 
  error, 
  isLoaded,
  isShiftActive,
  pendingTasks,
  completedTasks,
  porterAssignments,
  currentPorterAssignments
} from './shiftCore'

// Import loader functions
import {
  loadShiftData,
  loadCurrentShift,
  loadArchivedShifts,
  getShift
} from './shiftLoader'

// Import current shift management functions
import {
  startShift,
  endShift,
  addPorterToShift,
  removePorterFromShift,
  reopenShift,
  deleteShift
} from './currentShiftManager'

// Import task management functions
import {
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTask
} from './taskManager'

// Import porter assignment management functions
import {
  addPorterAssignment,
  updatePorterAssignment,
  deletePorterAssignment,
  getCurrentPorterAssignments,
  getPorterActiveAssignments,
  getDepartmentActiveAssignments
} from './porterAssignmentManager'

/**
 * Unified shift store that combines all functions from the modular files
 */
export const useShiftStore = defineStore('shift', () => {
  // Return all the state, computed properties, and functions
  return {
    // State
    currentShift,
    archivedShifts,
    isLoading,
    error,
    isLoaded,

    // Computed
    isShiftActive,
    pendingTasks,
    completedTasks,
    porterAssignments,
    currentPorterAssignments,

    // Loader functions
    loadShiftData,
    loadCurrentShift,
    loadArchivedShifts,
    getShift,

    // Shift management functions
    startShift,
    endShift,
    addPorterToShift,
    removePorterFromShift,
    reopenShift,
    deleteShift,

    // Task management functions
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getTask,

    // Porter assignment management functions
    addPorterAssignment,
    updatePorterAssignment,
    deletePorterAssignment,
    getCurrentPorterAssignments,
    getPorterActiveAssignments,
    getDepartmentActiveAssignments
  }
})
