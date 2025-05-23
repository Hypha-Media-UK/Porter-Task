import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { JobCategoriesMap, SettingsData, Building, LocationsData, Porter, JobCategoryDefault, ShiftSchedule, DesignationDepartment } from '@/types'
import { saveSettings as apiSaveSettings, saveLocations as apiSaveLocations } from '@/utils/api'
import * as db from '@/services/database'

/**
 * Store for application settings and location data
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const supervisors = ref<string[]>([])
  const porters = ref<string[]>([])
  const jobCategories = ref<JobCategoriesMap>({})
  const buildings = ref<Building[]>([])
  const jobCategoryDefaults = ref<JobCategoryDefault[]>([])
  const designationDepartments = ref<DesignationDepartment[]>([
    { id: 'ae', name: 'A+E', color: '#d63031' },
    { id: 'ct', name: 'CT', color: '#0984e3' },
    { id: 'mri', name: 'MRI', color: '#00b894' },
    { id: 'amu', name: 'AMU', color: '#6c5ce7' },
    { id: 'pharmacy', name: 'Pharmacy', color: '#fdcb6e' },
    { id: 'meals', name: 'Meals', color: '#e17055' }
  ])
  const shifts = ref<ShiftSchedule>({
    day: { start: '08:00', end: '16:00' },
    night: { start: '20:00', end: '04:00' }
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * Initialize settings and location data from API/local storage
   */
  async function initialize() {
    isLoading.value = true
    error.value = null
    
    try {
      // Load settings
      await loadSettings()
      
      // Load location data
      await loadLocationData()
      
      return true
    } catch (err) {
      console.error('Error initializing settings:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load settings'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Load settings from API/JSON and localStorage
   */
  async function loadSettings() {
    try {
      // Try to load settings from Supabase
      try {
        const data = await db.getSettings()
        // Update state from database
        updateStateFromData(data)
        console.log('Settings loaded from database')
        return true
      } catch (dbErr) {
        console.warn('Error loading settings from database, falling back to localStorage:', dbErr)
        
        // Fall back to localStorage if database fails
        const localSettings = localStorage.getItem('porterTrackSettings')
        if (localSettings) {
          try {
            const data: SettingsData = JSON.parse(localSettings)
            // Update state from localStorage
            updateStateFromData(data)
            console.log('Settings loaded from localStorage')
            return true
          } catch (localErr) {
            console.warn('Error parsing localStorage settings, falling back to JSON file:', localErr)
          }
        }
        
        // Fallback to the JSON file
        const response = await fetch('/data/settings.json')
        
        if (!response.ok) {
          throw new Error(`Failed to load settings: ${response.status} ${response.statusText}`)
        }
        
        const data: SettingsData = await response.json()
        
        // Update state from JSON file
        updateStateFromData(data)
        
        return true
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load settings'
      throw err
    }
  }
  
  /**
   * Update state from settings data
   */
  function updateStateFromData(data: SettingsData) {
    if (data.supervisors) {
      supervisors.value = data.supervisors
    }
    
    if (data.porters) {
      porters.value = data.porters
    }
    
    if (data.jobCategories) {
      jobCategories.value = data.jobCategories
    }
    
    if (data.jobCategoryDefaults) {
      jobCategoryDefaults.value = data.jobCategoryDefaults
    }
    
    if (data.shifts) {
      shifts.value = data.shifts
    }
    
    if (data.designationDepartments) {
      designationDepartments.value = data.designationDepartments
    }
  }
  
  /**
   * Load location data from API/JSON
   */
  async function loadLocationData() {
    try {
      // Try to load locations from Supabase
      try {
        const data = await db.getLocations()
        // Update state from database
        buildings.value = data.buildings
        console.log('Location data loaded from database')
        return true
      } catch (dbErr) {
        console.warn('Error loading locations from database, falling back to localStorage:', dbErr)
        
        // Fall back to localStorage if database fails
        const locationsData = localStorage.getItem('porterTrackLocations')
        if (locationsData) {
          try {
            const data: LocationsData = JSON.parse(locationsData)
            // Update state from localStorage
            buildings.value = data.buildings
            console.log('Location data loaded from localStorage')
            return true
          } catch (localErr) {
            console.warn('Error parsing localStorage locations, falling back to JSON file:', localErr)
          }
        }
        
        // Fallback to the JSON file
        const response = await fetch('/data/locations.json')
        
        if (!response.ok) {
          throw new Error(`Failed to load location data: ${response.status} ${response.statusText}`)
        }
        
        const data: LocationsData = await response.json()
        
        // Update state
        buildings.value = data.buildings
        
        return true
      }
    } catch (err) {
      console.error('Error loading location data:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load location data'
      throw err
    }
  }
  
  /**
   * Save settings to file with localStorage fallback
   */
  async function saveSettingsToFile() {
    try {
      // Prepare the settings data
      const settingsData: SettingsData = {
        supervisors: supervisors.value,
        porters: porters.value,
        jobCategories: jobCategories.value,
        jobCategoryDefaults: jobCategoryDefaults.value,
        shifts: shifts.value,
        designationDepartments: designationDepartments.value
      };
      
      console.log('Saving settings:', settingsData);
      
      // First try to save to the API
      try {
        const result = await apiSaveSettings(settingsData);
        console.log('Settings saved via API:', result);
      } catch (apiErr) {
        console.warn('Could not save settings via API:', apiErr);
        
        // Fallback to localStorage if API save fails
        try {
          localStorage.setItem('porterTrackSettings', JSON.stringify(settingsData));
          console.log('Settings saved to localStorage as fallback');
        } catch (localErr) {
          console.warn('Could not save to localStorage:', localErr);
          console.info('Changes are in memory only and will be lost on refresh');
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      error.value = err instanceof Error ? err.message : 'Failed to save settings';
      return false;
    }
  }
  
  /**
   * Save location data to file with localStorage fallback
   */
  async function saveLocationDataToFile() {
    try {
      // Prepare the location data
      const locationData: LocationsData = {
        buildings: buildings.value
      };
      
      console.log('Saving location data:', locationData);
      
      // First try to save to the API
      try {
        const result = await apiSaveLocations(locationData);
        console.log('Location data saved via API:', result);
      } catch (apiErr) {
        console.warn('Could not save location data via API:', apiErr);
        
        // Fallback to localStorage if API save fails
        try {
          localStorage.setItem('porterTrackLocations', JSON.stringify(locationData));
          console.log('Location data saved to localStorage as fallback');
        } catch (localErr) {
          console.warn('Could not save location data to localStorage:', localErr);
          console.info('Changes are in memory only and will be lost on refresh');
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error saving location data:', err);
      error.value = err instanceof Error ? err.message : 'Failed to save location data';
      return false;
    }
  }
  
  /**
   * Update settings
   */
  function updateSettings(newSettings: Partial<SettingsData>) {
    if (newSettings.supervisors !== undefined) {
      supervisors.value = newSettings.supervisors
    }
    
    if (newSettings.porters !== undefined) {
      porters.value = newSettings.porters
    }
    
    if (newSettings.jobCategories !== undefined) {
      jobCategories.value = newSettings.jobCategories
    }
    
    if (newSettings.jobCategoryDefaults !== undefined) {
      jobCategoryDefaults.value = newSettings.jobCategoryDefaults
    }
    
    if (newSettings.shifts !== undefined) {
      shifts.value = newSettings.shifts
    }
    
    if (newSettings.designationDepartments !== undefined) {
      designationDepartments.value = newSettings.designationDepartments
    }
    
    // Save settings to file
    saveSettingsToFile();
    
    return true
  }
  
  /**
   * Supervisor management functions
   */
  function addSupervisor(name: string) {
    if (!name.trim() || supervisors.value.includes(name)) {
      return false
    }
    
    supervisors.value.push(name)
    updateSettings({ supervisors: supervisors.value })
    return true
  }
  
  function updateSupervisor(oldName: string, newName: string) {
    const index = supervisors.value.indexOf(oldName)
    if (index === -1 || !newName.trim() || (newName !== oldName && supervisors.value.includes(newName))) {
      return false
    }
    
    supervisors.value[index] = newName
    updateSettings({ supervisors: supervisors.value })
    return true
  }
  
  function deleteSupervisor(name: string) {
    const index = supervisors.value.indexOf(name)
    if (index === -1) {
      return false
    }
    
    supervisors.value.splice(index, 1)
    updateSettings({ supervisors: supervisors.value })
    return true
  }
  
  /**
   * Porter management functions
   */
  function addPorter(name: string) {
    if (!name.trim() || porters.value.includes(name)) {
      return false
    }
    
    porters.value.push(name)
    updateSettings({ porters: porters.value })
    return true
  }
  
  function updatePorter(oldName: string, newName: string) {
    const index = porters.value.indexOf(oldName)
    if (index === -1 || !newName.trim() || (newName !== oldName && porters.value.includes(newName))) {
      return false
    }
    
    porters.value[index] = newName
    updateSettings({ porters: porters.value })
    return true
  }
  
  function deletePorter(name: string) {
    const index = porters.value.indexOf(name)
    if (index === -1) {
      return false
    }
    
    porters.value.splice(index, 1)
    updateSettings({ porters: porters.value })
    return true
  }
  
  /**
   * Job category management functions
   */
  function addCategory(name: string) {
    if (!name.trim() || name in jobCategories.value) {
      return false
    }
    
    jobCategories.value[name] = []
    updateSettings({ jobCategories: jobCategories.value })
    return true
  }
  
  function updateCategory(oldName: string, newName: string) {
    if (!newName.trim() || newName in jobCategories.value || !(oldName in jobCategories.value)) {
      return false
    }
    
    // Keep the items from the old category
    const items = [...jobCategories.value[oldName]]
    
    // Delete old category and create new one with the same items
    delete jobCategories.value[oldName]
    jobCategories.value[newName] = items
    
    updateSettings({ jobCategories: jobCategories.value })
    return true
  }
  
  function deleteCategory(name: string) {
    if (!(name in jobCategories.value)) {
      return false
    }
    
    delete jobCategories.value[name]
    updateSettings({ jobCategories: jobCategories.value })
    return true
  }
  
  function addItemType(category: string, itemName: string) {
    if (!itemName.trim() || !(category in jobCategories.value) || 
        jobCategories.value[category].includes(itemName)) {
      return false
    }
    
    jobCategories.value[category].push(itemName)
    updateSettings({ jobCategories: jobCategories.value })
    return true
  }
  
  function updateItemType(category: string, oldItemName: string, newItemName: string) {
    if (!newItemName.trim() || !(category in jobCategories.value)) {
      return false
    }
    
    const index = jobCategories.value[category].indexOf(oldItemName)
    if (index === -1 || 
        (newItemName !== oldItemName && jobCategories.value[category].includes(newItemName))) {
      return false
    }
    
    jobCategories.value[category][index] = newItemName
    updateSettings({ jobCategories: jobCategories.value })
    return true
  }
  
  function deleteItemType(category: string, itemName: string) {
    if (!(category in jobCategories.value)) {
      return false
    }
    
    const index = jobCategories.value[category].indexOf(itemName)
    if (index === -1) {
      return false
    }
    
    jobCategories.value[category].splice(index, 1)
    updateSettings({ jobCategories: jobCategories.value })
    return true
  }
  
  /**
   * Get building name by ID
   */
  function getBuildingName(buildingId: string): string | undefined {
    const building = buildings.value.find(b => b.id === buildingId)
    return building?.name
  }
  
  /**
   * Get location name by building ID, location ID and type
   */
  function getLocationName(
    buildingId: string, 
    locationId: string, 
    locationType: 'department' | 'ward'
  ): string | undefined {
    const building = buildings.value.find(b => b.id === buildingId)
    
    if (!building) return undefined
    
    // All locations are now in departments array
    const location = building.departments.find(l => l.id === locationId)
    
    return location?.name
  }
  
  /**
   * Building management functions
   */
  function addBuilding(name: string) {
    if (!name.trim() || buildings.value.some(b => b.name === name)) {
      return false
    }
    
    const newId = name.toLowerCase().replace(/\s+/g, '-')
    
    // Check if ID already exists
    if (buildings.value.some(b => b.id === newId)) {
      return false
    }
    
    const newBuilding: Building = {
      id: newId,
      name,
      departments: []
    }
    
    buildings.value.push(newBuilding)
    
    // Save to file
    console.log('Building added:', newBuilding)
    saveLocationDataToFile()
    
    return true
  }
  
  function updateBuilding(buildingId: string, newName: string) {
    if (!newName.trim()) {
      return false
    }
    
    const building = buildings.value.find(b => b.id === buildingId)
    if (!building) {
      return false
    }
    
    // Check if new name already exists for another building
    if (buildings.value.some(b => b.name === newName && b.id !== buildingId)) {
      return false
    }
    
    building.name = newName
    
    // Save to file
    console.log('Building updated:', building)
    saveLocationDataToFile()
    
    return true
  }
  
  function deleteBuilding(buildingId: string) {
    const index = buildings.value.findIndex(b => b.id === buildingId)
    if (index === -1) {
      return false
    }
    
    buildings.value.splice(index, 1)
    
    // Save to file
    console.log('Building deleted:', buildingId)
    saveLocationDataToFile()
    
    return true
  }
  
  /**
   * Department management functions
   */
  function addDepartment(buildingId: string, name: string) {
    if (!name.trim()) {
      return false
    }
    
    const building = buildings.value.find(b => b.id === buildingId)
    if (!building) {
      return false
    }
    
    // Check if department with this name already exists in the building
    if (building.departments.some(d => d.name === name)) {
      return false
    }
    
    const newId = name.toLowerCase().replace(/\s+/g, '-')
    
    // Check if ID already exists in this building
    if (building.departments.some(d => d.id === newId)) {
      return false
    }
    
    building.departments.push({
      id: newId,
      name
    })
    
    // Save to file
    console.log('Department added:', { buildingId, department: { id: newId, name } })
    saveLocationDataToFile()
    
    return true
  }
  
  function updateDepartment(buildingId: string, departmentId: string, newName: string) {
    if (!newName.trim()) {
      return false
    }
    
    const building = buildings.value.find(b => b.id === buildingId)
    if (!building) {
      return false
    }
    
    const department = building.departments.find(d => d.id === departmentId)
    if (!department) {
      return false
    }
    
    // Check if new name already exists for another department in this building
    if (building.departments.some(d => d.name === newName && d.id !== departmentId)) {
      return false
    }
    
    department.name = newName
    
    // Save to file
    console.log('Department updated:', { buildingId, department })
    saveLocationDataToFile()
    
    return true
  }
  
  function deleteDepartment(buildingId: string, departmentId: string) {
    const building = buildings.value.find(b => b.id === buildingId)
    if (!building) {
      return false
    }
    
    const index = building.departments.findIndex(d => d.id === departmentId)
    if (index === -1) {
      return false
    }
    
    building.departments.splice(index, 1)
    
    // Save to file
    console.log('Department deleted:', { buildingId, departmentId })
    saveLocationDataToFile()
    
    return true
  }
  
  /**
   * Ward management functions - now just proxying to department functions
   * since we don't distinguish between wards and departments anymore
   */
  function addWard(buildingId: string, name: string) {
    return addDepartment(buildingId, name)
  }
  
  function updateWard(buildingId: string, wardId: string, newName: string) {
    return updateDepartment(buildingId, wardId, newName)
  }
  
  function deleteWard(buildingId: string, wardId: string) {
    return deleteDepartment(buildingId, wardId)
  }
  
  /**
   * Job category default location management
   */
  function getJobCategoryDefault(category: string, itemType?: string): JobCategoryDefault | undefined {
    // If item type is provided, look for a match with both category and item type
    if (itemType) {
      const specificDefault = jobCategoryDefaults.value.find(
        def => def.category === category && def.itemType === itemType
      );
      if (specificDefault) return specificDefault;
    }
    
    // Otherwise (or if no specific default found), look for a category-level default
    return jobCategoryDefaults.value.find(
      def => def.category === category && !def.itemType
    );
  }
  
  function setJobCategoryDefault(defaultData: JobCategoryDefault) {
    // Check if we need to update item-specific defaults or category defaults
    let index = -1;
    
    if (defaultData.itemType) {
      // Look for existing defaults for this category + item type combination
      index = jobCategoryDefaults.value.findIndex(
        def => def.category === defaultData.category && def.itemType === defaultData.itemType
      );
    } else {
      // Look for existing category-level defaults (without item type)
      index = jobCategoryDefaults.value.findIndex(
        def => def.category === defaultData.category && !def.itemType
      );
    }
    
    if (index !== -1) {
      // Update existing defaults
      jobCategoryDefaults.value[index] = defaultData;
    } else {
      // Add new defaults
      jobCategoryDefaults.value.push(defaultData);
    }
    
    // Save the updated defaults to file
    saveSettingsToFile();
    
    return true;
  }
  
  function deleteJobCategoryDefault(category: string, itemType?: string) {
    let index = -1;
    
    if (itemType) {
      // Delete specific item type defaults
      index = jobCategoryDefaults.value.findIndex(
        def => def.category === category && def.itemType === itemType
      );
    } else {
      // Delete category-wide defaults
      index = jobCategoryDefaults.value.findIndex(
        def => def.category === category && !def.itemType
      );
    }
    
    if (index === -1) {
      return false;
    }
    
    jobCategoryDefaults.value.splice(index, 1);
    
    // Save the updated defaults to file
    saveSettingsToFile();
    
    return true;
  }
  
  /**
   * Designation Department management
   */
  function addDesignationDepartment(name: string, color?: string) {
    if (!name.trim() || designationDepartments.value.some(d => d.name === name)) {
      return false
    }
    
    const newId = name.toLowerCase().replace(/\s+/g, '-')
    
    // Check if ID already exists
    if (designationDepartments.value.some(d => d.id === newId)) {
      return false
    }
    
    designationDepartments.value.push({
      id: newId,
      name,
      color: color || '#' + Math.floor(Math.random()*16777215).toString(16) // Random color if not provided
    })
    
    // Save settings to file
    saveSettingsToFile()
    
    return true
  }
  
  function updateDesignationDepartment(departmentId: string, newName: string, newColor?: string) {
    const department = designationDepartments.value.find(d => d.id === departmentId)
    if (!department || !newName.trim()) {
      return false
    }
    
    // Check if new name already exists for another department
    if (designationDepartments.value.some(d => d.name === newName && d.id !== departmentId)) {
      return false
    }
    
    department.name = newName
    if (newColor) {
      department.color = newColor
    }
    
    // Save settings to file
    saveSettingsToFile()
    
    return true
  }
  
  function deleteDesignationDepartment(departmentId: string) {
    const index = designationDepartments.value.findIndex(d => d.id === departmentId)
    if (index === -1) {
      return false
    }
    
    designationDepartments.value.splice(index, 1)
    
    // Save settings to file
    saveSettingsToFile()
    
    return true
  }
  
  function getDesignationDepartment(departmentId: string): DesignationDepartment | undefined {
    return designationDepartments.value.find(d => d.id === departmentId)
  }
  
  /**
   * Helper function to get all departments (combining departments and wards arrays)
   * Added for compatibility with legacy code
   */
  function getAllDepartments(building: Building) {
    return building.departments
  }
  
  return {
    // State
    supervisors,
    porters,
    jobCategories,
    buildings,
    jobCategoryDefaults,
    designationDepartments,
    shifts,
    isLoading,
    error,
    
    // Actions
    initialize,
    loadSettings,
    loadLocationData,
    updateSettings,
    saveSettingsToFile,
    saveLocationDataToFile,
    
    // Supervisor management
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,
    
    // Porter management
    addPorter,
    updatePorter,
    deletePorter,
    
    // Job category management
    addCategory,
    updateCategory,
    deleteCategory,
    addItemType,
    updateItemType,
    deleteItemType,
    
    // Building management
    addBuilding,
    updateBuilding,
    deleteBuilding,
    
    // Department management
    addDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Ward management
    addWard,
    updateWard,
    deleteWard,
    
    // Job category defaults management
    getJobCategoryDefault,
    setJobCategoryDefault,
    deleteJobCategoryDefault,
    
    // Designation department management
    addDesignationDepartment,
    updateDesignationDepartment,
    deleteDesignationDepartment,
    getDesignationDepartment,
    
    // Helper methods
    getAllDepartments,
    
    // Getters
    getBuildingName,
    getLocationName
  }
})
