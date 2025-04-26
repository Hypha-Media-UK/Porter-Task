# Porter Track Settings Update Fix

This update addresses the issue where changes made in the Settings page were not being saved to the data files in the `/public/data` directory.

## Problem

Previously, when making changes to buildings, locations, and other settings, the data was only updated in memory but not persisted to the JSON files. This meant that changes would be lost when the application was reloaded.

## Solution

The following changes have been implemented:

1. Added a `saveLocationDataToFile` function to the settings store that saves changes to `locations.json`
2. Updated all building, department, and ward management functions to call this function when changes are made
3. Created API endpoints in a simple Express server to handle saving data to the JSON files
4. Modified the Vite configuration to proxy API requests to the Express server

## How to Run the Application

You'll need to run both the Vite development server for the frontend and the Express server for handling data persistence.

### Step 1: Install the new dependencies

```
npm install
```

### Step 2: Start the Express server

```
npm run server
```

This will start the Express server on port 3000, which will handle saving data to the JSON files.

### Step 3: Start the Vite development server

In a separate terminal, run:

```
npm run dev
```

This will start the Vite development server on port 5173, which will serve the frontend application and proxy API requests to the Express server.

### Step 4: Access the application

Open your browser and navigate to:

```
http://localhost:5173
```

## Technical Details

- The Express server provides two API endpoints:
  - `POST /api/save-settings`: Saves settings data to `/public/data/settings.json`
  - `POST /api/save-locations`: Saves location data to `/public/data/locations.json`

- The settings store has been updated to use these endpoints when changes are made to settings, buildings, departments, or wards

- When changes are made in the UI, the relevant data will now be persisted to the appropriate JSON files

## Future Improvements

- Implement proper error handling and recovery mechanisms
- Add validation to ensure data integrity
- Implement proper authentication and authorization for the API endpoints
- Consider using a database instead of JSON files for data persistence
