# Netlify Functions for Porter Task App

This directory contains serverless functions that replace the Express server functionality in the production Netlify deployment.

## Data Persistence

These functions now use the Netlify Key-Value Store to persist data across deployments. See the `NETLIFY_PERSISTENCE.md` file in the project root for detailed information about the data persistence solution.

## Functions Overview

### `save-settings.js`

This function handles saving application settings data to the Netlify KV store.

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

### `get-settings.js`

This function retrieves application settings data from the Netlify KV store.

- **HTTP Method**: GET
- **Path**: `/.netlify/functions/get-settings`
- **Response**: JSON object containing the application settings

```javascript
// Example usage
fetch('/.netlify/functions/get-settings')
.then(response => response.json())
.then(settings => console.log('Retrieved settings:', settings));
```

### `save-locations.js`

This function handles saving building and location data to the Netlify KV store.

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

### `get-locations.js`

This function retrieves location data from the Netlify KV store.

- **HTTP Method**: GET
- **Path**: `/.netlify/functions/get-locations`
- **Response**: JSON object containing buildings, departments, and wards

```javascript
// Example usage
fetch('/.netlify/functions/get-locations')
.then(response => response.json())
.then(locations => console.log('Retrieved locations:', locations));
```

## Data Persistence

These functions use Netlify's built-in Key-Value store to persist data across deployments. The Key-Value store is:

- Automatically available on all Netlify sites
- Requires the `@netlify/functions` package (already installed)
- Provides a simple, reliable way to store application data without an external database

The application is designed with a fallback mechanism:
1. First, it tries to read/write data using the Netlify functions and KV store
2. If that fails, it falls back to browser `localStorage`
3. As a last resort, it can load data from static JSON files

This ensures data is not lost even if the KV store or serverless functions are temporarily unavailable.

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
