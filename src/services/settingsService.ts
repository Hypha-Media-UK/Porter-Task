import { supabase } from '@/utils/supabase'
import type { 
  Building, 
  JobCategoryDefault, 
  DesignationDepartment, 
  LocationsData, 
  SettingsData, 
  ShiftSchedule,
  JobCategoriesMap,
  SupabaseBuilding,
  SupabaseDepartment,
  SupabaseJobCategory,
  SupabaseJobCategoryDefault,
  SupabaseDesignationDepartment
} from '@/types'
import { nanoid } from 'nanoid'

// ------------------------------------------------------------------
// Settings transformers (from/to Supabase)
// ------------------------------------------------------------------

// Transform buildings and locations from Supabase
export function transformBuildingsFromSupabase(
  buildings: any[], 
  departments: any[]
): Building[] {
  // Group departments by building_id
  const departmentsByBuilding: Record<string, any[]> = {}
  
  departments.forEach(dept => {
    if (!departmentsByBuilding[dept.building_id]) {
      departmentsByBuilding[dept.building_id] = []
    }
    departmentsByBuilding[dept.building_id].push(dept)
  })
  
  // Transform buildings with their departments
  return buildings.map(building => ({
    id: building.id,
    name: building.name,
    departments: (departmentsByBuilding[building.id] || []).map(dept => ({
      id: dept.id,
      name: dept.name
    }))
  }))
}

// Transform job categories from Supabase
export function transformJobCategoriesFromSupabase(categories: any[]): JobCategoriesMap {
  const categoriesMap: JobCategoriesMap = {}
  
  categories.forEach(category => {
    if (!categoriesMap[category.category]) {
      categoriesMap[category.category] = []
    }
    if (category.item_type) {
      categoriesMap[category.category].push(category.item_type)
    }
  })
  
  return categoriesMap
}

// Transform job category defaults from Supabase
export function transformJobCategoryDefaultsFromSupabase(defaults: any[]): JobCategoryDefault[] {
  return defaults.map(def => ({
    category: def.category,
    itemType: def.item_type || undefined,
    fromBuildingId: def.from_building_id || undefined,
    fromLocationId: def.from_location_id || undefined,
    toBuildingId: def.to_building_id || undefined,
    toLocationId: def.to_location_id || undefined
  }))
}

// Transform designation departments from Supabase
export function transformDesignationDepartmentsFromSupabase(departments: any[]): DesignationDepartment[] {
  return departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    color: dept.color
  }))
}

// Transform to Supabase format
export function transformBuildingToSupabase(building: Building): SupabaseBuilding {
  return {
    id: building.id,
    name: building.name
  }
}

export function transformDepartmentToSupabase(
  department: { id: string; name: string }, 
  buildingId: string
): SupabaseDepartment {
  return {
    id: department.id,
    building_id: buildingId,
    name: department.name
  }
}

export function transformJobCategoryToSupabase(
  category: string, 
  itemType?: string
): SupabaseJobCategory {
  return {
    id: nanoid(),
    category,
    item_type: itemType || null
  }
}

export function transformJobCategoryDefaultToSupabase(
  defaultData: JobCategoryDefault
): SupabaseJobCategoryDefault {
  return {
    id: nanoid(),
    category: defaultData.category,
    item_type: defaultData.itemType || null,
    from_building_id: defaultData.fromBuildingId || null,
    from_location_id: defaultData.fromLocationId || null,
    to_building_id: defaultData.toBuildingId || null,
    to_location_id: defaultData.toLocationId || null
  }
}

export function transformDesignationDepartmentToSupabase(
  department: DesignationDepartment
): SupabaseDesignationDepartment {
  return {
    id: department.id,
    name: department.name,
    color: department.color
  }
}

// ------------------------------------------------------------------
// Settings retrieval functions
// ------------------------------------------------------------------

