<template>
  <div class="archive-view">
    <header class="archive-header">
      <h1>Shift Archive</h1>
    </header>
    
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading archived shifts...</p>
    </div>
    
    <div v-else-if="archivedShifts.length === 0" class="empty-state">
      <p>No archived shifts found.</p>
      <p>Completed shifts will appear here once they are ended.</p>
    </div>
    
    <div v-else class="shifts-list">
      <div v-for="shift in archivedShifts" :key="shift.id" class="shift-card" @click="openShiftDetail(shift.id)">
        <div class="shift-header">
          <div class="shift-date">{{ shift.date }}</div>
          <div class="shift-type" :class="shift.type.toLowerCase()">{{ shift.type }} Shift</div>
        </div>
        <div class="shift-info">
          <div class="info-row">
            <div class="info-item">
              <span class="label">Supervisor</span>
              <span class="value">{{ shift.supervisor }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Started</span>
              <span class="value">{{ shift.startTime }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Ended</span>
              <span class="value">{{ shift.endTime }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Tasks</span>
              <span class="value">{{ shift.tasksCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// State
const isLoading = ref(false)
const archivedShifts = ref([
  {
    id: '1',
    date: 'May 16, 2025',
    type: 'Day',
    supervisor: 'John Doe',
    startTime: '08:00',
    endTime: '20:00',
    tasksCount: 12
  },
  {
    id: '2',
    date: 'May 15, 2025',
    type: 'Night',
    supervisor: 'Jane Smith',
    startTime: '20:00',
    endTime: '08:00',
    tasksCount: 8
  },
  {
    id: '3',
    date: 'May 14, 2025',
    type: 'Day',
    supervisor: 'Mike Johnson',
    startTime: '08:00',
    endTime: '20:00',
    tasksCount: 15
  }
])

// Methods
const openShiftDetail = (shiftId: string) => {
  router.push(`/archive/${shiftId}`)
}
</script>

<style scoped>
.archive-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.archive-header {
  margin-bottom: 1rem;
}

h1 {
  font-size: 24px;
  margin-bottom: 1rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 102, 204, 0.2);
  border-top-color: #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state p {
  margin-bottom: 0.5rem;
  color: #666;
}

.shifts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shift-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.shift-card:hover {
  transform: translateY(-2px);
}

.shift-header {
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.shift-date {
  font-weight: bold;
}

.shift-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 14px;
  color: white;
}

.shift-type.day {
  background-color: #0066cc;
}

.shift-type.night {
  background-color: #6f42c1;
}

.shift-info {
  padding: 1rem;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  flex: 1;
  min-width: 120px;
}

.label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: 500;
}
</style>
