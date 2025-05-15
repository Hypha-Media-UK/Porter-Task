import { supabase } from '@/utils/supabase'
import type { Shift, SupabaseShift, SupabaseShiftAssignedPorter } from '@/types'
import { nanoid } from 'nanoid'
import { populateTasksLocationDisplayNames } from '@/utils/locationUtils'

// Transform Supabase shift to app shift
export function transformShiftFromSupabase(data: any): Shift | null {
  if (!data) return null

  const transformedShift: Shift = {
    id: data.id,
    date: data.date,
    type: data.type,
    supervisor: data.supervisor,
    startTime: data.start_time,
    endTime: data.end_time,
    isActive: data.is_active || false,
    tasks: [], // Will be filled later if tasks are included
    assignedPorters: [], // Will be filled if porter_assignments are included
    porterAssignments: [] // Will be filled if porter_assignments are included
  }

  // Transform tasks if included
  if (data.tasks && Array.isArray(data.tasks)) {
    // First transform the tasks with empty display names
    const tasksWithoutDisplayNames = data.tasks.map((task: any) => ({
      id: task.id,
      receivedTime: task.received_time,
      allocatedTime: task.allocated_time,
      completedTime: task.completed_time,
      status: task.status,
      jobCategory: task.job_category,
      itemType: task.item_type,
      allocatedStaff: task.allocated_staff,
      fromLocation: {
        building: task.from_building,
        locationId: task.from_location_id,
        displayName: '' // Will be populated by populateTasksLocationDisplayNames
      },
      toLocation: {
        building: task.to_building,
        locationId: task.to_location_id,
        displayName: '' // Will be populated by populateTasksLocationDisplayNames
      }
    }))
    
    // Populate the display names for all tasks
    try {
      transformedShift.tasks = populateTasksLocationDisplayNames(tasksWithoutDisplayNames)
    } catch (error) {
      console.warn('Could not populate location display names for tasks:', error)
      transformedShift.tasks = tasksWithoutDisplayNames
    }
  }

  // Transform assigned porters if included
  if (data.shift_assigned_porters && Array.isArray(data.shift_assigned_porters)) {
    transformedShift.assignedPorters = data.shift_assigned_porters.map((p: any) => p.porter_id)
  }

  // Transform porter assignments if included
  if (data.porter_assignments && Array.isArray(data.porter_assignments)) {
    transformedShift.porterAssignments = data.porter_assignments.map((pa: any) => ({
      id: pa.id,
      porterId: pa.porter_id,
      departmentId: pa.department_id,
      startTime: pa.start_time,
      endTime: pa.end_time,
      notes: pa.notes
    }))
  }

  return transformedShift
}

// Transform app shift to Supabase format
export function transformShiftToSupabase(shift: Shift): SupabaseShift {
  return {
    id: shift.id,
    date: shift.date,
    type: shift.type,
    supervisor: shift.supervisor,
    start_time: shift.startTime,
    end_time: shift.endTime || null,
    is_active: shift.isActive
  }
}

// Get current active shift (using is_active flag)
export async function getCurrentShift() {
  try {
    console.log('Fetching current active shift from database...');
    
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        tasks(*),
        shift_assigned_porters(*),
        porter_assignments(*)
      `)
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching current shift:', error)
      return null
    }
    
    // Check if we have a valid shift
    if (data) {
      console.log('Active shift found:', data.id);
      const transformedShift = transformShiftFromSupabase(data);
      
      // Make sure sessionStorage is updated with this shift
      if (transformedShift?.id) {
        sessionStorage.setItem('porter-track-current-shift-id', transformedShift.id);
      }
      
      return transformedShift;
    } else {
      console.log('No active shift found in database');
      // Clear any stale session data
      sessionStorage.removeItem('porter-track-current-shift-id');
      return null;
    }
  } catch (err) {
    console.error('Unexpected error fetching current shift:', err);
    return null;
  }
}

// Get all archived shifts (with end_time)
export async function getArchivedShifts() {
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      *,
      tasks(*),
      shift_assigned_porters(*),
      porter_assignments(*)
    `)
    .not('end_time', 'is', null)
    .order('start_time', { ascending: false })
  
  if (error) throw error
  
  return data.map(transformShiftFromSupabase)
}

// Get a specific shift by ID
export async function getShift(shiftId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      *,
      tasks(*),
      shift_assigned_porters(*),
      porter_assignments(*)
    `)
    .eq('id', shiftId)
    .single()
  
  if (error) throw error
  
  return transformShiftFromSupabase(data)
}

// Create a new shift
export async function createShift(shiftData: { 
  date: string, 
  type: 'Day' | 'Night', 
  supervisor: string, 
  startTime: string 
}) {
  const newShift: SupabaseShift = {
    id: nanoid(),
    date: shiftData.date,
    type: shiftData.type,
    supervisor: shiftData.supervisor,
    start_time: shiftData.startTime,
    end_time: null,
    is_active: true // Mark as active when creating a new shift
  }
  
  const { data, error } = await supabase
    .from('shifts')
    .insert(newShift)
    .select('*')
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    date: data.date,
    type: data.type,
    supervisor: data.supervisor,
    startTime: data.start_time,
    endTime: data.end_time,
    tasks: []
  }
}

// End an active shift
export async function endShift(shiftId: string, endTime: string) {
  const { error } = await supabase
    .from('shifts')
    .update({ 
      end_time: endTime,
      is_active: false // Set active flag to false when ending a shift
    })
    .eq('id', shiftId)
  
  if (error) throw error
  
  return true
}

// Reopen an archived shift
export async function reopenShift(shiftId: string) {
  const { error } = await supabase
    .from('shifts')
    .update({ 
      end_time: null,
      is_active: true // Set active flag to true when reopening
    })
    .eq('id', shiftId)
  
  if (error) throw error
  
  return getShift(shiftId)
}

// Delete a shift
export async function deleteShift(shiftId: string) {
  // Delete all related tasks first (cascade is not always reliable)
  await supabase.from('tasks').delete().eq('shift_id', shiftId)
  
  // Delete all porter assignments
  await supabase.from('porter_assignments').delete().eq('shift_id', shiftId)
  
  // Delete all assigned porters
  await supabase.from('shift_assigned_porters').delete().eq('shift_id', shiftId)
  
  // Then delete the shift
  const { error } = await supabase.from('shifts').delete().eq('id', shiftId)
  
  if (error) throw error
  
  return true
}

// Add a porter to a shift
export async function addPorterToShift(shiftId: string, porterId: string) {
  const porterAssignment: SupabaseShiftAssignedPorter = {
    id: nanoid(),
    shift_id: shiftId,
    porter_id: porterId
  }
  
  const { error } = await supabase
    .from('shift_assigned_porters')
    .insert(porterAssignment)
  
  if (error) throw error
  
  return true
}

// Remove a porter from a shift
export async function removePorterFromShift(shiftId: string, porterId: string) {
  const { error } = await supabase
    .from('shift_assigned_porters')
    .delete()
    .eq('shift_id', shiftId)
    .eq('porter_id', porterId)
  
  if (error) throw error
  
  return true
}
