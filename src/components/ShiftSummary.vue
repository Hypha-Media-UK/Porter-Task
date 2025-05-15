<template>
  <div class="shift-summary dashboard-card">
    <div class="card-header">
      <div class="title-area">
        <h2>Previous Shift</h2>
      </div>
      <span class="shift-date">{{ formatDate(new Date(shift.date)) }}</span>
    </div>
    
    <div class="card-content">
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Type</span>
          <span class="summary-value" :class="shift.type.toLowerCase() + '-text'">{{ shift.type }} Shift</span>
        </div>
        
        <div class="summary-item">
          <span class="summary-label">Supervisor</span>
          <span class="summary-value">{{ shift.supervisor }}</span>
        </div>
        
        <div class="summary-item">
          <span class="summary-label">Tasks</span>
          <span class="summary-value">
            <span class="task-count">{{ totalTasks }}</span>
            <span class="task-breakdown" v-if="totalTasks > 0">
              ({{ completedTasks }} completed, {{ pendingTasks }} pending)
            </span>
          </span>
        </div>
        
        <div class="summary-item">
          <span class="summary-label">Duration</span>
          <span class="summary-value">{{ duration }}</span>
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

.shift-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.card-content {
  padding: var(--spacing-md);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.day-text {
  color: var(--color-primary);
}

.night-text {
  color: var(--color-secondary);
}

.task-count {
  font-weight: var(--font-weight-bold);
}

.task-breakdown {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}
</style>
