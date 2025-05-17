import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, generateId } from '@/utils/supabase'
import { useShiftStore } from './shiftStore'
import { useSettingsStore } from './settingsStore'
import type {
  Task,
  TaskStatus,
  TaskFormData,
  SupabaseTask,
  LocationReference
} from '@/types'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Get access to other stores
  const shiftStore = useShiftStore()
  const settingsStore = useSettingsStore()
  
  // Computed
  const pendingTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'Pending')
  })
  
  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'Completed')
  })
  
  // Helpers
  function transformTaskFromSupabase(data: SupabaseTask): Task {
    return {
      id: data.id,
      shiftId: data.shift_id,
      receivedTime: data.received_time,
      allocatedTime: data.allocated_time,
      completedTime: data.completed_time || undefined,
      status: data.status,
      jobCategory: data.job_category,
      itemType: data.item_type,
      allocatedStaff: data.allocated_staff || undefined,
      fromLocation: {
        buildingId: data.from_building,
        locationId: data.from_location_id,
        displayName: getLocationDisplayName(data.from_building, data.from_location_id)
      },
      toLocation: {
        buildingId: data.to_building,
        locationId: data.to_location_id,
        displayName: getLocationDisplayName(data.to_building, data.to_location_id)
      },
      createdAt: data.created_at
    }
  }
  
  function getLocationDisplayName(buildingId: string, locationId: string): string {
    // Find the building and department names
    const building = settingsStore.buildings.find(b => b.id === buildingId)
    
    if (!building) return 'Unknown'
    
    const department = building.departments.find(d => d.id === locationId)
    
    if (!department) return building.name
    
    return `${department.name} (${building.name})`
  }
  
  function transformTaskForSupabase(task: Task): SupabaseTask {
    return {
      id: task.id,
      shift_id: task.shiftId,
      received_time: task.receivedTime,
      allocated_time: task.allocatedTime,
      completed_time: task.completedTime || null,
      status: task.status,
      job_category: task.jobCategory,
      item_type: task.itemType,
      allocated_staff: task.allocatedStaff || null,
      from_building: task.fromLocation.buildingId,
      from_location_id: task.fromLocation.locationId,
      to_building: task.toLocation.buildingId,
      to_location_id: task.toLocation.locationId,
      created_at: task.createdAt
    }
  }
  
  function formDataToTask(formData: TaskFormData, shiftId: string): Task {
    // Find building for the from location
    const fromLocation = settingsStore.allDepartments.find(d => d.id === formData.fromLocation)
    const toLocation = settingsStore.allDepartments.find(d => d.id === formData.toLocation)
    
    if (!fromLocation || !toLocation) {
      throw new Error('Invalid location data')
    }
    
    const now = new Date().toISOString()
    
    // Function to convert time (HH:MM) to ISO string
    function timeToIsoString(time: string): string {
      const [hours, minutes] = time.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      return date.toISOString()
    }
    
    return {
      id: generateId(),
      shiftId,
      receivedTime: timeToIsoString(formData.receivedTime),
      allocatedTime: timeToIsoString(formData.allocatedTime),
      completedTime: formData.completedTime ? timeToIsoString(formData.completedTime) : undefined,
      status: formData.status || 'Pending',
      jobCategory: formData.jobCategory,
      itemType: formData.itemType,
      allocatedStaff: formData.allocatedStaff,
      fromLocation: {
        buildingId: fromLocation.buildingId,
        locationId: fromLocation.id,
        displayName: `${fromLocation.name} (${fromLocation.buildingName})`
      },
      toLocation: {
        buildingId: toLocation.buildingId,
        locationId: toLocation.id,
        displayName: `${toLocation.name} (${toLocation.buildingName})`
      },
      createdAt: now
    }
  }
  
  // Actions
  async function loadTasks(shiftId: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('shift_id', shiftId)
        .order('received_time', { ascending: true })
      
      if (fetchError) throw fetchError
      
      tasks.value = data.map(transformTaskFromSupabase)
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error loading tasks:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  async function getTask(taskId: string): Promise<Task | null> {
    isLoading.value = true
    error.value = null
    
    try {
      // First check the current list
      const existingTask = tasks.value.find(t => t.id === taskId)
      if (existingTask) {
        return existingTask
      }
      
      // Otherwise fetch from the database
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .maybeSingle()
      
      if (fetchError) throw fetchError
      
      if (!data) return null
      
      return transformTaskFromSupabase(data)
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error getting task:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  async function createTask(formData: TaskFormData): Promise<Task | null> {
    if (!shiftStore.currentShift) {
      throw new Error('No active shift')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Convert form data to task object
      const newTask = formDataToTask(formData, shiftStore.currentShift.id)
      
      // Convert to Supabase format
      const supabaseTask = transformTaskForSupabase(newTask)
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(supabaseTask)
      
      if (insertError) throw insertError
      
      // Add to local state
      tasks.value.push(newTask)
      
      // Update the shift's tasks as well
      if (shiftStore.currentShift) {
        shiftStore.currentShift.tasks.push(newTask)
      }
      
      return newTask
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error creating task:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateTask(taskId: string, formData: TaskFormData): Promise<Task | null> {
    isLoading.value = true
    error.value = null
    
    try {
      // Get the existing task
      const existingTask = await getTask(taskId)
      if (!existingTask) {
        throw new Error('Task not found')
      }
      
      // Make a copy of the task with updated fields
      const updatedTask: Task = {
        ...existingTask,
        jobCategory: formData.jobCategory,
        itemType: formData.itemType,
        allocatedStaff: formData.allocatedStaff,
        status: formData.status || existingTask.status
      }
      
      // Find building for the from location
      const fromLocation = settingsStore.allDepartments.find(d => d.id === formData.fromLocation)
      const toLocation = settingsStore.allDepartments.find(d => d.id === formData.toLocation)
      
      if (fromLocation) {
        updatedTask.fromLocation = {
          buildingId: fromLocation.buildingId,
          locationId: fromLocation.id,
          displayName: `${fromLocation.name} (${fromLocation.buildingName})`
        }
      }
      
      if (toLocation) {
        updatedTask.toLocation = {
          buildingId: toLocation.buildingId,
          locationId: toLocation.id,
          displayName: `${toLocation.name} (${toLocation.buildingName})`
        }
      }
      
      // Function to convert time (HH:MM) to ISO string
      function timeToIsoString(time: string): string {
        const [hours, minutes] = time.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        return date.toISOString()
      }
      
      // Update times
      if (formData.receivedTime) {
        updatedTask.receivedTime = timeToIsoString(formData.receivedTime)
      }
      
      if (formData.allocatedTime) {
        updatedTask.allocatedTime = timeToIsoString(formData.allocatedTime)
      }
      
      if (formData.completedTime && updatedTask.status === 'Completed') {
        updatedTask.completedTime = timeToIsoString(formData.completedTime)
      } else if (updatedTask.status !== 'Completed') {
        updatedTask.completedTime = undefined
      }
      
      // Convert to Supabase format
      const supabaseTask = transformTaskForSupabase(updatedTask)
      
      // Update in database
      const { error: updateError } = await supabase
        .from('tasks')
        .update(supabaseTask)
        .eq('id', taskId)
      
      if (updateError) throw updateError
      
      // Update local state
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      // Update in shift's tasks as well
      if (shiftStore.currentShift) {
        const shiftTaskIndex = shiftStore.currentShift.tasks.findIndex(t => t.id === taskId)
        if (shiftTaskIndex !== -1) {
          shiftStore.currentShift.tasks[shiftTaskIndex] = updatedTask
        }
      }
      
      return updatedTask
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error updating task:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteTask(taskId: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (deleteError) throw deleteError
      
      // Update local state
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      
      // Update in shift's tasks as well
      if (shiftStore.currentShift) {
        shiftStore.currentShift.tasks = shiftStore.currentShift.tasks.filter(t => t.id !== taskId)
      }
      
      return true
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error deleting task:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task | null> {
    isLoading.value = true
    error.value = null
    
    try {
      // Get the existing task
      const existingTask = await getTask(taskId)
      if (!existingTask) {
        throw new Error('Task not found')
      }
      
      // Set completion time if marking as completed
      let completedTime: string | null = existingTask.completedTime || null
      if (status === 'Completed' && !existingTask.completedTime) {
        completedTime = new Date().toISOString()
      } else if (status === 'Pending') {
        completedTime = null
      }
      
      // Update in database
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status,
          completed_time: completedTime
        })
        .eq('id', taskId)
      
      if (updateError) throw updateError
      
      // Update local state
      const updatedTask = { ...existingTask, status, completedTime: completedTime || undefined }
      
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      // Update in shift's tasks as well
      if (shiftStore.currentShift) {
        const shiftTaskIndex = shiftStore.currentShift.tasks.findIndex(t => t.id === taskId)
        if (shiftTaskIndex !== -1) {
          shiftStore.currentShift.tasks[shiftTaskIndex] = updatedTask
        }
      }
      
      return updatedTask
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error updating task status:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // State
    tasks,
    currentTask,
    isLoading,
    error,
    
    // Computed
    pendingTasks,
    completedTasks,
    
    // Actions
    loadTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  }
})
