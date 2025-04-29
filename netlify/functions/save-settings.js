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
    const settingsData = JSON.parse(event.body);
    
    // Get KV store instance
    const store = getKVStore({ namespace: "appSettings" });
    
    // Store the settings in the KV store
    await store.set("settings", JSON.stringify(settingsData));
    
    console.log('Settings data saved to KV store:', settingsData);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Settings saved successfully' 
      })
    };
  } catch (error) {
    console.error('Error saving settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message 
      })
    };
  }
};
