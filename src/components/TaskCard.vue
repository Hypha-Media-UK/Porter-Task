<template>
  <div 
    class="task-card" 
    :class="{ 
      'compact': compact, 
      'pending': task.status === 'Pending',
      'completed': task.status === 'Completed'
    }"
  >
    <div class="task-status-indicator" :class="task.status.toLowerCase()"></div>
    
    <div class="task-content">
      <div class="task-header">
        <div class="task-meta">
          <div class="task-category">{{ task.jobCategory }}</div>
          <div class="task-status-badge" :class="task.status.toLowerCase()">
            {{ task.status }}
          </div>
        </div>
        <div class="task-item-type">{{ task.itemType }}</div>
      </div>
      
      <div class="task-journey">
        <div class="journey-point from">
          <div class="journey-icon from-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div class="journey-details">
            <div class="journey-label">From</div>
            <div class="journey-location">{{ task.fromLocation.displayName }}</div>
          </div>
        </div>
        
        <div class="journey-connector">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
        
        <div class="journey-point to">
          <div class="journey-icon to-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16l4-4-4-4"></path>
              <path d="M8 12h8"></path>
            </svg>
          </div>
          <div class="journey-details">
            <div class="journey-label">To</div>
            <div class="journey-location">{{ task.toLocation.displayName }}</div>
          </div>
        </div>
      </div>
      
      <div class="task-footer">
        <div class="task-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ formatTime(new Date(task.receivedTime)) }}</span>
          
          <template v-if="task.status === 'Completed' && task.completedTime">
            <span class="separator">•</span>
            <span class="completed-time">{{ formatTime(new Date(task.completedTime)) }}</span>
          </template>
        </div>
        
        <!-- Display porter information for completed tasks -->
        <div v-if="task.status === 'Completed' && task.allocatedStaff" class="task-porter">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="porter-name">{{ task.allocatedStaff }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="!compact && task.status === 'Pending'" class="task-action-ribbon">
      <button 
        class="btn-success mark-complete-btn"
        @click.stop="markAsComplete"
      >
        Complete
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
/* Modern iOS-inspired task card */
.task-card {
  position: relative;
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.task-card:not(.compact):active {
  transform: scale(0.98);
  box-shadow: var(--box-shadow);
}

.task-status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.task-status-indicator.pending {
  background-color: var(--color-pending);
}

.task-status-indicator.completed {
  background-color: var(--color-success);
}

.task-content {
  padding: var(--spacing-md);
  flex: 1;
}

.task-header {
  margin-bottom: var(--spacing-md);
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.task-category {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.task-status-badge {
  font-size: var(--font-size-xs);
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-pill);
  font-weight: var(--font-weight-medium);
  color: white;
  min-width: 70px;
  text-align: center;
}

.task-status-badge.pending {
  background-color: var(--color-pending);
}

.task-status-badge.completed {
  background-color: var(--color-success);
}

.task-item-type {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.task-journey {
  position: relative;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-sm);
}

.journey-point {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.journey-point.to {
  margin-bottom: 0;
}

.journey-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.journey-icon.from-icon {
  color: var(--color-primary);
}

.journey-icon.to-icon {
  color: var(--color-success);
}

.journey-details {
  flex: 1;
}

.journey-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.journey-location {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.journey-connector {
  position: absolute;
  left: 11px;
  top: 28px;
  height: calc(100% - 56px);
  display: flex;
  align-items: center;
  color: var(--color-text-light);
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border-light);
}

.task-time, .task-porter {
  display: flex;
  align-items: center;
}

.task-time svg, .task-porter svg {
  margin-right: 4px;
}

.completed-time {
  color: var(--color-success);
}

.porter-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.separator {
  margin: 0 var(--spacing-xs);
}

.task-action-ribbon {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(var(--color-success-rgb), 0.05);
  border-top: 1px solid var(--color-border-light);
}

.mark-complete-btn {
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-pill);
}

/* Compact variation */
.task-card.compact {
  margin-bottom: var(--spacing-sm);
}

.task-card.compact .task-content {
  padding: var(--spacing-sm);
}

.task-card.compact .task-item-type {
  font-size: var(--font-size-base);
}

.task-card.compact .task-journey {
  padding: var(--spacing-xs) 0;
  margin-bottom: var(--spacing-xs);
}

.task-card.compact .journey-point {
  margin-bottom: var(--spacing-sm);
}

.task-card.compact .journey-icon {
  transform: scale(0.9);
}
</style>
