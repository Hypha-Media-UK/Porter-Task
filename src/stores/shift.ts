import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { Shift, Task, ShiftType, TaskStatus, Location, PorterAssignment } from '@/types'

/**
 * Store for managing shifts and tasks
 */
export const useShiftStore = defineStore('shift', () => {
  // State
  const currentShift = ref<Shift | null>(null)
  const archivedShifts = ref<Shift[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // LocalStorage keys
  const CURRENT_SHIFT_STORAGE_KEY = 'porter-track-current-shift'
  const ARCHIVED_SHIFTS_STORAGE_KEY = 'porter-track-archived-shifts'
  
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
  
  // Porter assignments computed properties
  const porterAssignments = computed(() => {
    if (!currentShift.value || !currentShift.value.porterAssignments) return []
    return currentShift.value.porterAssignments
  })
  
  const currentPorterAssignments = computed(() => {
    if (!currentShift.value || !currentShift.value.porterAssignments) return []
    
    const now = new Date().toISOString()
    
    // Return assignments that are currently active (started and not ended, or ended in future)
    return currentShift.value.porterAssignments.filter(assignment => {
      const hasStarted = assignment.startTime <= now
      const hasNotEnded = !assignment.endTime || assignment.endTime > now
      return hasStarted && hasNotEnded
    })
  })
  
  /**
   * Load shift data from API/local storage
   */
  async function loadShiftData() {
    isLoading.value = true
    error.value = null
    
    try {
      // Attempt to load current shift first
      await loadCurrentShift()
      
      // Then load archived shifts
      await loadArchivedShifts()
      
      return true
    } catch (err) {
      console.error('Error loading shift data:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load shift data'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Load current shift from localStorage first, then try API
   */
  async function loadCurrentShift() {
    try {
      // First try to load from localStorage
      const storedShift = localStorage.getItem(CURRENT_SHIFT_STORAGE_KEY)
      
      if (storedShift) {
        try {
          const parsedShift = JSON.parse(storedShift) as Shift
          currentShift.value = parsedShift
          console.log('Loaded current shift from localStorage:', parsedShift)
          return true
        } catch (parseErr) {
          console.error('Error parsing stored shift:', parseErr)
          // Continue to try API if localStorage parsing fails
        }
      }
      
      // In a production app, we would fetch from an API endpoint here
      // For development, just return null as we're using localStorage
      console.log('No current shift in localStorage, would normally try API in production')
      currentShift.value = null
      
      return true
    } catch (err) {
      // Do not automatically create a test shift for development
      // Let users create their own shifts
      console.error('Error loading current shift:', err)
      currentShift.value = null
      return false
    }
  }
  
  /**
   * Load archived shifts from API/local storage
   */
  async function loadArchivedShifts() {
    try {
      // First try to load from localStorage
      const storedShifts = localStorage.getItem(ARCHIVED_SHIFTS_STORAGE_KEY)
      
      if (storedShifts) {
        try {
          const parsedShifts = JSON.parse(storedShifts) as Shift[]
          archivedShifts.value = parsedShifts
          console.log('Loaded archived shifts from localStorage:', parsedShifts.length)
          return true
        } catch (parseErr) {
          console.error('Error parsing stored archived shifts:', parseErr)
        }
      }
      
      // In a real app, we would fetch from an API endpoint here
      console.log('No archived shifts in localStorage, would normally try API in production')
      
      // For development, create some test archived shifts
      if (import.meta.env.DEV) {
        createTestArchivedShifts()
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error loading archived shifts:', err)
      return false
    }
  }
  
  /**
   * Start a new shift
   */
  function startShift(type: ShiftType, supervisor: string) {
    if (currentShift.value) {
      throw new Error('Cannot start a new shift while one is already active')
    }
    
    const now = new Date()
    
    const shift: Shift = {
      id: nanoid(),
      date: now.toISOString().split('T')[0],
      type,
      supervisor,
      startTime: now.toISOString(),
      tasks: [],
      assignedPorters: [] // Initialize with empty array
    }
    
    currentShift.value = shift
    
    // Save to localStorage to persist across page refreshes
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(shift))
    
    console.log('Shift started:', shift)
    
    return shift
  }
  
  /**
   * Add a porter to the current shift
   */
  function addPorterToShift(porterName: string) {
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
    
    // Add porter to shift
    currentShift.value.assignedPorters.push(porterName)
    
    // Save to localStorage
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log(`Porter ${porterName} added to shift`)
    return true
  }
  
  /**
   * Remove a porter from the current shift
   */
  function removePorterFromShift(porterName: string) {
    if (!currentShift.value || !currentShift.value.assignedPorters) {
      throw new Error('No active shift or no assigned porters')
    }
    
    // Find porter index
    const porterIndex = currentShift.value.assignedPorters.indexOf(porterName)
    
    if (porterIndex === -1) {
      console.warn(`Porter ${porterName} is not assigned to this shift`)
      return false
    }
    
    // Remove porter from shift
    currentShift.value.assignedPorters.splice(porterIndex, 1)
    
    // Save to localStorage
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log(`Porter ${porterName} removed from shift`)
    return true
  }
  
  /**
   * End the current shift
   */
  function endShift() {
    if (!currentShift.value) {
      throw new Error('No active shift to end')
    }
    
    const now = new Date()
    
    currentShift.value.endTime = now.toISOString()
    
    // Add to archived shifts
    archivedShifts.value.unshift({ ...currentShift.value })
    
    // Save archived shift to localStorage
    try {
      const storedShifts = localStorage.getItem(ARCHIVED_SHIFTS_STORAGE_KEY)
      let shifts = storedShifts ? JSON.parse(storedShifts) as Shift[] : []
      shifts.unshift({ ...currentShift.value })
      localStorage.setItem(ARCHIVED_SHIFTS_STORAGE_KEY, JSON.stringify(shifts))
    } catch (err) {
      console.error('Error saving archived shifts to localStorage:', err)
    }
    
    console.log('Shift ended:', currentShift.value)
    
    // Clear current shift
    currentShift.value = null
    localStorage.removeItem(CURRENT_SHIFT_STORAGE_KEY)
    
    // Force navigation state update to trigger reactivity
    window.dispatchEvent(new CustomEvent('shift-ended'))
    
    return true
  }
  
  /**
   * Create a new task
   */
  function createTask(taskData: {
    jobCategory: string;
    itemType: string;
    fromLocation: Location;
    toLocation: Location;
    allocatedStaff?: string;
    receivedTime?: string;
    allocatedTime?: string;
    completedTime?: string;
    status?: TaskStatus;
  }): Task {
    if (!currentShift.value) {
      throw new Error('Cannot create task without an active shift')
    }
    
    const now = new Date()
    
    const task: Task = {
      id: nanoid(),
      receivedTime: taskData.receivedTime || now.toISOString(),
      allocatedTime: taskData.allocatedTime || now.toISOString(),
      status: taskData.status || 'Pending',
      ...taskData
    }
    
    // Add to current shift
    currentShift.value.tasks.unshift(task)
    
    // Save updated shift to localStorage
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log('Task created:', task)
    
    return task
  }
  
  /**
   * Update task status
   */
  function updateTaskStatus(taskId: string, status: TaskStatus) {
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
    
    // Save updated shift to localStorage
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log('Task updated:', task)
    
    return task
  }
  
  /**
   * Update an existing task - works with both current and archived shifts
   */
  function updateTask(taskId: string, taskData: {
    jobCategory: string;
    itemType: string;
    fromLocation: Location;
    toLocation: Location;
    allocatedStaff?: string;
    receivedTime?: string;
    allocatedTime?: string;
    completedTime?: string;
    status?: TaskStatus;
  }): Task {
    // First check in current shift
    if (currentShift.value) {
      const taskIndex = currentShift.value.tasks.findIndex(t => t.id === taskId)
      
      if (taskIndex !== -1) {
        // Update the task with new data while preserving the ID
        const updatedTask: Task = {
          ...currentShift.value.tasks[taskIndex],
          ...taskData,
          id: taskId // Ensure ID remains the same
        }
        
        // Replace the task in the array
        currentShift.value.tasks[taskIndex] = updatedTask
        
        // Save updated shift to localStorage
        localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
        
        console.log('Task updated in current shift:', updatedTask)
        
        return updatedTask
      }
    }
    
    // If not found in current shift, check archived shifts
    for (let i = 0; i < archivedShifts.value.length; i++) {
      const shift = archivedShifts.value[i]
      const taskIndex = shift.tasks.findIndex(t => t.id === taskId)
      
      if (taskIndex !== -1) {
        // Update the task with new data while preserving the ID
        const updatedTask: Task = {
          ...shift.tasks[taskIndex],
          ...taskData,
          id: taskId // Ensure ID remains the same
        }
        
        // Replace the task in the array
        shift.tasks[taskIndex] = updatedTask
        
        // Save updated archived shifts to localStorage
        localStorage.setItem(ARCHIVED_SHIFTS_STORAGE_KEY, JSON.stringify(archivedShifts.value))
        
        console.log('Task updated in archived shift:', updatedTask)
        
        return updatedTask
      }
    }
    
    // If we get here, the task wasn't found in any shift
    throw new Error(`Task with ID ${taskId} not found in any shift`)
  }
  
  /**
   * Delete a task - works with both current and archived shifts
   */
  function deleteTask(taskId: string): boolean {
    // First check in current shift
    if (currentShift.value) {
      const taskIndex = currentShift.value.tasks.findIndex(t => t.id === taskId)
      
      if (taskIndex !== -1) {
        // Remove the task from the array
        currentShift.value.tasks.splice(taskIndex, 1)
        
        // Save updated shift to localStorage
        localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
        
        console.log('Task deleted from current shift:', taskId)
        
        return true
      }
    }
    
    // If not found in current shift, check archived shifts
    for (let i = 0; i < archivedShifts.value.length; i++) {
      const shift = archivedShifts.value[i]
      const taskIndex = shift.tasks.findIndex(t => t.id === taskId)
      
      if (taskIndex !== -1) {
        // Remove the task from the array
        shift.tasks.splice(taskIndex, 1)
        
        // Save updated archived shifts to localStorage
        localStorage.setItem(ARCHIVED_SHIFTS_STORAGE_KEY, JSON.stringify(archivedShifts.value))
        
        console.log('Task deleted from archived shift:', taskId)
        
        return true
      }
    }
    
    // If we get here, the task wasn't found in any shift
    throw new Error(`Task with ID ${taskId} not found in any shift`)
  }
  
  /**
   * Get archived shift by ID
   */
  async function getShift(shiftId: string): Promise<Shift | null> {
    // Check if already loaded in archived shifts
    const cached = archivedShifts.value.find(s => s.id === shiftId)
    if (cached) return cached
    
    isLoading.value = true
    
    try {
      const response = await fetch(`/data/shifts/${shiftId}.json`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to load shift: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data as Shift
    } catch (err) {
      console.error(`Error loading shift ${shiftId}:`, err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get task by ID - search in both current and archived shifts
   */
  function getTask(taskId: string): Task | null {
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
  
  /**
   * Create a test shift for development
   */
  function createTestShift() {
    const now = new Date()
    
    currentShift.value = {
      id: 'test-shift-' + nanoid(6),
      date: now.toISOString().split('T')[0],
      type: now.getHours() < 18 ? 'Day' : 'Night',
      supervisor: 'Test Supervisor',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0).toISOString(),
      tasks: []
    }
    
    // Add some test tasks
    for (let i = 0; i < 3; i++) {
      currentShift.value.tasks.push({
        id: 'task-' + nanoid(6),
        receivedTime: new Date(now.getTime() - (i * 30 * 60 * 1000)).toISOString(),
        allocatedTime: new Date(now.getTime() - (i * 30 * 60 * 1000) + (5 * 60 * 1000)).toISOString(),
        status: i === 0 ? 'Pending' : 'Pending',
        jobCategory: 'Patient Transfer',
        itemType: 'Wheelchair',
        fromLocation: {
          building: 'main',
          locationId: 'emergency',
          locationType: 'department',
          displayName: 'Emergency Department'
        },
        toLocation: {
          building: 'main',
          locationId: 'ward' + (i + 1),
          locationType: 'ward',
          displayName: 'Ward ' + (i + 1)
        }
      })
    }
    
    console.log('Created test shift:', currentShift.value)
  }
  
  /**
   * Create test archived shifts for development
   */
  function createTestArchivedShifts() {
    const shifts: Shift[] = []
    const now = new Date()
    
    // Create shifts for the past 5 days
    for (let i = 1; i <= 5; i++) {
      const shiftDate = new Date(now)
      shiftDate.setDate(now.getDate() - i)
      
      // Day shift
      const dayShift: Shift = {
        id: `day-shift-${i}-${nanoid(6)}`,
        date: shiftDate.toISOString().split('T')[0],
        type: 'Day',
        supervisor: 'Day Supervisor ' + i,
        startTime: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate(), 8, 0, 0).toISOString(),
        endTime: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate(), 16, 0, 0).toISOString(),
        tasks: []
      }
      
      // Add some completed tasks
      for (let j = 0; j < Math.floor(Math.random() * 8) + 3; j++) {
        const taskTime = new Date(shiftDate)
        taskTime.setHours(8 + Math.floor(j / 2))
        taskTime.setMinutes((j % 2) * 30)
        
        dayShift.tasks.push({
          id: `day-task-${i}-${j}-${nanoid(6)}`,
          receivedTime: taskTime.toISOString(),
          allocatedTime: new Date(taskTime.getTime() + 5 * 60 * 1000).toISOString(),
          completedTime: new Date(taskTime.getTime() + 25 * 60 * 1000).toISOString(),
          status: 'Completed',
          jobCategory: j % 3 === 0 ? 'Patient Transfer' : j % 3 === 1 ? 'Specimen Delivery' : 'Equipment Transport',
          itemType: j % 3 === 0 ? 'Wheelchair' : j % 3 === 1 ? 'Blood Sample' : 'Medical Device',
          fromLocation: {
            building: 'main',
            locationId: j % 2 === 0 ? 'emergency' : 'radiology',
            locationType: 'department',
            displayName: j % 2 === 0 ? 'Emergency Department' : 'Radiology'
          },
          toLocation: {
            building: 'main',
            locationId: 'ward' + ((j % 3) + 1),
            locationType: 'ward',
            displayName: 'Ward ' + ((j % 3) + 1)
          }
        })
      }
      
      shifts.push(dayShift)
      
      // Night shift
      const nightShift: Shift = {
        id: `night-shift-${i}-${nanoid(6)}`,
        date: shiftDate.toISOString().split('T')[0],
        type: 'Night',
        supervisor: 'Night Supervisor ' + i,
        startTime: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate(), 16, 0, 0).toISOString(),
        endTime: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate() + 1, 0, 0, 0).toISOString(),
        tasks: []
      }
      
      // Add some completed tasks
      for (let j = 0; j < Math.floor(Math.random() * 5) + 2; j++) {
        const taskTime = new Date(shiftDate)
        taskTime.setHours(16 + Math.floor(j / 2))
        taskTime.setMinutes((j % 2) * 30)
        
        nightShift.tasks.push({
          id: `night-task-${i}-${j}-${nanoid(6)}`,
          receivedTime: taskTime.toISOString(),
          allocatedTime: new Date(taskTime.getTime() + 5 * 60 * 1000).toISOString(),
          completedTime: new Date(taskTime.getTime() + 25 * 60 * 1000).toISOString(),
          status: 'Completed',
          jobCategory: j % 3 === 0 ? 'Patient Transfer' : j % 3 === 1 ? 'Document Delivery' : 'Medication Delivery',
          itemType: j % 3 === 0 ? 'Stretcher' : j % 3 === 1 ? 'Patient Records' : 'Routine Medication',
          fromLocation: {
            building: 'main',
            locationId: j % 2 === 0 ? 'pharmacy' : 'laboratory',
            locationType: 'department',
            displayName: j % 2 === 0 ? 'Pharmacy' : 'Laboratory'
          },
          toLocation: {
            building: 'main',
            locationId: 'ward' + ((j % 3) + 1),
            locationType: 'ward',
            displayName: 'Ward ' + ((j % 3) + 1)
          }
        })
      }
      
      shifts.push(nightShift)
    }
    
    archivedShifts.value = shifts
    console.log('Created test archived shifts:', shifts)
  }
  
  /**
   * Delete an archived shift
   */
  function deleteShift(shiftId: string) {
    // Find shift index
    const shiftIndex = archivedShifts.value.findIndex(s => s.id === shiftId)
    
    if (shiftIndex === -1) {
      throw new Error(`Shift with ID ${shiftId} not found`)
    }
    
    // Remove the shift from archived shifts
    archivedShifts.value.splice(shiftIndex, 1)
    
    // In a real app, we would also delete from API/local storage here
    console.log('Shift deleted:', shiftId)
    
    return true
  }

  /**
   * Reopen an archived shift
   */
  function reopenShift(shiftId: string) {
    // Find the shift in archived shifts
    const shiftIndex = archivedShifts.value.findIndex(s => s.id === shiftId)
    
    if (shiftIndex === -1) {
      throw new Error(`Shift with ID ${shiftId} not found`)
    }
    
    // Check if there's already an active shift
    if (currentShift.value) {
      throw new Error('Cannot reopen a shift while another is active. Please end the current shift first.')
    }
    
    // Get the shift from archived shifts
    const shift = { ...archivedShifts.value[shiftIndex] }
    
    // Remove endTime to make it active again
    delete shift.endTime
    
    // Set as current shift
    currentShift.value = shift
    
    // Remove from archived shifts
    archivedShifts.value.splice(shiftIndex, 1)
    
    // In a real app, we would update API/local storage here
    console.log('Shift reopened:', shift)
    
    return shift
  }

  /**
   * Add a department assignment for a porter
   */
  function addPorterAssignment(assignment: {
    porterId: string;
    departmentId: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }): PorterAssignment {
    if (!currentShift.value) {
      throw new Error('Cannot create assignment without an active shift')
    }
    
    // Ensure the porter is assigned to this shift
    if (!currentShift.value.assignedPorters || !currentShift.value.assignedPorters.includes(assignment.porterId)) {
      throw new Error(`Porter ${assignment.porterId} is not assigned to this shift`)
    }
    
    const now = new Date()
    
    const newAssignment: PorterAssignment = {
      id: nanoid(),
      porterId: assignment.porterId,
      departmentId: assignment.departmentId,
      startTime: assignment.startTime || now.toISOString(),
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
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log('Porter assignment created:', newAssignment)
    
    return newAssignment
  }
  
  /**
   * Update an existing porter assignment
   */
  function updatePorterAssignment(assignmentId: string, updates: {
    porterId?: string;
    departmentId?: string;
    startTime?: string;
    endTime?: string | null;
    notes?: string;
  }): PorterAssignment {
    if (!currentShift.value || !currentShift.value.porterAssignments) {
      throw new Error('No active shift or no assignments')
    }
    
    const assignmentIndex = currentShift.value.porterAssignments.findIndex(a => a.id === assignmentId)
    
    if (assignmentIndex === -1) {
      throw new Error(`Assignment with ID ${assignmentId} not found`)
    }
    
    // Get the existing assignment
    const assignment = { ...currentShift.value.porterAssignments[assignmentIndex] }
    
    // Update fields
    if (updates.porterId !== undefined) assignment.porterId = updates.porterId
    if (updates.departmentId !== undefined) assignment.departmentId = updates.departmentId
    if (updates.startTime !== undefined) assignment.startTime = updates.startTime
    if (updates.notes !== undefined) assignment.notes = updates.notes
    
    // Handle endTime specially to resolve the TypeScript error
    if (updates.endTime === null) {
      // If endTime is explicitly set to null, remove it
      delete assignment.endTime
    } else if (updates.endTime !== undefined) {
      // Otherwise, set it if not undefined
      assignment.endTime = updates.endTime
    }
    
    // Update assignment in the shift
    currentShift.value.porterAssignments[assignmentIndex] = assignment
    
    // Save to localStorage
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log('Porter assignment updated:', assignment)
    
    return assignment
  }
  
  /**
   * Remove a porter assignment
   */
  function removePorterAssignment(assignmentId: string): boolean {
    if (!currentShift.value || !currentShift.value.porterAssignments) {
      throw new Error('No active shift or no assignments')
    }
    
    const assignmentIndex = currentShift.value.porterAssignments.findIndex(a => a.id === assignmentId)
    
    if (assignmentIndex === -1) {
      throw new Error(`Assignment with ID ${assignmentId} not found`)
    }
    
    // Remove assignment from shift
    currentShift.value.porterAssignments.splice(assignmentIndex, 1)
    
    // Save to localStorage
    localStorage.setItem(CURRENT_SHIFT_STORAGE_KEY, JSON.stringify(currentShift.value))
    
    console.log(`Porter assignment ${assignmentId} removed`)
    
    return true
  }
  
  /**
   * Get porter assignments for a specific porter
   */
  function getPorterAssignments(porterId: string): PorterAssignment[] {
    if (!currentShift.value || !currentShift.value.porterAssignments) {
      return []
    }
    
    return currentShift.value.porterAssignments.filter(a => a.porterId === porterId)
  }
  
  /**
   * Get porter assignments for a department
   */
  function getDepartmentAssignments(departmentId: string): PorterAssignment[] {
    if (!currentShift.value || !currentShift.value.porterAssignments) {
      return []
    }
    
    return currentShift.value.porterAssignments.filter(a => a.departmentId === departmentId)
  }
  
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
    currentPorterAssignments,
    
    // Actions
    loadShiftData,
    loadCurrentShift,
    loadArchivedShifts,
    startShift,
    endShift,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getShift,
    getTask,
    deleteShift,
    reopenShift,
    addPorterToShift,
    removePorterFromShift,
    
    // Porter assignment management
    addPorterAssignment,
    updatePorterAssignment,
    removePorterAssignment,
    getPorterAssignments,
    getDepartmentAssignments
  }
})
