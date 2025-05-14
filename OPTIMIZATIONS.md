# Hospital Porter Task Management App - Optimizations

This document describes the optimizations applied to improve the Hospital Porter Task Management App.

## Added Features

### 1. Enhanced Data Service (`src/utils/dataService.ts`)

A centralized data service has been added to provide:

- **Caching**: Reduces redundant API calls by storing responses with a 5-minute TTL (Time To Live)
- **Retry Logic**: Automatically retries failed API calls with exponential backoff
- **Consistent API**: Provides consistent methods for fetching, inserting, updating, and deleting data
- **Error Handling**: Standardized error handling across all data operations

### 2. Offline Support (`src/utils/syncQueue.ts`)

A robust offline-first architecture has been implemented:

- **Operation Queue**: All database operations are queued when offline and processed when online
- **Automatic Synchronization**: Queued operations are automatically processed when the app regains connectivity
- **Persistence**: Queue is stored in localStorage to survive page refreshes
- **Status Tracking**: Operations track their status (pending, processing, completed, failed)
- **Retry Mechanism**: Failed operations can be retried with a reset retry counter

### 3. Network Status UI (`src/components/NetworkStatus.vue`)

A network status indicator has been added to the header:

- **Online/Offline Status**: Shows the current network connection status
- **Pending Operations**: Shows a count of pending operations waiting to sync
- **Manual Sync**: Allows users to manually trigger synchronization

### 4. Optimized Task Service (`src/services/optimizedTaskService.ts`)

An improved task service that:

- **Reduces API Calls**: Uses caching to minimize redundant requests
- **Better Error Recovery**: Gracefully handles errors with retries and fallbacks
- **Enhanced Offline Support**: Works seamlessly offline with proper data synchronization
- **Type Safety**: Improved TypeScript types for better reliability

## Integration

These optimizations have been integrated with:

1. App initialization in `App.vue` to:
   - Clear cache when the app comes back online
   - Refresh data automatically after reconnection

2. Header component in `Header.vue` to:
   - Display network status in the header
   - Provide visual feedback on the connection status

## Future Optimization Opportunities

1. **IndexedDB Integration**:
   - Replace localStorage with IndexedDB for more robust offline storage
   - Enable storing larger datasets offline

2. **Real-time Updates**:
   - Implement Supabase real-time subscriptions to get live updates

3. **Performance Monitoring**:
   - Add performance monitoring to track API call durations
   - Identify and optimize slow operations

4. **Advanced Caching Strategies**:
   - Implement more sophisticated caching strategies like stale-while-revalidate
   - Add cache warming for critical data

5. **UI Optimizations**:
   - Add skeleton loaders for better perceived performance
   - Implement lazy loading for non-critical components

## Usage

### Data Service

```typescript
import { fetchFromTable, withRetry, isOnline } from '@/utils/dataService';

// Fetch data with caching
const tasks = await fetchFromTable('tasks', {
  match: { shift_id: shiftId },
  cacheKey: `tasks:shift:${shiftId}`
});

// Add retry logic to any async function
const myFunctionWithRetry = withRetry(myFunction, {
  maxRetries: 3,
  delay: 1000,
  backoff: true
});
```

### Sync Queue

```typescript
import { insertWithOfflineSupport, updateWithOfflineSupport } from '@/utils/syncQueue';

// Insert with offline support
await insertWithOfflineSupport('tasks', newTask);

// Update with offline support
await updateWithOfflineSupport('tasks', updateData, { id: taskId });
```

### Network Status Component

Add to your layout:

```vue
<template>
  <Header>
    <template #network-status>
      <NetworkStatus />
    </template>
  </Header>
</template>
