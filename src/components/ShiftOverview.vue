<template>
  <div class="dashboard-card shift-overview" :class="{ 'previous-shift': variant === 'previous' }">
    <div class="card-header">
      <div class="title-area">
        <h2 :class="shift.type.toLowerCase() + '-text'">{{ shift.type }} Shift</h2>
      </div>
      <button v-if="showEndButton" class="btn-danger" @click="$emit('end-shift')">
        End Shift
      </button>
    </div>
    
    <div class="card-content">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Date</span>
          <span class="info-value">{{ formatDate(new Date(shift.date)) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Start Time</span>
          <span class="info-value">{{ formatTime(new Date(shift.startTime)) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Supervisor</span>
          <span class="info-value">{{ shift.supervisor }}</span>
        </div>
        <div class="info-item" v-if="shift.tasks">
          <span class="info-label">Tasks</span>
          <span class="info-value">
            <span class="task-count">{{ totalTasks }}</span>
            <span class="task-breakdown" v-if="totalTasks > 0">
              ({{ completedTasks }} completed, {{ pendingTasks }} pending)
            </span>
          </span>
        </div>
        <div class="info-item" v-if="variant === 'previous' && shift.startTime && shift.endTime">
          <span class="info-label">Duration</span>
          <span class="info-value">{{ duration }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Shift } from '@/types';
import { formatDate, formatTime } from '@/utils/date';

const props = defineProps<{
  shift: Shift;
  showEndButton?: boolean;
  variant?: 'current' | 'previous';
}>();

defineEmits<{
  (e: 'end-shift'): void;
}>();

// Calculate total tasks
const totalTasks = computed(() => {
  return props.shift.tasks?.length || 0;
});

// Calculate completed tasks
const completedTasks = computed(() => {
  return props.shift.tasks?.filter(task => task.status === 'Completed').length || 0;
});

// Calculate pending tasks
const pendingTasks = computed(() => {
  return props.shift.tasks?.filter(task => task.status === 'Pending').length || 0;
});

// Calculate shift duration
const duration = computed(() => {
  if (!props.shift.startTime || !props.shift.endTime) {
    return 'Unknown';
  }
  
  const start = new Date(props.shift.startTime);
  const end = new Date(props.shift.endTime);
  
  // Calculate difference in milliseconds
  const diff = end.getTime() - start.getTime();
  
  // Convert to hours and minutes
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});
</script>

<style scoped>
.dashboard-card {
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: var(--spacing-md);
  transition: all 0.2s ease;
}

/* Previous shift styling */
.previous-shift {
  background-color: var(--color-background-light, #f8f9fa);
  border-color: var(--color-border, #dee2e6);
}

.previous-shift .card-header {
  background-color: rgba(var(--color-secondary-rgb, 108, 117, 125), 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-card);
}

.title-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.day-text {
  color: var(--color-primary);
}

.night-text {
  color: var(--color-secondary);
}

.card-content {
  padding: var(--spacing-md);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.info-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.task-count {
  font-weight: var(--font-weight-bold);
}

.task-breakdown {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast);
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}
</style>
