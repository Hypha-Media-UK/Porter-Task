<template>
  <div class="network-status">
    <div class="status-indicator" :class="{ 'online': isOnline, 'offline': !isOnline }">
      <div class="status-icon">
        <svg v-if="isOnline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <circle cx="12" cy="20" r="1"></circle>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <circle cx="12" cy="20" r="1"></circle>
        </svg>
      </div>
      <div class="status-text">{{ networkStatus }}</div>
    </div>
    <div v-if="pendingCount > 0" class="sync-info">
      <div class="sync-icon">
        <svg class="sync-spinner" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 1-9 9"></path>
          <path d="M3 12a9 9 0 0 1 9-9"></path>
          <path d="M21 12a9 9 0 0 0-9 9"></path>
          <path d="M3 12a9 9 0 0 0 9-9"></path>
        </svg>
      </div>
      <div class="sync-count">{{ pendingCount }} {{ pendingCount === 1 ? 'change' : 'changes' }} pending sync</div>
      <button v-if="isOnline && pendingCount > 0" class="sync-now-btn" @click="syncNow">Sync now</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { isOnline as checkIsOnline, onNetworkStatusChange } from '@/utils/dataService';
import { syncQueue } from '@/utils/syncQueue';

// State
const isOnline = ref(checkIsOnline());
const pendingCount = ref(0);
const removeNetworkListener = ref<(() => void) | null>(null);
const updateInterval = ref<number | null>(null);

// Computed
const networkStatus = computed(() => {
  return isOnline.value ? 'Online' : 'Offline';
});

// Methods
const updatePendingCount = () => {
  pendingCount.value = syncQueue.getPendingOperations().length;
};

const syncNow = () => {
  if (isOnline.value && pendingCount.value > 0) {
    syncQueue.processQueue();
    updatePendingCount();
  }
};

// Lifecycle hooks
onMounted(() => {
  // Set up network status change listener
  removeNetworkListener.value = onNetworkStatusChange((online) => {
    isOnline.value = online;
    
    // If we're back online and have pending operations, process the queue
    if (online && pendingCount.value > 0) {
      syncQueue.processQueue();
    }
    
    updatePendingCount();
  });
  
  // Set up interval to update pending count
  updateInterval.value = window.setInterval(() => {
    updatePendingCount();
  }, 5000); // Update every 5 seconds
  
  // Initial count update
  updatePendingCount();
});

onUnmounted(() => {
  // Clean up listeners
  if (removeNetworkListener.value) {
    removeNetworkListener.value();
  }
  
  // Clear interval
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
});
</script>

<style scoped>
.network-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 10px;
  font-size: var(--font-size-xs);
  background-color: var(--color-background-light, #f8f9fa);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light, #e9ecef);
  max-width: 100%;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator.online {
  color: var(--color-success, #28a745);
}

.status-indicator.offline {
  color: var(--color-danger, #dc3545);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-weight: var(--font-weight-medium, 500);
}

.sync-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary, #6c757d);
  margin-top: 2px;
}

.sync-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sync-spinner {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sync-count {
  font-size: var(--font-size-xs);
}

.sync-now-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-xs);
  color: var(--color-primary, #0d6efd);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm, 2px);
  transition: background-color 0.2s ease;
}

.sync-now-btn:hover {
  background-color: rgba(var(--color-primary-rgb, 13, 110, 253), 0.1);
  text-decoration: underline;
}
</style>
