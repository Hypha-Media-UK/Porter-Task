/**
 * Utility functions for API calls to Netlify functions
 */

// Detect if we're in development mode
const isDevelopment = import.meta.env.DEV;

// API base URL that works both in development and production
export const API_BASE_URL = '/.netlify/functions';

// Log development mode status
console.log(`API running in ${isDevelopment ? 'development' : 'production'} mode`);

/**
 * Save settings to the backend
 * @param settingsData The settings data to save
 * @returns Promise with the API response
 */
export async function saveSettings(settingsData: any): Promise<any> {
  // In development mode, just mock the response and save to localStorage
  if (isDevelopment) {
    console.log('Dev mode: Mocking save-settings API call');
    localStorage.setItem('porterTrackSettings', JSON.stringify(settingsData));
    return Promise.resolve({ 
      success: true, 
      message: 'Settings saved successfully (dev mode)' 
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/save-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Save locations to the backend
 * @param locationsData The locations data to save
 * @returns Promise with the API response
 */
export async function saveLocations(locationsData: any): Promise<any> {
  // In development mode, just mock the response and save to localStorage
  if (isDevelopment) {
    console.log('Dev mode: Mocking save-locations API call');
    localStorage.setItem('porterTrackLocations', JSON.stringify(locationsData));
    return Promise.resolve({ 
      success: true, 
      message: 'Locations saved successfully (dev mode)' 
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/save-locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationsData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving locations:', error);
    throw error;
  }
}

/**
 * Get settings from the backend
 * @returns Promise with the settings data
 */
export async function getSettings(): Promise<any> {
  // In development mode, just mock the response from localStorage or default data
  if (isDevelopment) {
    console.log('Dev mode: Mocking get-settings API call');
    const localSettings = localStorage.getItem('porterTrackSettings');
    
    if (localSettings) {
      return Promise.resolve(JSON.parse(localSettings));
    }
    
    // If not in localStorage, try to load from the static JSON file
    try {
      const response = await fetch('/data/settings.json');
      if (response.ok) {
        const data = await response.json();
        return Promise.resolve(data);
      }
    } catch (e) {
      console.warn('Could not load settings from static file:', e);
    }
    
    // Default empty settings if nothing else is available
    return Promise.resolve({
      supervisors: [],
      porters: [],
      jobCategories: {},
      jobCategoryDefaults: [],
      shifts: {
        day: { start: '08:00', end: '16:00' },
        night: { start: '20:00', end: '04:00' }
      }
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/get-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
}

/**
 * Get locations from the backend
 * @returns Promise with the locations data
 */
export async function getLocations(): Promise<any> {
  // In development mode, just mock the response from localStorage or default data
  if (isDevelopment) {
    console.log('Dev mode: Mocking get-locations API call');
    const localLocations = localStorage.getItem('porterTrackLocations');
    
    if (localLocations) {
      return Promise.resolve(JSON.parse(localLocations));
    }
    
    // If not in localStorage, try to load from the static JSON file
    try {
      const response = await fetch('/data/locations.json');
      if (response.ok) {
        const data = await response.json();
        return Promise.resolve(data);
      }
    } catch (e) {
      console.warn('Could not load locations from static file:', e);
    }
    
    // Default empty locations if nothing else is available
    return Promise.resolve({
      buildings: []
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/get-locations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting locations:', error);
    throw error;
  }
}
