import { nanoid } from 'nanoid';
import type { Task, TaskStatus, Location, SupabaseTask } from '@/types';
import { supabase } from '@/utils/supabase';
import { 
  fetchFromTable, 
  withRetry,
  isOnline
} from '@/utils/dataService';
import {
  insertWithOfflineSupport,
  updateWithOfflineSupport,
  deleteWithOfflineSupport
} from '@/utils/syncQueue';
import { populateLocationDisplayNames } from '@/utils/locationUtils';

// Helper to transform app task to Supabase format
function transformTaskToSupabase(task: Task, shiftId: string): SupabaseTask {
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
  };
}

// Helper to transform Supabase task to app format with reliable error handling
function transformTaskFromSupabase(data: any): Task {
  const task = {
    id: data.id,
    receivedTime: data.received_time,
    allocatedTime: data.allocated_time,
    completedTime: data.completed_time,
    status: data.status as TaskStatus,
    jobCategory: data.job_category,
    itemType: data.item_type,
    allocatedStaff: data.allocated_staff,
    fromLocation: {
      building: data.from_building,
      locationId: data.from_location_id,
      displayName: '' // Will be populated by populateLocationDisplayNames
    },
    toLocation: {
      building: data.to_building,
      locationId: data.to_location_id,
      displayName: '' // Will be populated by populateLocationDisplayNames
    }
  };
  
  // Populate location display names using the settings store
  try {
    return populateLocationDisplayNames(task);
  } catch (error) {
    console.warn('Could not populate location display names:', error);
    return task;
  }
}

/**
 * Create a new task with improved offline support and error handling
 */
export const createTask = withRetry(async function createTask(
  shiftId: string, 
  taskData: {
    jobCategory: string;
    itemType: string;
    fromLocation: Location;
    toLocation: Location;
    allocatedStaff?: string;
    receivedTime?: string;
    allocatedTime?: string;
    completedTime?: string;
    status?: TaskStatus;
  }
): Promise<Task> {
  const now = new Date();
  
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
  };
  
  // Use offline-aware insert
  const result = await insertWithOfflineSupport('tasks', newTask);
  
  // Transform to app format
  return transformTaskFromSupabase(Array.isArray(result) ? result[0] : result);
});

/**
 * Update a task with improved offline support and error handling
 */
export const updateTask = withRetry(async function updateTask(
  taskId: string, 
  taskData: Partial<{
    jobCategory: string;
    itemType: string;
    fromLocation: Location;
    toLocation: Location;
    allocatedStaff: string;
    receivedTime: string;
    allocatedTime: string;
    completedTime: string;
    status: TaskStatus;
  }>
): Promise<Task> {
  // First fetch the current task to ensure we have the complete data
  const currentTask = await getTask(taskId);
  if (!currentTask) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  
  // Prepare update object for Supabase format
  const updateObj: Record<string, any> = {};
  
  if (taskData.jobCategory !== undefined) updateObj.job_category = taskData.jobCategory;
  if (taskData.itemType !== undefined) updateObj.item_type = taskData.itemType;
  if (taskData.allocatedStaff !== undefined) updateObj.allocated_staff = taskData.allocatedStaff;
  if (taskData.receivedTime !== undefined) updateObj.received_time = taskData.receivedTime;
  if (taskData.allocatedTime !== undefined) updateObj.allocated_time = taskData.allocatedTime;
  if (taskData.completedTime !== undefined) updateObj.completed_time = taskData.completedTime;
  if (taskData.status !== undefined) updateObj.status = taskData.status;
  
  // Update from location if provided
  if (taskData.fromLocation) {
    updateObj.from_building = taskData.fromLocation.building;
    updateObj.from_location_id = taskData.fromLocation.locationId;
  }
  
  // Update to location if provided
  if (taskData.toLocation) {
    updateObj.to_building = taskData.toLocation.building;
    updateObj.to_location_id = taskData.toLocation.locationId;
  }
  
  // Use offline-aware update
  const result = await updateWithOfflineSupport('tasks', updateObj, { id: taskId });
  
  // If we didn't get a result back (offline case), merge the updates with the current task
  if (!result || (Array.isArray(result) && result.length === 0)) {
    // Create an updated task by merging current task with updates
    const mergedTask: Task = {
      ...currentTask,
      ...taskData,
      // Ensure these objects are properly merged
      fromLocation: taskData.fromLocation || currentTask.fromLocation,
      toLocation: taskData.toLocation || currentTask.toLocation
    };
    
    return mergedTask;
  }
  
  // Process the result returned from the server
  return transformTaskFromSupabase(Array.isArray(result) ? result[0] : result);
});

