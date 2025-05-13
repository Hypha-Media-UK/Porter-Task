import { nanoid } from 'nanoid'
import type { PorterAssignment } from '@/types'
import * as db from '@/services/database'
import { 
  currentShift, 
  saveCurrentShiftToLocalStorage
} from './shiftCore'

/**
 * Add a department assignment for a porter
 */
export async function addPorterAssignment(assignment: {
  porterId: string;
  departmentId: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  notes?: string;
}): Promise<PorterAssignment> {
  if (!currentShift.value) {
    throw new Error('Cannot create assignment without an active shift')
  }
  
  // Ensure the porter is assigned to this shift
  if (!currentShift.value.assignedPorters || !currentShift.value.assignedPorters.includes(assignment.porterId)) {
    throw new Error(`Porter ${assignment.porterId} is not assigned to this shift`)
  }
  
  try {
    // Add assignment to database
    const newAssignment = await db.addPorterAssignment(
      currentShift.value.id,
      assignment
    )
    
    // Initialize porterAssignments array if it doesn't exist
    if (!currentShift.value.porterAssignments) {
      currentShift.value.porterAssignments = []
    }
    
    // Add assignment to shift
    currentShift.value.porterAssignments.push(newAssignment)
    
    // Save to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    console.log('Porter assignment created:', newAssignment)
    
    return newAssignment
  } catch (err) {
    console.error('Error creating porter assignment in database:', err)
    
    // Create assignment locally if database fails
    const newAssignment: PorterAssignment = {
      id: nanoid(),
      porterId: assignment.porterId,
      departmentId: assignment.departmentId,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
      notes: assignment.notes
    }
    
    // Initialize porterAssignments array if it doesn't exist
    if (!currentShift.value.porterAssignments) {
      currentShift.value.porterAssignments = []
    }
    
    // Add assignment to shift
    currentShift.value.porterAssignments.push(newAssignment)
    
    // Save to localStorage
    saveCurrentShiftToLocalStorage()
    
    console.log('Porter assignment created locally:', newAssignment)
    
    return newAssignment
  }
}

/**
 * Update a porter assignment
 */
export async function updatePorterAssignment(
  assignmentId: string,
  updates: {
    departmentId?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }
): Promise<PorterAssignment> {
  if (!currentShift.value || !currentShift.value.porterAssignments) {
    throw new Error('No active shift or no porter assignments')
  }
  
  const assignmentIndex = currentShift.value.porterAssignments.findIndex(a => a.id === assignmentId)
  
  if (assignmentIndex === -1) {
    throw new Error(`Assignment with ID ${assignmentId} not found`)
  }
  
  try {
    // Update assignment in database
    const updatedAssignment = await db.updatePorterAssignment(assignmentId, updates)
    
    // Update in local state
    currentShift.value.porterAssignments[assignmentIndex] = updatedAssignment
    
    // Save to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    console.log('Porter assignment updated:', updatedAssignment)
    
    return updatedAssignment
  } catch (err) {
    console.error('Error updating porter assignment in database:', err)
    
    // Update assignment locally if database fails
    const assignment = currentShift.value.porterAssignments[assignmentIndex]
    const updatedAssignment: PorterAssignment = {
      ...assignment,
      ...updates
    }
    
    // Update in local state
    currentShift.value.porterAssignments[assignmentIndex] = updatedAssignment
    
    // Save to localStorage
    saveCurrentShiftToLocalStorage()
    
    console.log('Porter assignment updated locally:', updatedAssignment)
    
    return updatedAssignment
  }
}

/**
 * Delete a porter assignment
 */
export async function deletePorterAssignment(assignmentId: string): Promise<boolean> {
  if (!currentShift.value || !currentShift.value.porterAssignments) {
    throw new Error('No active shift or no porter assignments')
  }
  
  const assignmentIndex = currentShift.value.porterAssignments.findIndex(a => a.id === assignmentId)
  
  if (assignmentIndex === -1) {
    throw new Error(`Assignment with ID ${assignmentId} not found`)
  }
  
  try {
    // Delete assignment from database
    await db.deletePorterAssignment(assignmentId)
    
    // Remove from local state
    currentShift.value.porterAssignments.splice(assignmentIndex, 1)
    
    // Save to localStorage as fallback
    saveCurrentShiftToLocalStorage()
    
    console.log('Porter assignment deleted:', assignmentId)
    
    return true
  } catch (err) {
    console.error('Error deleting porter assignment from database:', err)
    
    // Remove from local state if database fails
    currentShift.value.porterAssignments.splice(assignmentIndex, 1)
    
    // Save to localStorage
    saveCurrentShiftToLocalStorage()
    
    console.log('Porter assignment deleted locally:', assignmentId)
    
    return true
  }
}

/**
 * Get all current active porter assignments
 */
export function getCurrentPorterAssignments(): PorterAssignment[] {
  if (!currentShift.value || !currentShift.value.porterAssignments) {
    return []
  }
  
  const now = new Date().toISOString()
  
  // Return assignments that are currently active (started and not ended, or ended in future)
  return currentShift.value.porterAssignments.filter(assignment => {
    const hasStarted = assignment.startTime <= now
    const hasNotEnded = !assignment.endTime || assignment.endTime > now
    return hasStarted && hasNotEnded
  })
}

/**
 * Find active assignments for a specific porter
 */
export function getPorterActiveAssignments(porterId: string): PorterAssignment[] {
  if (!currentShift.value || !currentShift.value.porterAssignments) {
    return []
  }
  
  const now = new Date().toISOString()
  
  return currentShift.value.porterAssignments.filter(assignment => {
    const isRightPorter = assignment.porterId === porterId
    const hasStarted = assignment.startTime <= now
    const hasNotEnded = !assignment.endTime || assignment.endTime > now
    return isRightPorter && hasStarted && hasNotEnded
  })
}

/**
 * Find current assignments for a specific department
 */
export function getDepartmentActiveAssignments(departmentId: string): PorterAssignment[] {
  if (!currentShift.value || !currentShift.value.porterAssignments) {
    return []
  }
  
  const now = new Date().toISOString()
  
  return currentShift.value.porterAssignments.filter(assignment => {
    const isRightDepartment = assignment.departmentId === departmentId
    const hasStarted = assignment.startTime <= now
    const hasNotEnded = !assignment.endTime || assignment.endTime > now
    return isRightDepartment && hasStarted && hasNotEnded
  })
}
