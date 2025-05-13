import { supabase } from '@/utils/supabase'
import type { 
  Shift, Task, PorterAssignment, 
  SupabaseShift, SupabaseTask
} from '@/types'
import { nanoid } from 'nanoid'

// Migrate shifts and tasks data
export async function migrateShifts() {
  // Try to get current shift from localStorage
  const currentShiftData = localStorage.getItem('porter-track-current-shift')
  
  if (currentShiftData) {
    try {
      const currentShift = JSON.parse(currentShiftData)
      
      // Create shift in Supabase
      const supabaseShift: SupabaseShift = {
        id: currentShift.id,
        date: currentShift.date,
        type: currentShift.type,
        supervisor: currentShift.supervisor,
        start_time: currentShift.startTime,
        end_time: currentShift.endTime || null
      }
      
      await supabase
        .from('shifts')
        .insert(supabaseShift)
      
      // Add assigned porters if any
      if (currentShift.assignedPorters && currentShift.assignedPorters.length > 0) {
        const porterAssignments = currentShift.assignedPorters.map((porter: string) => ({
          id: nanoid(),
          shift_id: currentShift.id,
          porter_id: porter
        }))
        
        await supabase
          .from('shift_assigned_porters')
          .insert(porterAssignments)
      }
      
      // Add porter assignments if any
      if (currentShift.porterAssignments && currentShift.porterAssignments.length > 0) {
        const assignments = currentShift.porterAssignments.map((assignment: PorterAssignment) => ({
          id: assignment.id,
          shift_id: currentShift.id,
          porter_id: assignment.porterId,
          department_id: assignment.departmentId,
          start_time: assignment.startTime,
          end_time: assignment.endTime || null,
          notes: assignment.notes || null
        }))
        
        await supabase
          .from('porter_assignments')
          .insert(assignments)
      }
      
      // Add tasks if any
      if (currentShift.tasks && currentShift.tasks.length > 0) {
        const supabaseTasks = currentShift.tasks.map((task: Task) => ({
          id: task.id,
          shift_id: currentShift.id,
          received_time: task.receivedTime,
          allocated_time: task.allocatedTime,
          completed_time: task.completedTime || null,
          status: task.status,
          job_category: task.jobCategory,
          item_type: task.itemType,
          from_building: task.fromLocation.building,
          from_location_id: task.fromLocation.locationId,
          to_building: task.toLocation.building,
          to_location_id: task.toLocation.locationId,
          allocated_staff: task.allocatedStaff || null
        }))
        
        await supabase
          .from('tasks')
          .insert(supabaseTasks)
      }
    } catch (error) {
      console.error('Error migrating current shift:', error)
    }
  }
  
  // Try to get archived shifts from localStorage
  const archivedShiftsData = localStorage.getItem('porter-track-archived-shifts')
  
  if (archivedShiftsData) {
    try {
      const archivedShifts = JSON.parse(archivedShiftsData) as Shift[]
      
      // Process each archived shift
      for (const shift of archivedShifts) {
        // Create shift in Supabase
        const supabaseShift: SupabaseShift = {
          id: shift.id,
          date: shift.date,
          type: shift.type,
          supervisor: shift.supervisor,
          start_time: shift.startTime,
          end_time: shift.endTime || null
        }
        
        await supabase
          .from('shifts')
          .insert(supabaseShift)
        
        // Add assigned porters if any
        if (shift.assignedPorters && shift.assignedPorters.length > 0) {
          const porterAssignments = shift.assignedPorters.map((porter: string) => ({
            id: nanoid(),
            shift_id: shift.id,
            porter_id: porter
          }))
          
          await supabase
            .from('shift_assigned_porters')
            .insert(porterAssignments)
        }
        
        // Add porter assignments if any
        if (shift.porterAssignments && shift.porterAssignments.length > 0) {
          const assignments = shift.porterAssignments.map((assignment: PorterAssignment) => ({
            id: assignment.id,
            shift_id: shift.id,
            porter_id: assignment.porterId,
            department_id: assignment.departmentId,
            start_time: assignment.startTime,
            end_time: assignment.endTime || null,
            notes: assignment.notes || null
          }))
          
          await supabase
            .from('porter_assignments')
            .insert(assignments)
        }
        
        // Add tasks if any
        if (shift.tasks && shift.tasks.length > 0) {
          const supabaseTasks = shift.tasks.map((task: Task) => ({
            id: task.id,
            shift_id: shift.id,
            received_time: task.receivedTime,
            allocated_time: task.allocatedTime,
            completed_time: task.completedTime || null,
            status: task.status,
            job_category: task.jobCategory,
            item_type: task.itemType,
            from_building: task.fromLocation.building,
            from_location_id: task.fromLocation.locationId,
            to_building: task.toLocation.building,
            to_location_id: task.toLocation.locationId,
            allocated_staff: task.allocatedStaff || null
          }))
          
          await supabase
            .from('tasks')
            .insert(supabaseTasks)
        }
      }
    } catch (error) {
      console.error('Error migrating archived shifts:', error)
    }
  }
}

// Migrate settings data
export async function migrateSettings() {
  // Implementation will be imported from database.ts
}

// Migrate locations data
export async function migrateLocations() {
  // Implementation will be imported from database.ts
}
