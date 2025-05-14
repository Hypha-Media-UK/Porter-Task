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
    // Begin a transaction for all settings updates
    // (Note: Supabase doesn't support true transactions, so we do our best here)
    
    // 1. Update supervisors (delete all and re-insert)
    const supervisorsToInsert = settings.supervisors.map(name => ({ name }))
    await supabase.from('supervisors').delete().gt('id', 0) // Delete all
    if (supervisorsToInsert.length > 0) {
      const { error: supervisorsError } = await supabase
        .from('supervisors')
        .insert(supervisorsToInsert)
      
      if (supervisorsError) throw supervisorsError
    }
    
    // 2. Update porters (delete all and re-insert)
    const portersToInsert = settings.porters.map(name => ({ name }))
    await supabase.from('porters').delete().gt('id', 0) // Delete all
    if (portersToInsert.length > 0) {
      const { error: portersError } = await supabase
        .from('porters')
        .insert(portersToInsert)
      
      if (portersError) throw portersError
    }
    
    // 3. Update job categories (delete all and re-insert)
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
    
    await supabase.from('job_categories').delete().gt('id', 0) // Delete all
    if (jobCategoriesToInsert.length > 0) {
      const { error: categoriesError } = await supabase
        .from('job_categories')
        .insert(jobCategoriesToInsert)
      
      if (categoriesError) throw categoriesError
    }
    
    // 4. Update job category defaults (delete all and re-insert)
    const defaultsToInsert = settings.jobCategoryDefaults.map(transformJobCategoryDefaultToSupabase)
    await supabase.from('job_category_defaults').delete().gt('id', 0) // Delete all
    if (defaultsToInsert.length > 0) {
      const { error: defaultsError } = await supabase
        .from('job_category_defaults')
        .insert(defaultsToInsert)
      
      if (defaultsError) throw defaultsError
    }
    
    // 5. Update designation departments (delete all and re-insert)
    const deptsToInsert = settings.designationDepartments.map(transformDesignationDepartmentToSupabase)
    await supabase.from('designation_departments').delete().gt('id', 0) // Delete all
    if (deptsToInsert.length > 0) {
      const { error: deptsError } = await supabase
        .from('designation_departments')
        .insert(deptsToInsert)
      
      if (deptsError) throw deptsError
    }
    
    // 6. Update shift settings
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
      
      if (error) throw error
    }
    
    return true
  } catch (error) {
    console.error('Error saving settings to Supabase:', error)
    throw error
  }
}

// Save locations
export async function saveLocations(locationsData: LocationsData): Promise<boolean> {
  try {
    // Begin a transaction for all buildings and locations
    
    // 1. Save buildings (delete all and re-insert)
    const buildingsToInsert = locationsData.buildings.map(transformBuildingToSupabase)
    await supabase.from('buildings').delete().gt('id', 0) // Delete all
    if (buildingsToInsert.length > 0) {
      const { error: buildingsError } = await supabase
        .from('buildings')
        .insert(buildingsToInsert)
      
      if (buildingsError) throw buildingsError
    }
    
    // 2. Save departments
    const departmentsToInsert: SupabaseDepartment[] = []
    
    locationsData.buildings.forEach(building => {
      building.departments.forEach(dept => {
        departmentsToInsert.push(transformDepartmentToSupabase(dept, building.id))
      })
    })
    
    await supabase.from('departments').delete().gt('id', 0) // Delete all
    if (departmentsToInsert.length > 0) {
      const { error: deptsError } = await supabase
        .from('departments')
        .insert(departmentsToInsert)
      
      if (deptsError) throw deptsError
    }
    
    return true
  } catch (error) {
    console.error('Error saving locations to Supabase:', error)
    throw error
  }
}
