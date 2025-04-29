# Development Mode vs. Production Mode

## Overview

The Porter Task application now intelligently handles both development and production environments. This ensures seamless local development without requiring actual Netlify functions, while still leveraging the Netlify Key-Value store in production.

## Environment Detection

The application automatically detects whether it's running in development or production mode:

```typescript
// Detect if we're in development mode
const isDevelopment = import.meta.env.DEV;
```

## API Handling

### In Development Mode

When running locally:

1. **API Mock Responses**: The application mocks all Netlify function responses
2. **LocalStorage Persistence**: Data is stored in the browser's localStorage
3. **Fallback to Static Files**: If no localStorage data exists, the app loads from static JSON files
4. **Console Logging**: Helpful logs indicate when mock APIs are being used

### In Production Mode

When deployed to Netlify:

1. **Netlify Functions**: The application uses the actual Netlify serverless functions
2. **KV Store Persistence**: Data is stored in Netlify's Key-Value store for persistence across deployments
3. **Graceful Degradation**: Fallbacks to localStorage and static files remain available if needed

## Impact on Development

This dual-mode approach means:

1. **No Local Function Setup Required**: You can develop locally without setting up Netlify CLI
2. **No Connection Errors**: Development mode doesn't attempt to connect to non-existent functions
3. **Consistent Behavior**: The application behaves similarly in both environments
4. **Data Persistence**: Settings changes persist in both environments (localStorage for development, KV store for production)

## For Deployment

When deploying the application to Netlify:

1. Make sure your Netlify site has the KV store enabled (available on all Netlify plans)
2. Ensure the `@netlify/functions` package is installed (added as a dependency)
3. The application will automatically use the proper environment-specific code

This approach ensures a smooth development experience while enabling robust production deployments with persistent data storage.
