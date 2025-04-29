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
    
    // In a real serverless environment, we would use a database or storage service
    // For demo purposes, we'll just return success
    console.log('Locations data received:', locationsData);
    
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
