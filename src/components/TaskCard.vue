<template>
  <div 
    class="task-card" 
    :class="{ 
      'compact': compact, 
      'pending': task.status === 'Pending',
      'completed': task.status === 'Completed'
    }"
  >
    <div class="task-header">
      <div class="task-category">{{ task.jobCategory }}</div>
      <div class="task-status" :class="task.status.toLowerCase()">
        {{ task.status }}
      </div>
    </div>
    
    <div class="task-details">
      <div class="task-item-type">{{ task.itemType }}</div>
      
      <div class="task-locations">
        <div class="location from">
          <span class="label">From:</span>
          <span class="value">{{ task.fromLocation.displayName }}</span>
        </div>
        
        <div class="location-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
        
        <div class="location to">
          <span class="label">To:</span>
          <span class="value">{{ task.toLocation.displayName }}</span>
        </div>
      </div>
      
      <div class="task-time">
        <span class="label">Received:</span>
        <span class="value">{{ formatTime(new Date(task.receivedTime)) }}</span>
        
        <template v-if="task.status === 'Completed' && task.completedTime">
          <span class="separator">•</span>
          <span class="label">Completed:</span>
          <span class="value">{{ formatTime(new Date(task.completedTime)) }}</span>
        </template>
      </div>
      
      <!-- Display porter information for completed tasks -->
      <div v-if="task.status === 'Completed' && task.allocatedStaff" class="task-porter">
        <span class="label">Porter:</span>
        <span class="value porter-name">{{ task.allocatedStaff }}</span>
      </div>
    </div>
    
    <div v-if="!compact && task.status === 'Pending'" class="task-actions">
      <button 
        class="btn-success mark-complete-btn"
        @click.stop="markAsComplete"
      >
        Mark as Complete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Task } from '../types'
import { formatTime } from '../utils/date'

// Props
const props = defineProps<{
  task: Task;
  compact?: boolean;
}>()

// Emits
const emit = defineEmits<{
  (e: 'complete', taskId: string): void;
}>()

// Actions
const markAsComplete = () => {
  emit('complete', props.task.id)
}
</script>

<style scoped>
/* Task card with improved styling */
.task-card {
  position: relative;
  overflow: hidden;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.task-card:not(.compact):hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-strong);
}

.task-card.pending {
  border-left: 4px solid var(--color-pending);
}

.task-card.completed {
  border-left: 4px solid var(--color-success);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--color-border-light);
}

.task-category {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.task-status {
  font-size: var(--font-size-xs);
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-pill);
  font-weight: var(--font-weight-medium);
}

.task-status.pending {
  background-color: var(--color-pending);
  color: white;
}

.task-status.completed {
  background-color: var(--color-success);
  color: white;
}

.task-details {
  padding: var(--spacing-md);
}

.task-item-type {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.task-locations {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  gap: var(--spacing-xs);
}

.location {
  font-size: var(--font-size-sm);
}

.location-arrow {
  color: var(--color-text-light);
  margin: 0 var(--spacing-xs);
}

.task-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.task-porter {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.porter-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-success);
}

.label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-light);
  margin-right: 2px;
}

.separator {
  margin: 0 var(--spacing-xs);
}

.task-actions {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
}

.mark-complete-btn {
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-md);
}

/* Compact variation */
.task-card.compact .task-header {
  padding: var(--spacing-xs) var(--spacing-md);
}

.task-card.compact .task-details {
  padding: var(--spacing-xs) var(--spacing-md);
}

.task-card.compact .task-item-type {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.task-card.compact .task-locations {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-xs);
}
</style>
