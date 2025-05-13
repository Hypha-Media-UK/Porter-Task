import { nanoid } from 'nanoid'
import type { Shift, ShiftType } from '@/types'
import * as db from '@/services/database'
import { 
  currentShift, 
  archivedShifts, 
  CURRENT_SHIFT_STORAGE_KEY,
  ARCHIVED_SHIFTS_STORAGE_KEY,
  saveCurrentShiftToLocalStorage,
  saveArchivedShiftsToLocalStorage,
  clearCurrentShiftFromLocalStorage
} from './shiftCore'

/**
 * Start a new shift
 */
export async function startShift(type: ShiftType, supervisor: string): Promise<Shift> {
  if (currentShift.value) {
    throw new Error('Cannot start a new shift while one is already active')
  }
  
  const now = new Date()
  
  // Generate a consistent ID that will be used both locally and in the database
  const shiftId = nanoid();
  
  const shiftData = {
    id: shiftId, // Ensure the same ID is used in both places
    date: now.toISOString().split('T')[0],
    type,
    supervisor,
    startTime: now.toISOString()
  }
  
  // Create a complete shift object that can be used in both local and database cases
  const completeShift: Shift = {
    id: shiftId,
    date: now.toISOString().split('T')[0],
    type,
    supervisor,
    startTime: now.toISOString(),
    tasks: [],
    assignedPorters: [],
    porterAssignments: []
  };
  
  let dbSuccess = false;
  
  try {
    // Create the shift in the database
    const shift = await db.createShift(shiftData)
    
    // Set as current shift with defaults for arrays
    const newShift: Shift = {
      ...shift,
      assignedPorters: [],
      porterAssignments: [],
      tasks: []
    }
    
    currentShift.value = newShift
    dbSuccess = true;
    
    // Save to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    console.log('Shift started:', currentShift.value)
    
    return currentShift.value
  } catch (err) {
    console.error('Error starting shift in database:', err)
    
    // Set the fallback shift with the same ID we would have used in the database
    currentShift.value = completeShift;
    
    // Save to localStorage to persist across page refreshes
    saveCurrentShiftToLocalStorage()
    
    // Store a flag to indicate this shift only exists locally
    localStorage.setItem('shift-' + shiftId + '-local-only', 'true');
    
    console.log('Shift started locally only (not in database):', completeShift)
    
    return completeShift
  }
}

/**
 * End the current shift
 */
export async function endShift(): Promise<boolean> {
  if (!currentShift.value) {
    throw new Error('No active shift to end')
  }
  
  const now = new Date()
  const endTime = now.toISOString()
  
  try {
    // End shift in database
    await db.endShift(currentShift.value.id, endTime)
    
    // Update local state
    if (currentShift.value) {
      currentShift.value.endTime = endTime
      
      // Add to archived shifts - create a copy to avoid reference issues
      const shiftToArchive = { ...currentShift.value } as Shift
      archivedShifts.value.unshift(shiftToArchive)
    }
    
    // Save archived shift to localStorage as fallback
    try {
      saveArchivedShiftsToLocalStorage()
    } catch (err) {
      console.error('Error saving archived shifts to localStorage:', err)
    }
    
    console.log('Shift ended:', currentShift.value)
    
    // Clear current shift
    const oldShift = currentShift.value
    currentShift.value = null
    clearCurrentShiftFromLocalStorage()
    
    // Force navigation state update to trigger reactivity
    window.dispatchEvent(new CustomEvent('shift-ended'))
    
    return true
  } catch (err) {
    console.error('Error ending shift in database:', err)
    
    // Update local state only if database fails
    if (currentShift.value) {
      currentShift.value.endTime = endTime
      
      // Add to archived shifts - create a copy to avoid reference issues
      const shiftToArchive = { ...currentShift.value } as Shift
      archivedShifts.value.unshift(shiftToArchive)
    }
    
    // Save archived shift to localStorage
    try {
      saveArchivedShiftsToLocalStorage()
    } catch (err) {
      console.error('Error saving archived shifts to localStorage:', err)
    }
    
    console.log('Shift ended locally:', currentShift.value)
    
    // Clear current shift
    currentShift.value = null
    clearCurrentShiftFromLocalStorage()
    
    // Force navigation state update to trigger reactivity
    window.dispatchEvent(new CustomEvent('shift-ended'))
    
    return true
  }
}

/**
 * Add a porter to the current shift
 */
export async function addPorterToShift(porterName: string): Promise<boolean> {
  if (!currentShift.value) {
    throw new Error('No active shift to add porter to')
  }
  
  // Initialize assignedPorters array if it doesn't exist
  if (!currentShift.value.assignedPorters) {
    currentShift.value.assignedPorters = []
  }
  
  // Check if porter is already assigned
  if (currentShift.value.assignedPorters.includes(porterName)) {
    console.warn(`Porter ${porterName} is already assigned to this shift`)
    return false
  }
  
  try {
    // Add porter to shift in database
    await db.addPorterToShift(currentShift.value.id, porterName)
    
    // Update local state
    currentShift.value.assignedPorters.push(porterName)
    
    // Save to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    console.log(`Porter ${porterName} added to shift`)
    return true
  } catch (err) {
    console.error(`Error adding porter to shift in database:`, err)
    
    // Add porter to local state only if database fails
    currentShift.value.assignedPorters.push(porterName)
    
    // Save to localStorage
    saveCurrentShiftToLocalStorage()
    
    console.log(`Porter ${porterName} added to shift locally`)
    return true
  }
}