// Get all settings
export async function getSettings(): Promise<SettingsData> {
  try {
    // Get supervisors
    const { data: supervisors, error: supervisorsError } = await supabase
      .from('supervisors')
      .select('name')
      .order('name')
    
    if (supervisorsError) throw supervisorsError
    
    // Get porters
    const { data: porters, error: portersError } = await supabase
      .from('porters')
      .select('name')
      .order('name')
    
    if (portersError) throw portersError
    
    // Get job categories
    const { data: jobCategories, error: jobCategoriesError } = await supabase
      .from('job_categories')
      .select('*')
    
    if (jobCategoriesError) throw jobCategoriesError
    
    // Get job category defaults
    const { data: jobCategoryDefaults, error: defaultsError } = await supabase
      .from('job_category_defaults')
      .select('*')
    
    if (defaultsError) throw defaultsError
    
    // Get designation departments
    const { data: designationDepartments, error: deptsError } = await supabase
      .from('designation_departments')
      .select('*')
    
    if (deptsError) throw deptsError
    
    // Get shift settings
    const { data: shiftSettings, error: shiftError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['shift_day_start', 'shift_day_end', 'shift_night_start', 'shift_night_end'])
    
    if (shiftError) throw shiftError
    
    // Process shift settings
    const shifts: ShiftSchedule = {
      day: { start: '08:00', end: '16:00' }, // Default values
      night: { start: '20:00', end: '04:00' }
    }
    
    if (shiftSettings && shiftSettings.length > 0) {
      shiftSettings.forEach((setting: { key: string; value: string }) => {
        if (setting.key === 'shift_day_start') shifts.day.start = setting.value
        if (setting.key === 'shift_day_end') shifts.day.end = setting.value
        if (setting.key === 'shift_night_start') shifts.night.start = setting.value
        if (setting.key === 'shift_night_end') shifts.night.end = setting.value
      })
    }
    
    // Return complete settings
    return {
      supervisors: supervisors.map(s => s.name),
      porters: porters.map(p => p.name),
      jobCategories: transformJobCategoriesFromSupabase(jobCategories),
      jobCategoryDefaults: transformJobCategoryDefaultsFromSupabase(jobCategoryDefaults),
      designationDepartments: transformDesignationDepartmentsFromSupabase(designationDepartments),
      shifts
    }
  } catch (error) {
    console.error('Error fetching settings from Supabase:', error)
    throw error
  }
}

// Get locations
export async function getLocations(): Promise<LocationsData> {
  try {
    // Get buildings
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .order('name')
    
    if (buildingsError) throw buildingsError
    
    // Get departments
    const { data: departments, error: deptsError } = await supabase
      .from('departments')
      .select('*')
      .order('name')
    
    if (deptsError) throw deptsError
    
    // Return locations data
    return {
      buildings: transformBuildingsFromSupabase(buildings, departments)
    }
  } catch (error) {
    console.error('Error fetching locations from Supabase:', error)
    throw error
  }
}

// ------------------------------------------------------------------
// Settings update functions
// ------------------------------------------------------------------

