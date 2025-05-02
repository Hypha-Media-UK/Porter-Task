<template>
  <article 
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
        <!-- Task Category (Most Important) -->
        <div class="task-category">{{ task.jobCategory }}</div>
        
        <!-- Task Type (Secondary Importance) -->
        <div class="task-item-type">{{ task.itemType }}</div>
      </div>
      
      <!-- Department Origin > Department Destination (Important) -->
      <div class="location-journey">
        <div class="location from">
          <div class="location-label">From:</div>
          <div class="location-name">{{ task.fromLocation.displayName }}</div>
        </div>
        
        <div class="journey-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
        
        <div class="location to">
          <div class="location-label">To:</div>
          <div class="location-name">{{ task.toLocation.displayName }}</div>
        </div>
      </div>
      
      <div class="task-footer">
        <div class="task-meta-row">
          <!-- Time Received > Time Completed -->
          <div class="task-times">
            <div class="time-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div class="time-details">
                <div class="time-label">Received:</div>
                <div class="time-value">{{ formatTime(new Date(task.receivedTime)) }}</div>
              </div>
            </div>
            
            <template v-if="task.status === 'Completed' && task.completedTime">
              <div class="time-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div class="time-details">
                  <div class="time-label">Completed:</div>
                  <div class="time-value completed">{{ formatTime(new Date(task.completedTime)) }}</div>
                </div>
              </div>
            </template>
          </div>
          
          <!-- Staff Allocated (Least Important but still visible) -->
          <div v-if="task.allocatedStaff" class="task-porter">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div class="porter-details">
              <div class="porter-label">Assigned to:</div>
              <div class="porter-name">{{ task.allocatedStaff }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!compact && task.status === 'Pending'" class="task-action-ribbon">
      <div v-if="!canCompleteTask" class="shift-hours-warning">
        Outside shift hours ({{ getShiftHoursDisplay() }})
      </div>
      <div class="task-action-buttons">
        <button 
          class="btn-secondary update-task-btn"
          @click.stop="updateTask"
        >
          Update
        </button>
        <button 
          class="btn-success mark-complete-btn"
          :class="{ 'disabled': !canCompleteTask }"
          @click.stop="markAsComplete"
        >
          Complete
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useShiftStore } from '../stores/shift'
import type { Task } from '../types'
import { formatTime } from '../utils/date'

// Props
const props = defineProps<{
  task: Task;
  compact?: boolean;
}>()

// Stores
const settingsStore = useSettingsStore()
const shiftStore = useShiftStore()
const currentShift = shiftStore.currentShift

// Emits
const emit = defineEmits<{
  (e: 'complete', taskId: string): void;
  (e: 'update', taskId: string): void;
}>()

// Check if a time is within the current shift's schedule
const isTimeWithinShiftSchedule = (timeString: string): boolean => {
  if (!currentShift) return false;
  
  // Get shift type and schedule
  const shiftType = currentShift.type.toLowerCase();
  const schedule = settingsStore.shifts[shiftType as 'day' | 'night'];
  
  // Handle overnight shifts (e.g., 20:00 - 08:00)
  const isOvernight = schedule.end < schedule.start;
  
  // Get hours and minutes from the timeString (which is ISO format)
  const date = new Date(timeString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeValue = hours * 60 + minutes; // Convert to minutes
  
  // Get schedule times in minutes
  const [startHours, startMinutes] = schedule.start.split(':').map(Number);
  const [endHours, endMinutes] = schedule.end.split(':').map(Number);
  const startValue = startHours * 60 + startMinutes;
  const endValue = endHours * 60 + endMinutes;
  
  if (isOvernight) {
    // For overnight shifts (e.g., 20:00 - 08:00), time is valid if:
    // 1. It's after start time (e.g., >= 20:00), OR
    // 2. It's before end time (e.g., <= 08:00)
    return timeValue >= startValue || timeValue <= endValue;
  } else {
    // For day shifts, time is valid if between start and end
    return timeValue >= startValue && timeValue <= endValue;
  }
};

// Helper to display shift hours for warnings/messages
const getShiftHoursDisplay = (): string => {
  if (!currentShift) return '';
  
  const shiftType = currentShift.type.toLowerCase();
  const schedule = settingsStore.shifts[shiftType as 'day' | 'night'];
  
  return `${schedule.start} to ${schedule.end}`;
};

// Check if we can complete the task based on shift hours
const canCompleteTask = computed(() => {
  if (!currentShift) return false;
  
  // Current time must be within shift hours
  const now = new Date();
  const currentTimeString = now.toISOString();
  return isTimeWithinShiftSchedule(currentTimeString);
});

// Actions
const markAsComplete = () => {
  // Only allow completion if within shift hours
  if (canCompleteTask.value) {
    emit('complete', props.task.id);
  } else {
    // Show alert if outside shift hours
    const shiftType = currentShift?.type.toLowerCase() || 'current';
    const schedule = settingsStore.shifts[shiftType as 'day' | 'night'];
    alert(`Tasks can only be completed during ${shiftType} shift hours (${schedule.start} - ${schedule.end}). Please use the task edit form to set valid completion times.`);
  }
}

// Navigate to task form to update task
const updateTask = () => {
  emit('update', props.task.id);
}
</script>

<style scoped>
/* Modern iOS-inspired task card */
.task-card {
  position: relative;
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-fast);
}

.task-card:not(.compact):active {
  transform: scale(0.98);
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

/* Task header - Category & Type */
.task-category {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.task-item-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

/* Location journey */
.location-journey {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-xs) 0;
}

.location {
  flex: 1;
}

.location-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.location-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.journey-arrow {
  margin: 0 var(--spacing-xs);
  color: var(--color-text-light);
}

.location.from .location-name {
  color: var(--color-primary);
}

.location.to .location-name {
  color: var(--color-success);
}

/* Task footer with times and staff */
.task-footer {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border-light);
}

.task-meta-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-times {
  display: flex;
  gap: var(--spacing-md);
}

.time-item, .task-porter {
  display: flex;
  align-items: flex-start;
}

.time-item svg, .task-porter svg {
  margin-right: var(--spacing-xs);
  margin-top: 2px;
  color: var(--color-text-secondary);
}

.time-details, .porter-details {
  display: flex;
  flex-direction: column;
}

.time-label, .porter-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.time-value, .porter-name {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.time-value.completed {
  color: var(--color-success);
}

@media (min-width: 768px) {
  .task-meta-row {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.task-action-ribbon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(var(--color-success-rgb), 0.05);
  border-top: 1px solid var(--color-border-light);
}

.shift-hours-warning {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  padding: var(--spacing-xs);
}

.task-action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.update-task-btn, .mark-complete-btn {
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-pill);
}

.mark-complete-btn.disabled {
  background-color: var(--color-text-light);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Compact variation */
.task-card.compact {
  margin-bottom: var(--spacing-sm);
}

.task-card.compact .task-content {
  padding: var(--spacing-sm);
}

.task-card.compact .task-category {
  font-size: var(--font-size-base);
}

.task-card.compact .task-item-type {
  font-size: var(--font-size-xs);
}

.task-card.compact .location-journey {
  margin-bottom: var(--spacing-xs);
}

.task-card.compact .time-item svg, 
.task-card.compact .task-porter svg {
  transform: scale(0.9);
}
</style>