/**
 * Remove a porter from the current shift
 */
export async function removePorterFromShift(porterName: string): Promise<boolean> {
  if (!currentShift.value || !currentShift.value.assignedPorters) {
    throw new Error('No active shift or no assigned porters')
  }
  
  // Find porter index
  const porterIndex = currentShift.value.assignedPorters.indexOf(porterName)
  
  if (porterIndex === -1) {
    console.warn(`Porter ${porterName} is not assigned to this shift`)
    return false
  }
  
  try {
    // Remove porter from shift in database
    await db.removePorterFromShift(currentShift.value.id, porterName)
    
    // Update local state
    currentShift.value.assignedPorters.splice(porterIndex, 1)
    
    // Save to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    console.log(`Porter ${porterName} removed from shift`)
    return true
  } catch (err) {
    console.error(`Error removing porter from shift in database:`, err)
    
    // Remove porter from local state only if database fails
    currentShift.value.assignedPorters.splice(porterIndex, 1)
    
    // Save to localStorage
    saveCurrentShiftToLocalStorage()
    
    console.log(`Porter ${porterName} removed from shift locally`)
    return true
  }
}

/**
 * Reopen an archived shift
 */
export async function reopenShift(shiftId: string): Promise<Shift> {
  // Find the shift in archived shifts
  const shiftIndex = archivedShifts.value.findIndex(s => s.id === shiftId)
  
  if (shiftIndex === -1) {
    throw new Error(`Shift with ID ${shiftId} not found`)
  }
  
  // Check if there's already an active shift
  if (currentShift.value) {
    throw new Error('Cannot reopen a shift while another is active. Please end the current shift first.')
  }
  
  // Get the shift from archived shifts (make a deep copy)
  const shiftCopy = JSON.parse(JSON.stringify(archivedShifts.value[shiftIndex])) as Shift
  
  try {
    // Reopen the shift in database
    const reopenedShift = await db.reopenShift(shiftId)
    
    if (!reopenedShift) {
      throw new Error(`Failed to reopen shift with ID ${shiftId}`)
    }
    
    // Set as current shift
    currentShift.value = reopenedShift
    
    // Remove from archived shifts
    archivedShifts.value.splice(shiftIndex, 1)
    
    // Update localStorage as fallback
    try {
      // Update current shift in localStorage
      saveCurrentShiftToLocalStorage()
      
      // Update archived shifts in localStorage
      saveArchivedShiftsToLocalStorage()
      
      console.log('Shift reopened and localStorage updated:', reopenedShift)
    } catch (storageErr) {
      console.error('Error updating localStorage after reopening shift:', storageErr)
    }
    
    return reopenedShift
  } catch (err) {
    console.error('Error reopening shift in database:', err)
    
    // Remove endTime to make it active again
    delete shiftCopy.endTime
    
    // Set as current shift
    currentShift.value = shiftCopy
    
    // Remove from archived shifts
    archivedShifts.value.splice(shiftIndex, 1)
    
    // Update localStorage
    try {
      // Update current shift in localStorage
      saveCurrentShiftToLocalStorage()
      
      // Update archived shifts in localStorage
      saveArchivedShiftsToLocalStorage()
      
      console.log('Shift reopened locally and localStorage updated:', shiftCopy)
    } catch (storageErr) {
      console.error('Error updating localStorage after reopening shift:', storageErr)
    }
    
    return shiftCopy
  }
}

/**
 * Delete an archived shift
 */
export async function deleteShift(shiftId: string): Promise<boolean> {
  // Find shift index
  const shiftIndex = archivedShifts.value.findIndex(s => s.id === shiftId)
  
  if (shiftIndex === -1) {
    throw new Error(`Shift with ID ${shiftId} not found`)
  }
  
  try {
    // Delete the shift from database
    await db.deleteShift(shiftId)
    
    // Remove the shift from archived shifts
    archivedShifts.value.splice(shiftIndex, 1)
    
    // Update localStorage to persist the deletion as fallback
    try {
      saveArchivedShiftsToLocalStorage()
      console.log('Shift deleted and localStorage updated:', shiftId)
    } catch (storageErr) {
      console.error('Error updating localStorage after shift deletion:', storageErr)
      // Even if localStorage update fails, keep the state updated
    }
    
    return true
  } catch (err) {
    console.error('Error deleting shift from database:', err)
    
    // Remove the shift from archived shifts locally if database fails
    archivedShifts.value.splice(shiftIndex, 1)
    
    // Update localStorage to persist the deletion
    try {
      saveArchivedShiftsToLocalStorage()
      console.log('Shift deleted locally and localStorage updated:', shiftId)
    } catch (storageErr) {
      console.error('Error updating localStorage after shift deletion:', storageErr)
      // Even if localStorage update fails, keep the state updated
    }
    
    return true
  }
}
