import * as db from '@/services/database'
import type { Shift } from '@/types'
import { 
  currentShift, 
  archivedShifts, 
  isLoading, 
  error, 
  CURRENT_SHIFT_STORAGE_KEY,
  ARCHIVED_SHIFTS_STORAGE_KEY,
  CURRENT_SHIFT_ID_SESSION_KEY, // Add session storage key
  ensureShiftArrays 
} from './shiftCore'

/**
 * Load shift data from database with fallbacks
 */
export async function loadShiftData(): Promise<boolean> {
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
 * Load current shift from database with localStorage fallback and session persistence
 */
export async function loadCurrentShift(): Promise<boolean> {
  try {
    // First check if we have a shift ID in sessionStorage (for page refreshes)
    const sessionShiftId = sessionStorage.getItem(CURRENT_SHIFT_ID_SESSION_KEY)
    
    if (sessionShiftId) {
      console.log('Found shift ID in session storage, attempting to load shift:', sessionShiftId)
      
      try {
        // Try to load the shift by ID from database
        const shift = await db.getShift(sessionShiftId)
        
        if (shift) {
          currentShift.value = ensureShiftArrays(shift)
          console.log('Loaded current shift from database using session ID:', shift)
          return true
        } else {
          console.warn('Shift ID from session not found in database:', sessionShiftId)
        }
      } catch (dbErr) {
        console.warn('Error loading shift from database using session ID, checking localStorage:', dbErr)
      }
    }
    
    // Next try to load the active shift from database
    try {
      const shift = await db.getCurrentShift()
      
      if (shift) {
        currentShift.value = ensureShiftArrays(shift)
        // Save the ID to session storage for page refresh persistence
        if (shift.id) {
          sessionStorage.setItem(CURRENT_SHIFT_ID_SESSION_KEY, shift.id)
        }
        console.log('Loaded current shift from database:', shift)
        return true
      }
    } catch (dbErr) {
      console.warn('Error loading current shift from database, falling back to localStorage:', dbErr)
    }
    
    // Fall back to localStorage if database fails
    const storedShift = localStorage.getItem(CURRENT_SHIFT_STORAGE_KEY)
    
    if (storedShift) {
      try {
        const parsedShift = JSON.parse(storedShift) as Shift
        currentShift.value = ensureShiftArrays(parsedShift)
        
        // Save the ID to session storage for page refresh persistence
        if (parsedShift.id) {
          sessionStorage.setItem(CURRENT_SHIFT_ID_SESSION_KEY, parsedShift.id)
        }
        
        console.log('Loaded current shift from localStorage:', parsedShift)
        return true
      } catch (parseErr) {
        console.error('Error parsing stored shift:', parseErr)
      }
    }
    
    // No current shift found
    console.log('No current shift found in database or localStorage')
    currentShift.value = null
    sessionStorage.removeItem(CURRENT_SHIFT_ID_SESSION_KEY)
    
    return true
  } catch (err) {
    console.error('Error loading current shift:', err)
    currentShift.value = null
    return false
  }
}

/**
 * Load archived shifts from database with localStorage fallback
 */
export async function loadArchivedShifts(): Promise<boolean> {
  try {
    // First try to load from Supabase
    try {
      const shifts = await db.getArchivedShifts()
      // Filter out any null values and ensure we have a Shift[]
      archivedShifts.value = shifts.filter((s): s is Shift => s !== null)
      console.log('Loaded archived shifts from database:', shifts.length)
      return true
    } catch (dbErr) {
      console.warn('Error loading archived shifts from database, falling back to localStorage:', dbErr)
      
      // Fall back to localStorage
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
      
      console.log('No archived shifts found in database or localStorage')
      archivedShifts.value = []
      return true
    }
  } catch (err) {
    console.error('Error loading archived shifts:', err)
    return false
  }
}

/**
 * Get archived shift by ID
 */
export async function getShift(shiftId: string): Promise<Shift | null> {
  // Check if already loaded in archived shifts
  const cached = archivedShifts.value.find(s => s.id === shiftId)
  if (cached) return cached
  
  // Check if it's the current shift
  if (currentShift.value && currentShift.value.id === shiftId) {
    return currentShift.value
  }
  
  isLoading.value = true
  
  try {
    // Get the shift from database
    const shift = await db.getShift(shiftId)
    if (shift) {
      return ensureShiftArrays(shift)
    }
    return null
  } catch (err) {
    console.error(`Error loading shift ${shiftId} from database:`, err)
    
    try {
      // Fallback to fetching from local file
      const response = await fetch(`/data/shifts/${shiftId}.json`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to load shift: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return ensureShiftArrays(data as Shift)
    } catch (fileErr) {
      console.error(`Error loading shift ${shiftId} from file:`, fileErr)
      return null
    }
  } finally {
    isLoading.value = false
  }
}
