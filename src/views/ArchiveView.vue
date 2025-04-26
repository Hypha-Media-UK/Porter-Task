<template>
  <div class="archive-view">
    <div class="content">
      <h1>Shift Archive</h1>
      
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading shift history...</p>
      </div>
      
      <div v-else-if="archivedShifts.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h3>No Archived Shifts</h3>
        <p>There are no completed shifts in the archive yet.</p>
      </div>
      
      <div v-else class="shift-list">
        <div v-for="(shifts, month) in groupedShifts" :key="month" class="month-group">
          <h2 class="month-header">{{ month }}</h2>
          
          <div 
            v-for="shift in shifts" 
            :key="shift.id" 
            class="shift-item"
            @click="viewShiftDetail(shift.id)"
          >
            <div class="shift-date">
              <span class="date">{{ formatDateDay(new Date(shift.date)) }}</span>
              <span class="type" :class="shift.type.toLowerCase()">{{ shift.type }}</span>
            </div>
            
            <div class="shift-info">
              <div class="supervisor">{{ shift.supervisor }}</div>
              <div class="time">
                {{ formatTime(new Date(shift.startTime)) }} - 
                {{ shift.endTime ? formatTime(new Date(shift.endTime)) : 'Ongoing' }}
              </div>
            </div>
            
            <div class="shift-tasks-count">
              <span class="count">{{ shift.tasks.length }}</span>
              <span class="label">{{ shift.tasks.length === 1 ? 'task' : 'tasks' }}</span>
            </div>
            
            <div class="chevron">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <TabNavigation current-route="archive" @navigate="navigate" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useShiftStore } from '../stores/shift'
import { formatDate, formatTime } from '../utils/date'
import type { RouteParams, Shift } from '../types'
import TabNavigation from '../components/TabNavigation.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Store
const shiftStore = useShiftStore()
const { archivedShifts, isLoading } = shiftStore

// Format date to show only day and date
const formatDateDay = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric'
  })
}

// Group shifts by month
const groupedShifts = computed(() => {
  const groups: Record<string, Shift[]> = {}
  
  archivedShifts.forEach(shift => {
    const date = new Date(shift.date)
    const monthYear = date.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    })
    
    if (!groups[monthYear]) {
      groups[monthYear] = []
    }
    
    groups[monthYear].push(shift)
  })
  
  return groups
})

// Methods
const viewShiftDetail = (shiftId: string) => {
  if (navigate) navigate('shiftDetail', { shiftId })
}
</script>

<style scoped>
.archive-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 70px; /* Space for tab navigation */
}

.content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

h1 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-lg);
  color: var(--color-text);
}

.month-header {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: var(--spacing-lg) 0 var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-xs);
}

.month-group:first-child .month-header {
  margin-top: 0;
}

.shift-list {
  display: flex;
  flex-direction: column;
}

.shift-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.shift-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-strong);
}

.shift-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  margin-right: var(--spacing-md);
}

.shift-date .date {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
}

.shift-date .type {
  font-size: var(--font-size-xs);
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-pill);
  margin-top: var(--spacing-xs);
  background-color: var(--color-pending);
  color: white;
}

.shift-date .type.night {
  background-color: var(--color-primary-dark);
}

.shift-date .type.day {
  background-color: var(--color-primary);
}

.shift-info {
  flex: 1;
}

.shift-info .supervisor {
  font-weight: var(--font-weight-medium);
}

.shift-info .time {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.shift-tasks-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: var(--spacing-md);
}

.shift-tasks-count .count {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-primary);
}

.shift-tasks-count .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.chevron {
  color: var(--color-text-light);
}

/* Empty and loading states */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  flex: 1;
  color: var(--color-text-light);
}

.empty-icon, .spinner {
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  max-width: 300px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 768px) {
  .archive-view {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
