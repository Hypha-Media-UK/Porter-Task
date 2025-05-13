import type { Location } from '@/types';

// Combined location type including building info
export interface CombinedLocation {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  locationType: 'department' | 'ward';
  frequent?: boolean;
  order?: number;
}

// Enhanced matching for locations with various fallbacks
export function findExactMatch(locations: CombinedLocation[], id: string): CombinedLocation | undefined {
  return locations.find(l => l.id === id);
}

export function findFuzzyMatch(locations: CombinedLocation[], name: string): CombinedLocation | undefined {
  if (!name) return undefined;
  
  // Exact match
  const exactMatch = locations.find(l => l.name === name);
  if (exactMatch) return exactMatch;
  
  // Case-insensitive match
  const insensitiveMatch = locations.find(l => 
    l.name.toLowerCase() === name.toLowerCase()
  );
  if (insensitiveMatch) return insensitiveMatch;
  
  // Partial match (location name contains the search term or vice versa)
  const partialMatch = locations.find(l => 
    l.name.toLowerCase().includes(name.toLowerCase()) || 
    name.toLowerCase().includes(l.name.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  return undefined;
}

// Enhanced location finder with multiple fallback strategies
export function findLocationById(buildings: any[], allLocations: CombinedLocation[], buildingId: string, locationId: string, locationType: 'department' | 'ward', displayName?: string): CombinedLocation | undefined {
  console.log(`Finding location - buildingId: ${buildingId}, locationId: ${locationId}, type: ${locationType}, displayName: ${displayName}`);
  
  // STRATEGY 1: Find exact match by ID in correct building
  if (buildingId && locationId) {
    const building = buildings.find(b => b.id === buildingId);
    if (building) {
      const location = building.departments.find((l: any) => l.id === locationId);
      if (location) {
        console.log(`Found location ${location.name} in building ${building.name} by exact ID match`);
        return {
          id: location.id,
          name: location.name,
          buildingId: building.id,
          buildingName: building.name,
          locationType: 'department', // We now use 'department' for all location types
          frequent: location.frequent,
          order: location.order
        };
      }
    }
  }
  
  // STRATEGY 2: Find by ID in any building
  if (locationId) {
    for (const building of buildings) {
      const location = building.departments.find((l: any) => l.id === locationId);
      if (location) {
        console.log(`Found location ${location.name} in building ${building.name} by ID (different building)`);
        return {
          id: location.id,
          name: location.name,
          buildingId: building.id,
          buildingName: building.name,
          locationType: 'department',
          frequent: location.frequent,
          order: location.order
        };
      }
    }
  }
  
  // STRATEGY 3: Find by display name (exact or fuzzy match)
  if (displayName) {
    console.log(`Attempting to find location by display name: ${displayName}`);
    
    // First check for exact match in the dropdown options
    const exactMatch = findExactMatch(allLocations, displayName);
    if (exactMatch) {
      console.log(`Found exact match by ID in dropdown options:`, exactMatch);
      return exactMatch;
    }
    
    // Try fuzzy name matching
    const fuzzyMatch = findFuzzyMatch(allLocations, displayName);
    if (fuzzyMatch) {
      console.log(`Found fuzzy match by name in dropdown options:`, fuzzyMatch);
      return fuzzyMatch;
    }
    
    // If still no match, look through all buildings directly
    for (const building of buildings) {
      for (const dept of building.departments) {
        // Try exact match
        if (dept.name === displayName) {
          console.log(`Found department ${dept.name} in building ${building.name} by exact name match`);
          return {
            id: dept.id,
            name: dept.name,
            buildingId: building.id,
            buildingName: building.name,
            locationType: 'department',
            frequent: dept.frequent,
            order: dept.order
          };
        }
        
        // Try case-insensitive match
        if (dept.name.toLowerCase() === displayName.toLowerCase()) {
          console.log(`Found department ${dept.name} in building ${building.name} by case-insensitive name match`);
          return {
            id: dept.id,
            name: dept.name,
            buildingId: building.id,
            buildingName: building.name,
            locationType: 'department',
            frequent: dept.frequent,
            order: dept.order
          };
        }
      }
    }
  }
  
  console.warn(`Could not find location match for buildingId: ${buildingId}, locationId: ${locationId}, displayName: ${displayName}`);
  return undefined;
}

// Function to directly manipulate select elements as a last resort
export function setSelectValueByName(selectRef: any, displayName: string): boolean {
  if (!selectRef.value || !displayName) return false;
  
  const select = selectRef.value;
  const options = Array.from(select.options) as HTMLOptionElement[];
  
  // Loop through all options
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const optionText = option.text.replace(' ★', ''); // Remove favorite star if present
    
    // Try exact match
    if (optionText === displayName) {
      select.selectedIndex = i;
      console.log(`Set select to index ${i} with value ${optionText} by exact match`);
      return true;
    }
    
    // Try case-insensitive match
    if (optionText.toLowerCase() === displayName.toLowerCase()) {
      select.selectedIndex = i;
      console.log(`Set select to index ${i} with value ${optionText} by case-insensitive match`);
      return true;
    }
    
    // Try partial match
    if (optionText.toLowerCase().includes(displayName.toLowerCase()) || 
        displayName.toLowerCase().includes(optionText.toLowerCase())) {
      select.selectedIndex = i;
      console.log(`Set select to index ${i} with value ${optionText} by partial match`);
      return true;
    }
  }
  
  return false;
}

// Utility function to process from and to locations when loading a task
export function processTaskLocations(
  task: any, 
  buildings: any[], 
  allLocations: CombinedLocation[], 
  fromLocationSelect: any, 
  toLocationSelect: any,
  setSelectedFromLocation: (loc: CombinedLocation | null) => void,
  setSelectedToLocation: (loc: CombinedLocation | null) => void
) {
  // STRATEGY 1: Try to find locations by ID first
  const fromLoc = findLocationById(
    buildings,
    allLocations,
    task.fromLocation.building, 
    task.fromLocation.locationId, 
    task.fromLocation.locationType,
    task.fromLocation.displayName
  );
  
  if (fromLoc) {
    console.log('Found fromLocation match by enhanced lookup:', fromLoc);
    setSelectedFromLocation(fromLoc);
  } else {
    console.warn('Could not find fromLocation match by enhanced lookup');
    
    // STRATEGY 2: Try direct DOM manipulation as fallback
    if (fromLocationSelect.value && task.fromLocation.displayName) {
      const success = setSelectValueByName(fromLocationSelect, task.fromLocation.displayName);
      console.log('Direct DOM manipulation for fromLocation:', success ? 'SUCCESS' : 'FAILED');
      
      // If DOM manipulation worked, update the model
      if (success && fromLocationSelect.value.selectedIndex > 0) {
        const optionIndex = fromLocationSelect.value.selectedIndex;
        
        // Try to find the corresponding model value
        const locationModelValue = allLocations[optionIndex - 1]; // -1 to account for the placeholder
        
        if (locationModelValue) {
          console.log('Setting selectedFromLocation from DOM selection:', locationModelValue);
          setSelectedFromLocation(locationModelValue);
        }
      }
    }
  }
  
  // Process the to-location
  const toLoc = findLocationById(
    buildings,
    allLocations,
    task.toLocation.building, 
    task.toLocation.locationId, 
    task.toLocation.locationType,
    task.toLocation.displayName
  );
  
  if (toLoc) {
    console.log('Found toLocation match by enhanced lookup:', toLoc);
    setSelectedToLocation(toLoc);
  } else {
    console.warn('Could not find toLocation match by enhanced lookup');
    
    // STRATEGY 2: Try direct DOM manipulation as fallback
    if (toLocationSelect.value && task.toLocation.displayName) {
      const success = setSelectValueByName(toLocationSelect, task.toLocation.displayName);
      console.log('Direct DOM manipulation for toLocation:', success ? 'SUCCESS' : 'FAILED');
      
      // If DOM manipulation worked, update the model
      if (success && toLocationSelect.value.selectedIndex > 0) {
        const optionIndex = toLocationSelect.value.selectedIndex;
        
        // Try to find the corresponding model value
        const locationModelValue = allLocations[optionIndex - 1]; // -1 to account for the placeholder
        
        if (locationModelValue) {
          console.log('Setting selectedToLocation from DOM selection:', locationModelValue);
          setSelectedToLocation(locationModelValue);
        }
      }
    }
  }
}
