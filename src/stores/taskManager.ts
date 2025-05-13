import { nanoid } from 'nanoid'
import type { Task, TaskStatus, Location } from '@/types'
import * as db from '@/services/database'
import { 
  currentShift, 
  archivedShifts,
  saveCurrentShiftToLocalStorage,
  saveArchivedShiftsToLocalStorage,
  forceShiftUpdate  // Import the new utility
} from './shiftCore'

/**
 * Create a new task
 */
export async function createTask(taskData: {
  jobCategory: string;
  itemType: string;
  fromLocation: Location;
  toLocation: Location;
  allocatedStaff?: string;
  receivedTime?: string;
  allocatedTime?: string;
  completedTime?: string;
  status?: TaskStatus;
}): Promise<Task> {
  if (!currentShift.value) {
    throw new Error('Cannot create task without an active shift')
  }
  
  const now = new Date()
  const shiftId = currentShift.value.id
  
  // Check if this shift is local-only (doesn't exist in Supabase)
  const isLocalOnly = localStorage.getItem('shift-' + shiftId + '-local-only') === 'true'
  
  const newTaskData = {
    receivedTime: taskData.receivedTime || now.toISOString(),
    allocatedTime: taskData.allocatedTime || now.toISOString(),
    status: taskData.status || 'Pending',
    ...taskData
  }
  
  // If we know this is a local-only shift, don't try to create task in database
  if (isLocalOnly) {
    console.log('Shift exists only locally, creating task locally without database attempt')
    
    // Create task locally
    const task: Task = {
      id: nanoid(),
      ...newTaskData
    }
    
    // Add to current shift
    currentShift.value.tasks.unshift(task)
    
    // Save updated shift to localStorage
    saveCurrentShiftToLocalStorage()
    
    // Force UI update to refresh computed properties
    forceShiftUpdate()
    
    console.log('Task created locally (local-only shift):', task)
    
    return task
  }
  
  // Normal path - try database first, fall back to local
  try {
    // First try to ensure the shift exists in the database
    await ensureShiftExistsInDatabase()
    
    // Create task in database
    const task = await db.createTask(currentShift.value.id, newTaskData)
    
    // Add to current shift
    currentShift.value.tasks.unshift(task)
    
    // Save updated shift to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    // Force UI update to refresh computed properties
    forceShiftUpdate()
    
    console.log('Task created:', task)
    
    return task
  } catch (err) {
    console.error('Error creating task in database:', err)
    
    // Create task locally if database fails
    const task: Task = {
      id: nanoid(),
      ...newTaskData
    }
    
    // Add to current shift
    currentShift.value.tasks.unshift(task)
    
    // Save updated shift to localStorage
    saveCurrentShiftToLocalStorage()
    
    // Force UI update to refresh computed properties
    forceShiftUpdate()
    
    // Mark this shift as local-only to avoid future database attempts
    localStorage.setItem('shift-' + shiftId + '-local-only', 'true')
    
    console.log('Task created locally:', task)
    
    return task
  }
}

/**
 * Helper function to ensure the current shift exists in the database
 * before trying to create a task. This helps when the app has been
 * restarted and the local state thinks a shift exists but it wasn't
 * actually created in the database.
 */