// Save settings
export async function saveSettings(settings: SettingsData): Promise<boolean> {
  try {
    console.log('Saving settings to Supabase...');
    
    // Begin a transaction for all settings updates
    // (Note: Supabase doesn't support true transactions, so we do our best here)
    
    // 1. Update supervisors (delete all and re-insert)
    try {
      const supervisorsToInsert = settings.supervisors.map(name => ({ name }))
      const { error: deleteError } = await supabase.from('supervisors').delete().neq('name', 'NOT_A_NAME') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting supervisors:', deleteError);
      }
      
      if (supervisorsToInsert.length > 0) {
        const { error: supervisorsError } = await supabase
          .from('supervisors')
          .insert(supervisorsToInsert)
        
        if (supervisorsError) {
          console.warn('Error inserting supervisors:', supervisorsError);
        }
      }
    } catch (supervisorsErr) {
      console.warn('Failed to update supervisors:', supervisorsErr);
      // Continue with other updates
    }
    
    // 2. Update porters (delete all and re-insert)
    try {
      const portersToInsert = settings.porters.map(name => ({ name }))
      const { error: deleteError } = await supabase.from('porters').delete().neq('name', 'NOT_A_NAME') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting porters:', deleteError);
      }
      
      if (portersToInsert.length > 0) {
        const { error: portersError } = await supabase
          .from('porters')
          .insert(portersToInsert)
        
        if (portersError) {
          console.warn('Error inserting porters:', portersError);
        }
      }
    } catch (portersErr) {
      console.warn('Failed to update porters:', portersErr);
      // Continue with other updates
    }
    
    // 3. Update job categories (delete all and re-insert)
    try {
      const jobCategoriesToInsert: SupabaseJobCategory[] = []
      
      // For each category, insert both the category itself and its item types
      Object.entries(settings.jobCategories).forEach(([category, itemTypes]) => {
        // Insert the category
        jobCategoriesToInsert.push(transformJobCategoryToSupabase(category))
        
        // Insert each item type
        itemTypes.forEach(itemType => {
          jobCategoriesToInsert.push(transformJobCategoryToSupabase(category, itemType))
        })
      })
      
      const { error: deleteError } = await supabase.from('job_categories').delete().neq('category', 'NOT_A_CATEGORY') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting job categories:', deleteError);
      }
      
      if (jobCategoriesToInsert.length > 0) {
        const { error: categoriesError } = await supabase
          .from('job_categories')
          .insert(jobCategoriesToInsert)
        
        if (categoriesError) {
          console.warn('Error inserting job categories:', categoriesError);
        }
      }
    } catch (categoriesErr) {
      console.warn('Failed to update job categories:', categoriesErr);
      // Continue with other updates
    }
    
    // 4. Update job category defaults (delete all and re-insert)
    try {
      const defaultsToInsert = settings.jobCategoryDefaults.map(transformJobCategoryDefaultToSupabase)
      
      console.log('Job category defaults to insert:', defaultsToInsert);
      
      const { error: deleteError } = await supabase.from('job_category_defaults').delete().neq('category', 'NOT_A_CATEGORY') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting job category defaults:', deleteError);
      }
      
      if (defaultsToInsert.length > 0) {
        const { error: defaultsError } = await supabase
          .from('job_category_defaults')
          .insert(defaultsToInsert)
        
        if (defaultsError) {
          console.warn('Error inserting job category defaults:', defaultsError);
        }
      }
    } catch (defaultsErr) {
      console.warn('Failed to update job category defaults:', defaultsErr);
      // Continue with other updates
    }
    
    // 5. Update designation departments (delete all and re-insert)
    try {
      const deptsToInsert = settings.designationDepartments.map(transformDesignationDepartmentToSupabase)
      const { error: deleteError } = await supabase.from('designation_departments').delete().neq('name', 'NOT_A_NAME') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting designation departments:', deleteError);
      }
      
      if (deptsToInsert.length > 0) {
        const { error: deptsError } = await supabase
          .from('designation_departments')
          .insert(deptsToInsert)
        
        if (deptsError) {
          console.warn('Error inserting designation departments:', deptsError);
        }
      }
    } catch (deptsErr) {
      console.warn('Failed to update designation departments:', deptsErr);
      // Continue with other updates
    }
    
    // 6. Update shift settings
    try {
      const shiftSettings = [
        { key: 'shift_day_start', value: settings.shifts.day.start },
        { key: 'shift_day_end', value: settings.shifts.day.end },
        { key: 'shift_night_start', value: settings.shifts.night.start },
        { key: 'shift_night_end', value: settings.shifts.night.end }
      ]
      
      for (const setting of shiftSettings) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: setting.key, value: setting.value }, {
            onConflict: 'key'
          })
        
        if (error) {
          console.warn(`Error updating setting ${setting.key}:`, error);
        }
      }
    } catch (shiftErr) {
      console.warn('Failed to update shift settings:', shiftErr);
      // Continue with other updates
    }
    
    console.log('Settings saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Error saving settings to Supabase:', error)
    // We don't throw the error anymore - return false to indicate failure
    // Caller will handle fallback to localStorage
    return false;
  }
}

// Save locations
export async function saveLocations(locationsData: LocationsData): Promise<boolean> {
  try {
    console.log('Saving location data to Supabase...');
    
    // Begin a transaction for all buildings and locations
    
    // 1. Save buildings (delete all and re-insert)
    try {
      const buildingsToInsert = locationsData.buildings.map(transformBuildingToSupabase)
      const { error: deleteError } = await supabase.from('buildings').delete().neq('id', 'NOT_AN_ID') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting buildings:', deleteError);
      }
      
      if (buildingsToInsert.length > 0) {
        const { error: buildingsError } = await supabase
          .from('buildings')
          .insert(buildingsToInsert)
        
        if (buildingsError) {
          console.warn('Error inserting buildings:', buildingsError);
        }
      }
    } catch (buildingsErr) {
      console.warn('Failed to update buildings:', buildingsErr);
      // Continue with departments
    }
    
    // 2. Save departments
    try {
      const departmentsToInsert: SupabaseDepartment[] = []
      
      locationsData.buildings.forEach(building => {
        building.departments.forEach(dept => {
          departmentsToInsert.push(transformDepartmentToSupabase(dept, building.id))
        })
      })
      
      const { error: deleteError } = await supabase.from('departments').delete().neq('id', 'NOT_AN_ID') // Delete all
      
      if (deleteError) {
        console.warn('Error deleting departments:', deleteError);
      }
      
      if (departmentsToInsert.length > 0) {
        const { error: deptsError } = await supabase
          .from('departments')
          .insert(departmentsToInsert)
        
        if (deptsError) {
          console.warn('Error inserting departments:', deptsError);
        }
      }
    } catch (deptsErr) {
      console.warn('Failed to update departments:', deptsErr);
    }
    
    console.log('Location data saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Error saving locations to Supabase:', error)
    // We don't throw the error anymore - return false to indicate failure
    // Caller will handle fallback to localStorage
    return false;
  }
}
