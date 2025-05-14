import { supabase } from './supabase';
import { isOnline, onNetworkStatusChange } from './dataService';

/**
 * SyncQueue manages operations that need to be performed
 * when the application is offline and syncs them when online.
 * 
 * This ensures a smooth offline-first experience for the app.
 */

// Types
export interface SyncOperation {
  id: string;
  tableName: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  conditions?: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries?: number;
  error?: string;
}

// Constants
const SYNC_QUEUE_STORAGE_KEY = 'porter-track-sync-queue';
const MAX_RETRIES = 3;
const AUTO_SYNC_INTERVAL = 60000; // 1 minute

// The sync queue instance
class SyncQueueManager {
  private operations: SyncOperation[] = [];
  private isProcessing = false;
  private syncInterval: number | null = null;
  private networkListenerRemover: (() => void) | null = null;
  
  // Initialize the sync queue
  constructor() {
    this.loadFromStorage();
    
    // Set up network status change listener
    this.networkListenerRemover = onNetworkStatusChange(online => {
      if (online) {
        console.log('Network is back online, processing sync queue');
        this.processQueue();
      }
    });
    
    // Start auto-sync interval
    this.startAutoSync();
  }
  
  // Start automatic sync at regular intervals
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = window.setInterval(() => {
      if (isOnline() && this.operations.some(op => op.status === 'pending')) {
        console.log('Auto-sync: processing queue');
        this.processQueue();
      }
    }, AUTO_SYNC_INTERVAL);
  }
  
  // Stop automatic sync
  private stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  // Load operations from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_STORAGE_KEY);
      if (stored) {
        this.operations = JSON.parse(stored);
        console.log(`Loaded ${this.operations.length} operations from sync queue`);
      }
    } catch (error) {
      console.error('Failed to load sync queue from storage:', error);
      this.operations = [];
    }
  }
  
  // Save operations to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(this.operations));
    } catch (error) {
      console.error('Failed to save sync queue to storage:', error);
    }
  }
  
  // Add an operation to the queue
  public add(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'status' | 'retries'>) {
    const newOperation: SyncOperation = {
      ...operation,
      id: generateId(),
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };
    
    this.operations.push(newOperation);
    this.saveToStorage();
    
    // If we're online, immediately try to process the queue
    if (isOnline()) {
      this.processQueue();
    }
    
    return newOperation.id;
  }
  
  // Process all pending operations in the queue
  public async processQueue() {
    // Don't process if already processing or if offline
    if (this.isProcessing || !isOnline()) return false;
    
    this.isProcessing = true;
    let success = true;
    
    try {
      // Find all pending operations
      const pendingOps = this.operations.filter(op => op.status === 'pending');
      
      if (pendingOps.length === 0) {
        return true;
      }
      
      console.log(`Processing ${pendingOps.length} pending operations in sync queue`);
      
      // Process each operation
      for (const operation of pendingOps) {
        try {
          operation.status = 'processing';
          this.saveToStorage();
          
          await this.executeOperation(operation);
          
          operation.status = 'completed';
          console.log(`Operation ${operation.id} completed successfully`);
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error);
          operation.retries = (operation.retries || 0) + 1;
          
          if (operation.retries >= MAX_RETRIES) {
            operation.status = 'failed';
            operation.error = error instanceof Error ? error.message : String(error);
            success = false;
          } else {
            operation.status = 'pending'; // Reset to pending to try again later
          }
        }
        
        this.saveToStorage();
      }
      
      // Clean up completed operations older than 1 day
      this.cleanup();
      
      return success;
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Execute a single operation
  private async executeOperation(operation: SyncOperation) {
    const { tableName, operation: opType, data, conditions } = operation;
    
    switch (opType) {
      case 'insert': {
        const { error } = await supabase
          .from(tableName)
          .insert(data);
        
        if (error) throw error;
        break;
      }
      
      case 'update': {
        if (!conditions) throw new Error('Update operation requires conditions');
        
        let query = supabase
          .from(tableName)
          .update(data);
        
        // Apply conditions
        Object.entries(conditions).forEach(([column, value]) => {
          if (value === null) {
            query = query.is(column, null);
          } else if (Array.isArray(value)) {
            query = query.in(column, value);
          } else {
            query = query.eq(column, value);
          }
        });
        
        const { error } = await query;
        if (error) throw error;
        break;
      }
      
      case 'delete': {
        if (!conditions) throw new Error('Delete operation requires conditions');
        
        let query = supabase
          .from(tableName)
          .delete();
        
        // Apply conditions
        Object.entries(conditions).forEach(([column, value]) => {
          if (value === null) {
            query = query.is(column, null);
          } else if (Array.isArray(value)) {
            query = query.in(column, value);
          } else {
            query = query.eq(column, value);
          }
        });
        
        const { error } = await query;
        if (error) throw error;
        break;
      }
      
      default:
        throw new Error(`Unsupported operation type: ${opType}`);
    }
  }
  
  // Remove completed operations that are old
  private cleanup() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    this.operations = this.operations.filter(op => 
      op.status !== 'completed' || op.timestamp > oneDayAgo
    );
    
    this.saveToStorage();
  }
  
  // Get pending operations
  public getPendingOperations() {
    return this.operations.filter(op => op.status === 'pending');
  }
  
  // Get failed operations
  public getFailedOperations() {
    return this.operations.filter(op => op.status === 'failed');
  }
  
  // Get operation by ID
  public getOperation(id: string) {
    return this.operations.find(op => op.id === id);
  }
  
  // Retry a failed operation
  public retryOperation(id: string) {
    const operation = this.operations.find(op => op.id === id);
    if (!operation) {
      throw new Error(`Operation with ID ${id} not found`);
    }
    
    if (operation.status !== 'failed') {
      throw new Error(`Cannot retry operation with status ${operation.status}`);
    }
    
    // Reset status and retry count
    operation.status = 'pending';
    operation.retries = 0;
    operation.error = undefined;
    this.saveToStorage();
    
    // If online, immediately process
    if (isOnline()) {
      this.processQueue();
    }
    
    return operation;
  }
  
  // Clear all operations
  public clear() {
    this.operations = [];
    this.saveToStorage();
  }
  
  // Clean up when the app is shutting down
  public destroy() {
    this.stopAutoSync();
    
    if (this.networkListenerRemover) {
      this.networkListenerRemover();
      this.networkListenerRemover = null;
    }
  }
}

