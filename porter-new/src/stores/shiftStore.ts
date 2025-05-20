import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, generateId } from '@/utils/supabase'
import type { 
  Shift, 
  Task, 
  ShiftType,
  Porter,
  TaskStatus,
  PorterAssignment,
  LocationReference,
  SupabaseShift,
  SupabaseTask,
  SupabasePorterAssignment,
  SupabaseShiftAssignedPorter
} from '@/types'

export const useShiftStore = defineStore('shift', () => {
  // State
  const currentShift = ref<Shift | null>(null)
  const archivedShifts = ref<Shift[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isShiftActive = computed(() => !!currentShift.value)
  
  const pendingTasks = computed(() => {
    if (!currentShift.value) return []
    return currentShift.value.tasks.filter(task => task.status === 'Pending')
  })
  
  const completedTasks = computed(() => {
    if (!currentShift.value) return []
    return currentShift.value.tasks.filter(task => task.status === 'Completed')
  })

  const porterAssignments = computed(() => {
    if (!currentShift.value) return []
    return currentShift.value.porterAssignments
  })

  // Transform functions
  function transformShiftFromSupabase(data: any): Shift {
    return {
      id: data.id,
      date: data.date,
      type: data.type,
      supervisor: data.supervisor,
      startTime: data.start_time,
      endTime: data.end_time || undefined,
      tasks: [],
      assignedPorters: [],
      porterAssignments: [],
      createdAt: data.created_at
    }
  }

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
        displayName: '' // Will be populated separately
      },
      toLocation: {
        buildingId: data.to_building,
        locationId: data.to_location_id,
        displayName: '' // Will be populated separately
      },
      createdAt: data.created_at
    }
  }

  function transformPorterAssignmentFromSupabase(data: SupabasePorterAssignment): PorterAssignment {
    return {
      id: data.id,
      shiftId: data.shift_id,
      porterId: data.porter_id,
      departmentId: data.department_id,
      startTime: data.start_time,
      endTime: data.end_time || undefined,
      notes: data.notes || undefined
    }
  }

  // Actions
  async function loadShiftData() {
    isLoading.value = true
    error.value = null
    
    try {
      // Check for current active shift
      const { data: activeShiftData, error: activeShiftError } = await supabase
        .from('shifts')
        .select()
        .is('end_time', null)
        .maybeSingle()
      
      if (activeShiftError) throw activeShiftError
      
      if (activeShiftData) {
        // We have an active shift, load its details
        const shift = transformShiftFromSupabase(activeShiftData)
        
        // Load tasks for this shift
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select()
          .eq('shift_id', shift.id)
        
        if (tasksError) throw tasksError
        
        if (tasksData) {
          shift.tasks = tasksData.map(transformTaskFromSupabase)
        }
        
        // Load assigned porters for this shift
        const { data: portersData, error: portersError } = await supabase
          .from('shift_assigned_porters')
          .select('porter_id')
          .eq('shift_id', shift.id)
        
        if (portersError) throw portersError
        
        if (portersData) {
          shift.assignedPorters = portersData.map(p => p.porter_id)
        }
        
        // Load porter assignments for this shift
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('porter_assignments')
          .select()
          .eq('shift_id', shift.id)
        
        if (assignmentsError) throw assignmentsError
        
        if (assignmentsData) {
          shift.porterAssignments = assignmentsData.map(transformPorterAssignmentFromSupabase)
        }
        
        currentShift.value = shift
      } else {
        currentShift.value = null
      }
      
      // Also load archived shifts (could be paginated in a real app)
      const { data: archivedData, error: archivedError } = await supabase
        .from('shifts')
        .select()
        .not('end_time', 'is', null)
        .order('date', { ascending: false })
        .limit(10) // Limit to most recent 10 shifts
      
      if (archivedError) throw archivedError
      
      if (archivedData) {
        archivedShifts.value = archivedData.map(transformShiftFromSupabase)
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error loading shift data:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function startShift(type: ShiftType, supervisor: string) {
    if (currentShift.value) {
      throw new Error('Another shift is already active')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      console.log(`Starting new ${type} shift for supervisor: ${supervisor}`)
      
      // First, verify that the supervisor exists
      const { data: supervisorExists, error: supervisorError } = await supabase
        .from('supervisors')
        .select('id')
        .eq('name', supervisor)
        .maybeSingle()
      
      if (supervisorError) {
        console.error('Error checking supervisor:', supervisorError)
        throw new Error(`Error checking supervisor: ${supervisorError.message}`)
      }
      
      if (!supervisorExists) {
        console.error('Supervisor not found:', supervisor)
        throw new Error(`Supervisor "${supervisor}" not found. Please select a valid supervisor.`)
      }
      
      console.log('Supervisor verified, creating shift...')
      
      const now = new Date()
      const date = now.toISOString().split('T')[0] // YYYY-MM-DD
      
      // Simplify the shift object to reduce potential issues
      const newShift = {
        date,
        type,
        supervisor,
        start_time: now.toISOString(),
        end_time: null
      }
      
      console.log('Sending shift data to Supabase:', newShift)
      
      const { data, error: insertError } = await supabase
        .from('shifts')
        .insert(newShift)
        .select()
        .single()
      
      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(`Failed to create shift: ${insertError.message}`)
      }
      
      console.log('Shift created successfully:', data)
      
      const shift = transformShiftFromSupabase(data)
      shift.tasks = []
      shift.assignedPorters = []
      shift.porterAssignments = []
      
      currentShift.value = shift
      return shift
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error starting shift:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function endShift() {
    if (!currentShift.value) {
      throw new Error('No active shift to end')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const now = new Date().toISOString()
      
      const { error: updateError } = await supabase
        .from('shifts')
        .update({ end_time: now })
        .eq('id', currentShift.value.id)
      
      if (updateError) throw updateError
      
      // Add to archived shifts
      const endedShift = { ...currentShift.value, endTime: now }
      archivedShifts.value.unshift(endedShift)
      
      // Clear current shift
      currentShift.value = null
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error ending shift:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function reopenShift(shiftId: string) {
    if (currentShift.value) {
      throw new Error('Another shift is already active')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Clear the end time to reopen the shift
      const { error: updateError } = await supabase
        .from('shifts')
        .update({ end_time: null })
        .eq('id', shiftId)
      
      if (updateError) throw updateError
      
      // Load the shift with all its data
      const { data, error: fetchError } = await supabase
        .from('shifts')
        .select()
        .eq('id', shiftId)
        .single()
      
      if (fetchError) throw fetchError
      
      const shift = transformShiftFromSupabase(data)
      
      // Load tasks for this shift
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select()
        .eq('shift_id', shift.id)
      
      if (tasksError) throw tasksError
      
      if (tasksData) {
        shift.tasks = tasksData.map(transformTaskFromSupabase)
      }
      
      // Load assigned porters for this shift
      const { data: portersData, error: portersError } = await supabase
        .from('shift_assigned_porters')
        .select('porter_id')
        .eq('shift_id', shift.id)
      
      if (portersError) throw portersError
      
      if (portersData) {
        shift.assignedPorters = portersData.map(p => p.porter_id)
      }
      
      // Load porter assignments for this shift
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('porter_assignments')
        .select()
        .eq('shift_id', shift.id)
      
      if (assignmentsError) throw assignmentsError
      
      if (assignmentsData) {
        shift.porterAssignments = assignmentsData.map(transformPorterAssignmentFromSupabase)
      }
      
      // Remove from archived shifts
      archivedShifts.value = archivedShifts.value.filter(s => s.id !== shiftId)
      
      // Set as current shift
      currentShift.value = shift
      
      return shift
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error reopening shift:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteShift(shiftId: string) {
    isLoading.value = true
    error.value = null
    
    try {
      // Check if this is the current shift
      if (currentShift.value?.id === shiftId) {
        throw new Error('Cannot delete the current active shift')
      }
      
      // Delete the shift and all related data (tasks, porter assignments, etc.)
      // In a real application, we might want to use a transaction for this
      
      // Delete tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('shift_id', shiftId)
      
      if (tasksError) throw tasksError
      
      // Delete porter assignments
      const { error: assignmentsError } = await supabase
        .from('porter_assignments')
        .delete()
        .eq('shift_id', shiftId)
      
      if (assignmentsError) throw assignmentsError
      
      // Delete shift assigned porters
      const { error: portersError } = await supabase
        .from('shift_assigned_porters')
        .delete()
        .eq('shift_id', shiftId)
      
      if (portersError) throw portersError
      
      // Finally delete the shift
      const { error: shiftError } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId)
      
      if (shiftError) throw shiftError
      
      // Update the archived shifts list
      archivedShifts.value = archivedShifts.value.filter(s => s.id !== shiftId)
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error deleting shift:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addPorterToShift(porterId: Porter) {
    if (!currentShift.value) {
      throw new Error('No active shift')
    }
    
    // Check if porter is already assigned
    if (currentShift.value.assignedPorters.includes(porterId)) {
      return // Porter already assigned, no action needed
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const now = new Date().toISOString()
      
      const porterAssignment: SupabaseShiftAssignedPorter = {
        id: generateId(),
        shift_id: currentShift.value.id,
        porter_id: porterId,
        created_at: now
      }
      
      const { error: insertError } = await supabase
        .from('shift_assigned_porters')
        .insert(porterAssignment)
      
      if (insertError) throw insertError
      
      // Update the current shift
      currentShift.value.assignedPorters.push(porterId)
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error adding porter to shift:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removePorterFromShift(porterId: Porter) {
    if (!currentShift.value) {
      throw new Error('No active shift')
    }
    
    // Check if porter is assigned
    if (!currentShift.value.assignedPorters.includes(porterId)) {
      return // Porter not assigned, no action needed
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Remove the porter assignment
      const { error: deleteError } = await supabase
        .from('shift_assigned_porters')
        .delete()
        .eq('shift_id', currentShift.value.id)
        .eq('porter_id', porterId)
      
      if (deleteError) throw deleteError
      
      // Update the current shift
      currentShift.value.assignedPorters = currentShift.value.assignedPorters.filter(p => p !== porterId)
      
      // Also remove any department assignments for this porter
      currentShift.value.porterAssignments = currentShift.value.porterAssignments.filter(a => a.porterId !== porterId)
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error removing porter from shift:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // More actions would be implemented for a complete solution:
  // - Creating, updating, and deleting tasks
  // - Managing porter department assignments
  // - Loading detailed archived shift data
  // - etc.

  return {
    // State
    currentShift,
    archivedShifts,
    isLoading,
    error,
    
    // Computed
    isShiftActive,
    pendingTasks,
    completedTasks,
    porterAssignments,
    
    // Actions
    loadShiftData,
    startShift,
    endShift,
    reopenShift,
    deleteShift,
    addPorterToShift,
    removePorterFromShift
  }
})
