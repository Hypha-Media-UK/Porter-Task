import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, generateId } from '@/utils/supabase'
import type {
  SettingsData,
  Building,
  Department,
  DesignationDepartment,
  JobCategoryDefault,
  ShiftSchedule,
  JobCategoriesMap
} from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const supervisors = ref<string[]>([])
  const porters = ref<string[]>([])
  const buildings = ref<Building[]>([])
  const jobCategories = ref<JobCategoriesMap>({})
  const jobCategoryDefaults = ref<JobCategoryDefault[]>([])
  const designationDepartments = ref<DesignationDepartment[]>([])
  const shifts = ref<ShiftSchedule>({
    day: { start: '08:00', end: '20:00' },
    night: { start: '20:00', end: '08:00' }
  })
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed
  const allDepartments = computed(() => {
    const departments: { id: string; name: string; buildingId: string; buildingName: string; frequent?: boolean }[] = []
    
    buildings.value.forEach(building => {
      building.departments.forEach(dept => {
        departments.push({
          id: dept.id,
          name: dept.name,
          buildingId: building.id,
          buildingName: building.name,
          frequent: dept.frequent
        })
      })
    })
    
    return departments
  })
  
  // Get all departments, but with frequent ones first
  const sortedDepartments = computed(() => {
    return [...allDepartments.value].sort((a, b) => {
      // Frequent departments first
      if (a.frequent && !b.frequent) return -1
      if (!a.frequent && b.frequent) return 1
      // Then alphabetically by name
      return a.name.localeCompare(b.name)
    })
  })
  
  // Actions
  async function initialize() {
    isLoading.value = true
    error.value = null
    
    try {
      await Promise.all([
        loadSupervisors(),
        loadPorters(),
        loadBuildings(),
        loadJobCategories(),
        loadJobCategoryDefaults(),
        loadDesignationDepartments(),
        loadShiftSettings()
      ])
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unknown error occurred'
      }
      console.error('Error initializing settings:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  async function loadSupervisors() {
    const { data, error: fetchError } = await supabase
      .from('supervisors')
      .select('name')
      .order('name')
    
    if (fetchError) throw fetchError
    
    supervisors.value = data.map(s => s.name)
  }
  
  async function loadPorters() {
    const { data, error: fetchError } = await supabase
      .from('porters')
      .select('name')
      .order('name')
    
    if (fetchError) throw fetchError
    
    porters.value = data.map(p => p.name)
  }
  
  async function loadBuildings() {
    // First load all buildings
    const { data: buildingsData, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .order('name')
    
    if (buildingsError) throw buildingsError
    
    // Then load all departments
    const { data: departmentsData, error: deptsError } = await supabase
      .from('departments')
      .select('*')
      .order('name')
    
    if (deptsError) throw deptsError
    
    // Process the data into the format we need
    const processedBuildings: Building[] = buildingsData.map(building => {
      // Get departments for this building
      const buildingDepartments = departmentsData
        .filter(dept => dept.building_id === building.id)
        .map(dept => ({
          id: dept.id,
          name: dept.name,
          frequent: false // We'll populate this separately
        }))
      
      return {
        id: building.id,
        name: building.name,
        departments: buildingDepartments
      }
    })
    
    buildings.value = processedBuildings
  }
  
  async function loadJobCategories() {
    const { data, error: fetchError } = await supabase
      .from('job_categories')
      .select('*')
    
    if (fetchError) throw fetchError
    
    // Process into the format we need (category -> items)
    const categories: JobCategoriesMap = {}
    
    data.forEach(item => {
      const category = item.category
      const itemType = item.item_type
      
      if (!categories[category]) {
        categories[category] = []
      }
      
      if (itemType) {
        categories[category].push(itemType)
      }
    })
    
    jobCategories.value = categories
  }
  
  async function loadJobCategoryDefaults() {
    const { data, error: fetchError } = await supabase
      .from('job_category_defaults')
      .select('*')
    
    if (fetchError) throw fetchError
    
    // Process into the format we need
    jobCategoryDefaults.value = data.map(item => ({
      id: item.id,
      category: item.category,
      itemType: item.item_type || undefined,
      fromBuildingId: item.from_building_id || undefined,
      fromLocationId: item.from_location_id || undefined,
      toBuildingId: item.to_building_id || undefined,
      toLocationId: item.to_location_id || undefined
    }))
  }
  
  async function loadDesignationDepartments() {
    const { data, error: fetchError } = await supabase
      .from('designation_departments')
      .select('*')
      .order('name')
    
    if (fetchError) throw fetchError
    
    designationDepartments.value = data.map(dept => ({
      id: dept.id,
      name: dept.name,
      color: dept.color
    }))
  }
  
  async function loadShiftSettings() {
    const { data, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['shift_day_start', 'shift_day_end', 'shift_night_start', 'shift_night_end'])
    
    if (fetchError) throw fetchError
    
    // Default values
    const shiftSettings: ShiftSchedule = {
      day: { start: '08:00', end: '20:00' },
      night: { start: '20:00', end: '08:00' }
    }
    
    // Update with stored values
    data.forEach(item => {
      if (item.key === 'shift_day_start') shiftSettings.day.start = item.value
      if (item.key === 'shift_day_end') shiftSettings.day.end = item.value
      if (item.key === 'shift_night_start') shiftSettings.night.start = item.value
      if (item.key === 'shift_night_end') shiftSettings.night.end = item.value
    })
    
    shifts.value = shiftSettings
  }
  
  // Get default locations for job category/item
  function getJobCategoryDefault(category: string, itemType?: string): JobCategoryDefault | undefined {
    // First look for a specific item match
    if (itemType) {
      const specificDefault = jobCategoryDefaults.value.find(
        d => d.category === category && d.itemType === itemType
      )
      
      if (specificDefault) return specificDefault
    }
    
    // Then look for a category-level default (with no itemType)
    return jobCategoryDefaults.value.find(
      d => d.category === category && !d.itemType
    )
  }
  
  // CRUD operations for settings
  
  // Shift schedule methods
  async function updateShiftSchedule(newSchedule: ShiftSchedule) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updates = [
        { key: 'shift_day_start', value: newSchedule.day.start },
        { key: 'shift_day_end', value: newSchedule.day.end },
        { key: 'shift_night_start', value: newSchedule.night.start },
        { key: 'shift_night_end', value: newSchedule.night.end }
      ];
      
      // Update each setting
      for (const update of updates) {
        await supabase
          .from('settings')
          .update({ value: update.value })
          .eq('key', update.key);
      }
      
      // Update local state
      shifts.value = { ...newSchedule };
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update shift schedule';
      }
      console.error('Error updating shift schedule:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Supervisor methods
  async function addSupervisor(name: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('supervisors')
        .insert([{ name, active: true }])
        .select();
      
      if (insertError) throw insertError;
      
      // Refresh supervisors list
      await loadSupervisors();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add supervisor';
      }
      console.error('Error adding supervisor:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateSupervisor(oldName: string, newName: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // First find the supervisor
      const { data, error: fetchError } = await supabase
        .from('supervisors')
        .select('id')
        .eq('name', oldName)
        .single();
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Supervisor not found');
      
      // Update the supervisor
      const { error: updateError } = await supabase
        .from('supervisors')
        .update({ name: newName })
        .eq('id', data.id);
      
      if (updateError) throw updateError;
      
      // Refresh supervisors list
      await loadSupervisors();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update supervisor';
      }
      console.error('Error updating supervisor:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteSupervisor(name: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // First find the supervisor
      const { data, error: fetchError } = await supabase
        .from('supervisors')
        .select('id')
        .eq('name', name)
        .single();
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Supervisor not found');
      
      // Delete the supervisor
      const { error: deleteError } = await supabase
        .from('supervisors')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) throw deleteError;
      
      // Refresh supervisors list
      await loadSupervisors();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete supervisor';
      }
      console.error('Error deleting supervisor:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Porter methods
  async function addPorter(name: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('porters')
        .insert([{ name, active: true }])
        .select();
      
      if (insertError) throw insertError;
      
      // Refresh porters list
      await loadPorters();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add porter';
      }
      console.error('Error adding porter:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updatePorter(oldName: string, newName: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // First find the porter
      const { data, error: fetchError } = await supabase
        .from('porters')
        .select('id')
        .eq('name', oldName)
        .single();
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Porter not found');
      
      // Update the porter
      const { error: updateError } = await supabase
        .from('porters')
        .update({ name: newName })
        .eq('id', data.id);
      
      if (updateError) throw updateError;
      
      // Refresh porters list
      await loadPorters();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update porter';
      }
      console.error('Error updating porter:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deletePorter(name: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // First find the porter
      const { data, error: fetchError } = await supabase
        .from('porters')
        .select('id')
        .eq('name', name)
        .single();
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Porter not found');
      
      // Delete the porter
      const { error: deleteError } = await supabase
        .from('porters')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) throw deleteError;
      
      // Refresh porters list
      await loadPorters();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete porter';
      }
      console.error('Error deleting porter:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Building and department methods
  async function addBuilding(name: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('buildings')
        .insert([{ name, active: true }])
        .select();
      
      if (insertError) throw insertError;
      
      // Refresh buildings list
      await loadBuildings();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add building';
      }
      console.error('Error adding building:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateBuilding(id: string, name: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: updateError } = await supabase
        .from('buildings')
        .update({ name })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Refresh buildings list
      await loadBuildings();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update building';
      }
      console.error('Error updating building:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteBuilding(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Refresh buildings list
      await loadBuildings();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete building';
      }
      console.error('Error deleting building:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function addDepartment(buildingId: string, name: string, frequent: boolean = false) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('departments')
        .insert([{ 
          building_id: buildingId,
          name,
          frequent,
          active: true
        }])
        .select();
      
      if (insertError) throw insertError;
      
      // Refresh buildings list to get updated departments
      await loadBuildings();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add department';
      }
      console.error('Error adding department:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateDepartment(id: string, name: string, frequent: boolean) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: updateError } = await supabase
        .from('departments')
        .update({ name, frequent })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Refresh buildings list to get updated departments
      await loadBuildings();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update department';
      }
      console.error('Error updating department:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteDepartment(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Refresh buildings list to get updated departments
      await loadBuildings();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete department';
      }
      console.error('Error deleting department:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Designation department methods
  async function addDesignationDepartment(name: string, color: string = '#0066cc') {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('designation_departments')
        .insert([{ name, color, active: true }])
        .select();
      
      if (insertError) throw insertError;
      
      // Refresh designation departments list
      await loadDesignationDepartments();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add designation department';
      }
      console.error('Error adding designation department:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateDesignationDepartment(id: string, name: string, color: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: updateError } = await supabase
        .from('designation_departments')
        .update({ name, color })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Refresh designation departments list
      await loadDesignationDepartments();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update designation department';
      }
      console.error('Error updating designation department:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteDesignationDepartment(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('designation_departments')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Refresh designation departments list
      await loadDesignationDepartments();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete designation department';
      }
      console.error('Error deleting designation department:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Job category methods
  async function addJobCategory(category: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('job_categories')
        .insert([{ 
          category, 
          item_type: null,
          active: true 
        }])
        .select();
      
      if (insertError) throw insertError;
      
      // Update local state
      jobCategories.value[category] = [];
      
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add job category';
      }
      console.error('Error adding job category:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateJobCategory(oldCategory: string, newCategory: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Update all records for this category
      const { error: updateError } = await supabase
        .from('job_categories')
        .update({ category: newCategory })
        .eq('category', oldCategory);
      
      if (updateError) throw updateError;
      
      // Refresh job categories
      await loadJobCategories();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update job category';
      }
      console.error('Error updating job category:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteJobCategory(category: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Delete all records for this category
      const { error: deleteError } = await supabase
        .from('job_categories')
        .delete()
        .eq('category', category);
      
      if (deleteError) throw deleteError;
      
      // Refresh job categories
      await loadJobCategories();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete job category';
      }
      console.error('Error deleting job category:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function addJobCategoryItem(category: string, itemType: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('job_categories')
        .insert([{ 
          category, 
          item_type: itemType,
          active: true 
        }])
        .select();
      
      if (insertError) throw insertError;
      
      // Update local state
      if (!jobCategories.value[category]) {
        jobCategories.value[category] = [];
      }
      jobCategories.value[category].push(itemType);
      
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to add job item';
      }
      console.error('Error adding job item:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateJobCategoryItem(category: string, oldItemType: string | undefined, newItemType: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Debug the parameters
      console.log('Updating job item with params:', { category, oldItemType, newItemType });
      
      // If oldItemType is undefined, we're adding a new item rather than updating
      if (!category) {
        throw new Error('Category is required for job item operations');
      }
      
      // If there's no oldItemType, we're adding a new item
      if (!oldItemType) {
        return await addJobCategoryItem(category, newItemType);
      }
      
      // Find the record
      const { data, error: fetchError } = await supabase
        .from('job_categories')
        .select('id')
        .eq('category', category)
        .eq('item_type', oldItemType)
        .single();
      
      if (fetchError) {
        console.error('Error finding job item:', fetchError);
        throw fetchError;
      }
      
      if (!data || !data.id) {
        throw new Error(`Job item not found for category: ${category}, type: ${oldItemType}`);
      }
      
      console.log('Found job item with ID:', data.id);
      
      // Update the record
      const { error: updateError } = await supabase
        .from('job_categories')
        .update({ item_type: newItemType })
        .eq('id', data.id);
      
      if (updateError) throw updateError;
      
      // Refresh job categories
      await loadJobCategories();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to update job item';
      }
      console.error('Error updating job item:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteJobCategoryItem(category: string, itemType: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Find the record
      const { data, error: fetchError } = await supabase
        .from('job_categories')
        .select('id')
        .eq('category', category)
        .eq('item_type', itemType)
        .single();
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Job item not found');
      
      // Delete the record
      const { error: deleteError } = await supabase
        .from('job_categories')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) throw deleteError;
      
      // Refresh job categories
      await loadJobCategories();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to delete job item';
      }
      console.error('Error deleting job item:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    // State
    supervisors,
    porters,
    buildings,
    jobCategories,
    jobCategoryDefaults,
    designationDepartments,
    shifts,
    isLoading,
    error,
    
    // Computed
    allDepartments,
    sortedDepartments,
    
    // Actions
    initialize,
    getJobCategoryDefault,
    
    // CRUD operations
    // Shift schedule
    updateShiftSchedule,
    
    // Supervisors
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,
    
    // Porters
    addPorter,
    updatePorter,
    deletePorter,
    
    // Buildings and departments
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Designation departments
    addDesignationDepartment,
    updateDesignationDepartment,
    deleteDesignationDepartment,
    
    // Job categories and items
    addJobCategory,
    updateJobCategory,
    deleteJobCategory,
    addJobCategoryItem,
    updateJobCategoryItem,
    deleteJobCategoryItem
  }
})