// Helper to generate a unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Create and export a singleton instance
export const syncQueue = new SyncQueueManager();

// Helper for queueing insert operations when offline
export async function insertWithOfflineSupport(
  tableName: string,
  data: any
) {
  // Try online operation first
  if (isOnline()) {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select();
      
      if (error) throw error;
      return result;
    } catch (error) {
      // If online operation fails, queue it for later
      console.warn(`Failed to insert into ${tableName}, queueing for later:`, error);
    }
  }
  
  // Queue the operation for when we're back online
  syncQueue.add({
    tableName,
    operation: 'insert',
    data
  });
  
  // Return the original data so the app can continue
  return data;
}

// Helper for queueing update operations when offline
export async function updateWithOfflineSupport(
  tableName: string,
  data: any,
  conditions: Record<string, any>
) {
  // Try online operation first
  if (isOnline()) {
    try {
      let query = supabase
        .from(tableName)
        .update(data);
      
      // Apply conditions
      Object.entries(conditions).forEach(([column, value]) => {
        if (value === null) {
          query = query.is(column, null);
        } else if (Array.isArray(value)) {
          query = query.in(column, value);
        } else {
          query = query.eq(column, value);
        }
      });
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      return result;
    } catch (error) {
      // If online operation fails, queue it for later
      console.warn(`Failed to update ${tableName}, queueing for later:`, error);
    }
  }
  
  // Queue the operation for when we're back online
  syncQueue.add({
    tableName,
    operation: 'update',
    data,
    conditions
  });
  
  // Return modified data so the app can continue
  return { ...data };
}

// Helper for queueing delete operations when offline
export async function deleteWithOfflineSupport(
  tableName: string,
  conditions: Record<string, any>
) {
  // Try online operation first
  if (isOnline()) {
    try {
      let query = supabase
        .from(tableName)
        .delete();
      
      // Apply conditions
      Object.entries(conditions).forEach(([column, value]) => {
        if (value === null) {
          query = query.is(column, null);
        } else if (Array.isArray(value)) {
          query = query.in(column, value);
        } else {
          query = query.eq(column, value);
        }
      });
      
      const { error } = await query;
      
      if (error) throw error;
      return true;
    } catch (error) {
      // If online operation fails, queue it for later
      console.warn(`Failed to delete from ${tableName}, queueing for later:`, error);
    }
  }
  
  // Queue the operation for when we're back online
  syncQueue.add({
    tableName,
    operation: 'delete',
    data: null,
    conditions
  });
  
  return true;
}

// Initialize on app load
window.addEventListener('load', () => {
  // Process any pending operations when the app loads and is online
  if (isOnline()) {
    syncQueue.processQueue();
  }
});

// Clean up when the app is unloading
window.addEventListener('unload', () => {
  syncQueue.destroy();
});
