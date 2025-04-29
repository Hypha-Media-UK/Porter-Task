# Porter Task App - Netlify Data Persistence Solution

## The Problem

You noticed that when settings are changed in the local development environment and then deployed to Netlify, the changes don't persist in the Netlify environment. This is because the original implementation of the Netlify functions simply acknowledged receiving data but didn't actually store it anywhere.

## The Solution

We've implemented a comprehensive data persistence solution using Netlify's built-in Key-Value store:

1. **Netlify Key-Value Store**: We're using Netlify's KV store to persistently save settings and locations data.

2. **Bidirectional Data Flow**:
   - Settings are loaded from the Netlify KV store on application startup
   - Changes are saved back to the KV store when updates occur
   - Local storage is used as a fallback when offline

3. **Graceful Degradation**: 
   - The app tries the Netlify functions first
   - Falls back to localStorage if the API calls fail
   - As a last resort, loads from the static JSON files

## Implementation Details

### Netlify Functions

- **save-settings.js** and **save-locations.js**: Now store data in the KV store
- **get-settings.js** and **get-locations.js**: New functions to retrieve data from the KV store

### API Utilities

- Added `getSettings()` and `getLocations()` functions to fetch data from Netlify functions
- Enhanced error handling for better fallback behavior

### Settings Store Updates

- Modified `loadSettings()` and `loadLocationData()` to first try the Netlify functions before falling back

## Required Dependency

The solution requires the `@netlify/functions` package, which provides access to the Netlify KV store:

```bash
npm install @netlify/functions
```

## Usage Notes

1. When deploying to Netlify, ensure the site has KV store enabled (available on all Netlify plans)
2. Local development still works via localStorage
3. Production deployments benefit from persistent storage across all users

This approach ensures that settings changes persist between deployments and are shared across all instances of the application.
