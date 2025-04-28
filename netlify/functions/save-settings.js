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
    
    // In a real serverless environment, we would use a database or storage service
    // For demo purposes, we'll just return success
    console.log('Settings data received:', settingsData);
    
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
