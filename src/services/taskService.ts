import { supabase } from '@/utils/supabase'
import type { Task, SupabaseTask, Location } from '@/types'
import { nanoid } from 'nanoid'

// Transform app task to Supabase format
export function transformTaskToSupabase(task: Task, shiftId: string): SupabaseTask {
  return {
    id: task.id,
    shift_id: shiftId,
    received_time: task.receivedTime,
    allocated_time: task.allocatedTime,
    completed_time: task.completedTime || null,
    status: task.status,
    job_category: task.jobCategory,
    item_type: task.itemType,
    allocated_staff: task.allocatedStaff || null,
    from_building: task.fromLocation.building,
    from_location_id: task.fromLocation.locationId,
    to_building: task.toLocation.building,
    to_location_id: task.toLocation.locationId
  }
}

// Transform Supabase task to app format
export function transformTaskFromSupabase(data: any): Task {
  return {
    id: data.id,
    receivedTime: data.received_time,
    allocatedTime: data.allocated_time,
    completedTime: data.completed_time,
    status: data.status,
    jobCategory: data.job_category,
    itemType: data.item_type,
    allocatedStaff: data.allocated_staff,
    fromLocation: {
      building: data.from_building,
      locationId: data.from_location_id,
      displayName: '' // This will be filled in by the UI
    },
    toLocation: {
      building: data.to_building,
      locationId: data.to_location_id,
      displayName: '' // This will be filled in by the UI
    }
  }
}

// Create a new task
export async function createTask(shiftId: string, taskData: {
  jobCategory: string;
  itemType: string;
  fromLocation: Location;
  toLocation: Location;
  allocatedStaff?: string;
  receivedTime?: string;
  allocatedTime?: string;
  completedTime?: string;
  status?: 'Pending' | 'Completed';
}) {
  const now = new Date()
  
  const newTask: SupabaseTask = {
    id: nanoid(),
    shift_id: shiftId,
    received_time: taskData.receivedTime || now.toISOString(),
    allocated_time: taskData.allocatedTime || now.toISOString(),
    completed_time: taskData.completedTime || null,
    status: taskData.status || 'Pending',
    job_category: taskData.jobCategory,
    item_type: taskData.itemType,
    allocated_staff: taskData.allocatedStaff || null,
    from_building: taskData.fromLocation.building,
    from_location_id: taskData.fromLocation.locationId,
    to_building: taskData.toLocation.building,
    to_location_id: taskData.toLocation.locationId
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(newTask)
    .select('*')
    .single()
  
  if (error) throw error
  
  return transformTaskFromSupabase(data)
}

// Update a task
export async function updateTask(taskId: string, taskData: Partial<{
  jobCategory: string;
  itemType: string;
  fromLocation: Location;
  toLocation: Location;
  allocatedStaff: string;
  receivedTime: string;
  allocatedTime: string;
  completedTime: string;
  status: 'Pending' | 'Completed';
}>) {
  // First get the current task to merge with updates
  const { data: currentTask, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  
  if (fetchError) throw fetchError
  
  // Build update object
  const updateObj: any = {}
  
  if (taskData.jobCategory !== undefined) updateObj.job_category = taskData.jobCategory
  if (taskData.itemType !== undefined) updateObj.item_type = taskData.itemType
  if (taskData.allocatedStaff !== undefined) updateObj.allocated_staff = taskData.allocatedStaff
  if (taskData.receivedTime !== undefined) updateObj.received_time = taskData.receivedTime
  if (taskData.allocatedTime !== undefined) updateObj.allocated_time = taskData.allocatedTime
  if (taskData.completedTime !== undefined) updateObj.completed_time = taskData.completedTime
  if (taskData.status !== undefined) updateObj.status = taskData.status
  
  if (taskData.fromLocation) {
    updateObj.from_building = taskData.fromLocation.building
    updateObj.from_location_id = taskData.fromLocation.locationId
  }
  
  if (taskData.toLocation) {
    updateObj.to_building = taskData.toLocation.building
    updateObj.to_location_id = taskData.toLocation.locationId
  }
  
  // Update the task
  const { data, error } = await supabase
    .from('tasks')
    .update(updateObj)
    .eq('id', taskId)
    .select('*')
    .single()
  
  if (error) throw error
  
  return transformTaskFromSupabase(data)
}

// Delete a task
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error
  
  return true
}

// Get a task by ID
export async function getTask(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  
  if (error) throw error
  
  return transformTaskFromSupabase(data)
}

// Get tasks by shift ID
export async function getTasksByShift(shiftId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('shift_id', shiftId)
  
  if (error) throw error
  
  return data.map(transformTaskFromSupabase)
}
