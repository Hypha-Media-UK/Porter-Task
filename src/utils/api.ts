/**
 * Utility functions for API calls to Netlify functions
 */

// API base URL that works both in development and production
export const API_BASE_URL = '/.netlify/functions';

/**
 * Save settings to the backend
 * @param settingsData The settings data to save
 * @returns Promise with the API response
 */
export async function saveSettings(settingsData: any): Promise<any> {
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