async function ensureShiftExistsInDatabase(): Promise<void> {
  if (!currentShift.value) return;

  try {
    // Try to fetch the shift from the database to confirm it exists
    const shift = await db.getShift(currentShift.value.id);
    
    // If it doesn't exist but we have it locally, recreate it
    if (!shift) {
      console.log('Shift not found in database, attempting to recreate it');
      
      // Recreate the shift in the database
      const shiftData = {
        id: currentShift.value.id,
        date: currentShift.value.date,
        type: currentShift.value.type,
        supervisor: currentShift.value.supervisor,
        startTime: currentShift.value.startTime
      };
      
      await db.createShift(shiftData);
      console.log('Shift recreated in database');
    }
  } catch (err) {
    console.error('Error checking/recreating shift in database:', err);
    throw err; // Rethrow so caller knows this failed
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  if (!currentShift.value) {
    throw new Error('No active shift')
  }
  
  const task = currentShift.value.tasks.find(t => t.id === taskId)
  
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`)
  }
  
  const now = new Date()
  task.status = status
  
  if (status === 'Completed') {
    task.completedTime = now.toISOString()
  }
  
  try {
    // Update task in database
    await db.updateTask(taskId, {
      status,
      completedTime: status === 'Completed' ? now.toISOString() : undefined
    })
    
    // Save updated shift to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    // Force UI update to refresh computed properties
    forceShiftUpdate()
    
    console.log('Task updated:', task)
    
    return task
  } catch (err) {
    console.error('Error updating task in database:', err)
    
    // Task is already updated in memory
    
    // Save updated shift to localStorage
    saveCurrentShiftToLocalStorage()
    
    // Force UI update to refresh computed properties
    forceShiftUpdate()
    
    console.log('Task updated locally:', task)
    
    return task
  }
}

/**
 * Update an existing task - works with both current and archived shifts
 */
export async function updateTask(taskId: string, taskData: {
  jobCategory: string;
  itemType: string;
  fromLocation: Location;
  toLocation: Location;
  allocatedStaff?: string;
  receivedTime?: string;
  allocatedTime?: string;
  completedTime?: string;
  status?: TaskStatus;
}): Promise<Task> {
  // First check in current shift
  if (currentShift.value) {
    const taskIndex = currentShift.value.tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex !== -1) {
      try {
        // Update the task in database
        const updatedTask = await db.updateTask(taskId, taskData)
        
        // Update the task in memory
        currentShift.value.tasks[taskIndex] = updatedTask
        
        // Save updated shift to localStorage as fallback
        saveCurrentShiftToLocalStorage()
        
        // Force UI update to refresh computed properties
        forceShiftUpdate()
        
        console.log('Task updated in database:', updatedTask)
        
        return updatedTask
      } catch (err) {
        console.error('Error updating task in database:', err)
        
        // Update the task locally if database fails
        const updatedTask: Task = {
          ...currentShift.value.tasks[taskIndex],
          ...taskData,
          id: taskId // Ensure ID remains the same
        }
        
        // Replace the task in the array
        currentShift.value.tasks[taskIndex] = updatedTask
        
        // Save updated shift to localStorage
        saveCurrentShiftToLocalStorage()
        
        // Force UI update to refresh computed properties
        forceShiftUpdate()
        
        console.log('Task updated locally:', updatedTask)
        
        return updatedTask
      }
    }
  }
  
  // If not found in current shift, check archived shifts
  for (let i = 0; i < archivedShifts.value.length; i++) {
    const shift = archivedShifts.value[i]
    const taskIndex = shift.tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex !== -1) {
      try {
        // Update the task in database
        const updatedTask = await db.updateTask(taskId, taskData)
        
        // Update the task in memory
        shift.tasks[taskIndex] = updatedTask
        
        // Save updated archived shifts to localStorage as fallback
        saveArchivedShiftsToLocalStorage()
        
        console.log('Task updated in archived shift in database:', updatedTask)
        
        return updatedTask
      } catch (err) {
        console.error('Error updating task in database:', err)
        
        // Update the task locally if database fails
        const updatedTask: Task = {
          ...shift.tasks[taskIndex],
          ...taskData,
          id: taskId // Ensure ID remains the same
        }
        
        // Replace the task in the array
        shift.tasks[taskIndex] = updatedTask
        
        // Save updated archived shifts to localStorage
        saveArchivedShiftsToLocalStorage()
        
        console.log('Task updated in archived shift locally:', updatedTask)
        
        return updatedTask
      }
    }
  }
  
  // If we get here, the task wasn't found in any shift
  throw new Error(`Task with ID ${taskId} not found in any shift`)
}

/**
 * Delete a task - works with both current and archived shifts
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  // First check in current shift
  if (currentShift.value) {
    const taskIndex = currentShift.value.tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex !== -1) {
      try {
        // Delete the task from database
        await db.deleteTask(taskId)
        
        // Remove the task from the array
        currentShift.value.tasks.splice(taskIndex, 1)
        
        // Save updated shift to localStorage as fallback
        saveCurrentShiftToLocalStorage()
        
        // Force UI update to refresh computed properties
        forceShiftUpdate()
        
        console.log('Task deleted from current shift:', taskId)
        
        return true
      } catch (err) {
        console.error('Error deleting task from database:', err)
        
        // Remove the task from the array locally if database fails
        currentShift.value.tasks.splice(taskIndex, 1)
        
        // Save updated shift to localStorage
        saveCurrentShiftToLocalStorage()
        
        // Force UI update to refresh computed properties
        forceShiftUpdate()
        
        console.log('Task deleted from current shift locally:', taskId)
        
        return true
      }
    }
  }
  
  // If not found in current shift, check archived shifts
  for (let i = 0; i < archivedShifts.value.length; i++) {
    const shift = archivedShifts.value[i]
    const taskIndex = shift.tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex !== -1) {
      try {
        // Delete the task from database
        await db.deleteTask(taskId)
        
        // Remove the task from the array
        shift.tasks.splice(taskIndex, 1)
        
        // Save updated archived shifts to localStorage as fallback
        saveArchivedShiftsToLocalStorage()
        
        console.log('Task deleted from archived shift:', taskId)
        
        return true
      } catch (err) {
        console.error('Error deleting task from database:', err)
        
        // Remove the task from the array locally if database fails
        shift.tasks.splice(taskIndex, 1)
        
        // Save updated archived shifts to localStorage
        saveArchivedShiftsToLocalStorage()
        
        console.log('Task deleted from archived shift locally:', taskId)
        
        return true
      }
    }
  }
  
  // If we get here, the task wasn't found in any shift
  throw new Error(`Task with ID ${taskId} not found in any shift`)
}

/**
 * Get task by ID - search in both current and archived shifts
 */
export function getTask(taskId: string): Task | null {
  // First check in current shift
  if (currentShift.value) {
    const task = currentShift.value.tasks.find(t => t.id === taskId)
    if (task) return task
  }
  
  // If not found and we have archived shifts, look there
  if (archivedShifts.value.length > 0) {
    for (const shift of archivedShifts.value) {
      const task = shift.tasks.find(t => t.id === taskId)
      if (task) return task
    }
  }
  
  // Not found anywhere
  return null
}
