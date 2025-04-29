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
    
    // Retrieve the locations from the KV store
    const locationsJson = await store.get("locations");
    
    if (!locationsJson) {
      // If no locations found, return empty locations
      return {
        statusCode: 200,
        body: JSON.stringify({
          buildings: []
        })
      };
    }
    
    console.log('Retrieved locations from KV store');
    
    return {
      statusCode: 200,
      body: locationsJson
    };
  } catch (error) {
    console.error('Error retrieving locations:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message 
      })
    };
  }
};
