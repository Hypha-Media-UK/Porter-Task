const { getKVStore } = require('@netlify/functions');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) 
    };
  }

  try {
    // Parse the JSON body
    const locationsData = JSON.parse(event.body);
    
    // Get KV store instance
    const store = getKVStore({ namespace: "appSettings" });
    
    // Store the locations in the KV store
    await store.set("locations", JSON.stringify(locationsData));
    
    console.log('Locations data saved to KV store:', locationsData);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Locations saved successfully' 
      })
    };
  } catch (error) {
    console.error('Error saving locations:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message 
      })
    };
  }
};