/**
 * Update just the status of a task - a common operation that deserves a helper method
 */
export const updateTaskStatus = withRetry(async function updateTaskStatus(
  taskId: string, 
  status: TaskStatus
): Promise<Task> {
  const now = new Date();
  
  // For completed status, we also update the completed time
  const updateData: Record<string, any> = { 
    status
  };
  
  if (status === 'Completed') {
    updateData.completed_time = now.toISOString();
  }
  
  return updateTask(taskId, updateData);
});

/**
 * Delete a task with improved offline support and error handling
 */
export const deleteTask = withRetry(async function deleteTask(
  taskId: string
): Promise<boolean> {
  // Use offline-aware delete
  await deleteWithOfflineSupport('tasks', { id: taskId });
  return true;
});

/**
 * Get a task by ID with caching
 */
export async function getTask(taskId: string): Promise<Task | null> {
  try {
    // Get task from Supabase with caching
    const data = await fetchFromTable('tasks', {
      match: { id: taskId },
      single: true,
      cacheKey: `task:${taskId}`
    });
    
    if (!data) return null;
    
    return transformTaskFromSupabase(data);
  } catch (error) {
    console.error('Error fetching task:', error);
    
    // If we're offline, try to get from localStorage
    if (!isOnline()) {
      // This is a simplified fallback that depends on the TaskManager store's localStorage cache
      const tasksData = localStorage.getItem('porter-track-current-shift');
      if (tasksData) {
        try {
          const shift = JSON.parse(tasksData);
          if (shift && shift.tasks) {
            const task = shift.tasks.find((t: any) => t.id === taskId);
            if (task) return task;
          }
        } catch (e) {
          console.error('Error parsing tasks from localStorage:', e);
        }
      }
    }
    
    return null;
  }
}

/**
 * Get tasks by shift ID with caching
 */
export async function getTasksByShift(shiftId: string): Promise<Task[]> {
  try {
    // Get tasks from Supabase with caching
    const data = await fetchFromTable('tasks', {
      match: { shift_id: shiftId },
      cacheKey: `tasks:shift:${shiftId}`
    });
    
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(transformTaskFromSupabase);
  } catch (error) {
    console.error('Error fetching tasks for shift:', error);
    
    // If we're offline, try to get from localStorage
    if (!isOnline()) {
      // This is a simplified fallback that depends on the TaskManager store's localStorage cache
      const tasksData = localStorage.getItem('porter-track-current-shift');
      if (tasksData) {
        try {
          const shift = JSON.parse(tasksData);
          if (shift && shift.id === shiftId && shift.tasks) {
            return shift.tasks;
          }
        } catch (e) {
          console.error('Error parsing tasks from localStorage:', e);
        }
      }
    }
    
    return [];
  }
}

/**
 * Get pending tasks for a shift with filtering and caching
 */
export async function getPendingTasksByShift(shiftId: string): Promise<Task[]> {
  const tasks = await getTasksByShift(shiftId);
  return tasks.filter(task => task.status === 'Pending');
}

/**
 * Get completed tasks for a shift with filtering and caching
 */
export async function getCompletedTasksByShift(shiftId: string): Promise<Task[]> {
  const tasks = await getTasksByShift(shiftId);
  return tasks.filter(task => task.status === 'Completed');
}
