import { useSettingsStore } from '../stores/settings'
import type { Task, Location } from '@/types'

/**
 * Fill in displayName for locations by looking up the building and location IDs
 * in the settings store's buildings data.
 * 
 * @param task The task containing locations to be populated with display names
 * @returns The task with populated location display names
 */
export function populateLocationDisplayNames(task: Task): Task {
  // Get the settings store
  const settingsStore = useSettingsStore()
  const { buildings } = settingsStore
  
  // Find the from location's display name
  if (task.fromLocation && task.fromLocation.building && task.fromLocation.locationId) {
    const building = buildings.find(b => b.id === task.fromLocation.building)
    if (building) {
      const location = building.departments.find(d => d.id === task.fromLocation.locationId)
      if (location) {
        task.fromLocation.displayName = location.name
      }
    }
  }
  
  // Find the to location's display name
  if (task.toLocation && task.toLocation.building && task.toLocation.locationId) {
    const building = buildings.find(b => b.id === task.toLocation.building)
    if (building) {
      const location = building.departments.find(d => d.id === task.toLocation.locationId)
      if (location) {
        task.toLocation.displayName = location.name
      }
    }
  }
  
  return task
}

/**
 * Fill in displayName for all tasks in a list
 * 
 * @param tasks The tasks to populate with display names
 * @returns The tasks with populated location display names
 */
export function populateTasksLocationDisplayNames(tasks: Task[]): Task[] {
  return tasks.map(task => populateLocationDisplayNames(task))
}
