import { supabase } from '@/utils/supabase'
import type { PorterAssignment, SupabasePorterAssignment } from '@/types'
import { nanoid } from 'nanoid'

// Transform Supabase porter assignment to app format
export function transformPorterAssignmentFromSupabase(data: any): PorterAssignment {
  return {
    id: data.id,
    porterId: data.porter_id,
    departmentId: data.department_id,
    startTime: data.start_time,
    endTime: data.end_time || undefined,
    notes: data.notes || undefined
  }
}

// Transform app porter assignment to Supabase format
export function transformPorterAssignmentToSupabase(
  assignment: PorterAssignment | Omit<PorterAssignment, 'id'>, 
  shiftId: string
): SupabasePorterAssignment {
  return {
    id: 'id' in assignment ? assignment.id : nanoid(),
    shift_id: shiftId,
    porter_id: assignment.porterId,
    department_id: assignment.departmentId,
    start_time: assignment.startTime,
    end_time: assignment.endTime || null,
    notes: assignment.notes || null
  }
}

// Add a new porter assignment
export async function addPorterAssignment(
  shiftId: string,
  assignment: {
    porterId: string;
    departmentId: string;
    startTime: string;
    endTime?: string;
    notes?: string;
  }
): Promise<PorterAssignment> {
  const newAssignment = transformPorterAssignmentToSupabase(assignment, shiftId)
  
  const { data, error } = await supabase
    .from('porter_assignments')
    .insert(newAssignment)
    .select('*')
    .single()
  
  if (error) throw error
  
  return transformPorterAssignmentFromSupabase(data)
}

// Update a porter assignment
export async function updatePorterAssignment(
  assignmentId: string,
  updates: Partial<{
    departmentId: string;
    endTime: string;
    notes: string;
  }>
): Promise<PorterAssignment> {
  // Build update object
  const updateObj: any = {}
  
  if (updates.departmentId !== undefined) updateObj.department_id = updates.departmentId
  if (updates.endTime !== undefined) updateObj.end_time = updates.endTime
  if (updates.notes !== undefined) updateObj.notes = updates.notes
  
  // Update the assignment
  const { data, error } = await supabase
    .from('porter_assignments')
    .update(updateObj)
    .eq('id', assignmentId)
    .select('*')
    .single()
  
  if (error) throw error
  
  return transformPorterAssignmentFromSupabase(data)
}

// Delete a porter assignment
export async function deletePorterAssignment(assignmentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('porter_assignments')
    .delete()
    .eq('id', assignmentId)
  
  if (error) throw error
  
  return true
}

// Get porter assignments by shift
export async function getPorterAssignmentsByShift(shiftId: string): Promise<PorterAssignment[]> {
  const { data, error } = await supabase
    .from('porter_assignments')
    .select('*')
    .eq('shift_id', shiftId)
    .order('start_time', { ascending: true })
  
  if (error) throw error
  
  return data.map(transformPorterAssignmentFromSupabase)
}

// Get active porter assignments
export async function getActivePorterAssignments(shiftId: string): Promise<PorterAssignment[]> {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('porter_assignments')
    .select('*')
    .eq('shift_id', shiftId)
    .lte('start_time', now) // Has started
    .or(`end_time.is.null, end_time.gt.${now}`) // Hasn't ended
  
  if (error) throw error
  
  return data.map(transformPorterAssignmentFromSupabase)
}

// Get porter assignment by ID
export async function getPorterAssignment(assignmentId: string): Promise<PorterAssignment> {
  const { data, error } = await supabase
    .from('porter_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()
  
  if (error) throw error
  
  return transformPorterAssignmentFromSupabase(data)
}
