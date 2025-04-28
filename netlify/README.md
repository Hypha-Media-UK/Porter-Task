# Netlify Functions for Porter Task App

This directory contains serverless functions that replace the Express server functionality in the production Netlify deployment.

## Functions Overview

### `save-settings.js`

This function handles saving application settings data.

- **HTTP Method**: POST
- **Path**: `/.netlify/functions/save-settings`
- **Request Body**: JSON object containing the application settings
- **Response**: JSON confirmation of successful operation

```javascript
// Example usage
fetch('/.netlify/functions/save-settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(settingsData)
})
.then(response => response.json())
.then(result => console.log('Settings saved:', result));
```

### `save-locations.js`

This function handles saving building and location data.

- **HTTP Method**: POST
- **Path**: `/.netlify/functions/save-locations`
- **Request Body**: JSON object containing buildings, departments, and wards
- **Response**: JSON confirmation of successful operation

```javascript
// Example usage
fetch('/.netlify/functions/save-locations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(locationsData)
})
.then(response => response.json())
.then(result => console.log('Locations saved:', result));
```

## Data Persistence

In the production environment, these functions would typically connect to a database service such as Fauna DB, Firebase, or other Netlify-compatible persistence solutions. For the current implementation, they simply acknowledge receipt of the data.

The application is designed to fall back to `localStorage` if the API calls fail, ensuring that changes aren't lost even if the serverless functions are unavailable.

## Local Development

For local development, you can use the Netlify CLI to test these functions:

```bash
netlify dev
```

This will start a local development server that emulates the Netlify production environment, including functions.

## Adding New Functions

To add a new function:

1. Create a new JavaScript file in this directory
2. Implement the function using the AWS Lambda handler format:

```javascript
exports.handler = async (event, context) => {
  // Your function logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      success: true,
      message: 'Function executed successfully'
    })
  };
};
```

3. Update the API utility in `src/utils/api.ts` to call your new function
4. Deploy to Netlify to make the function available in production
