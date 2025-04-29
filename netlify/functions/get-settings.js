const { getKVStore } = require('@netlify/functions');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) 
    };
  }

  try {
    // Get KV store instance
    const store = getKVStore({ namespace: "appSettings" });
    
    // Retrieve the settings from the KV store
    const settingsJson = await store.get("settings");
    
    if (!settingsJson) {
      // If no settings found, return empty settings
      return {
        statusCode: 200,
        body: JSON.stringify({
          supervisors: [],
          porters: [],
          jobCategories: {},
          jobCategoryDefaults: [],
          shifts: {
            day: { start: '08:00', end: '16:00' },
            night: { start: '20:00', end: '04:00' }
          }
        })
      };
    }
    
    console.log('Retrieved settings from KV store');
    
    return {
      statusCode: 200,
      body: settingsJson
    };
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message 
      })
    };
  }
};
