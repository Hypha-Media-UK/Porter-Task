<template>
  <div class="home-view">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    
    <section v-else-if="isShiftActive" class="active-shift">
      <h1>Current Shift</h1>
      
      <!-- Current shift overview (will be a component) -->
      <div class="shift-card">
        <div class="shift-header">
          <div class="shift-date">{{ formattedDate }}</div>
          <div class="shift-type">{{ shiftType }} Shift</div>
        </div>
        <div class="shift-info">
          <p>Supervisor: {{ supervisor }}</p>
          <p>Started: {{ startTime }}</p>
        </div>
      </div>
      
      <!-- Open shift button -->
      <div class="shift-actions">
        <button class="btn-primary" @click="openShift">Open Shift</button>
      </div>
    </section>
    
    <section v-else class="new-shift">
      <h1>Start New Shift</h1>
      <p>Create a new porter shift to start tracking and managing tasks.</p>
      
      <div class="shift-form">
        <div class="form-group">
          <label for="supervisor">Supervisor</label>
          <select 
            id="supervisor" 
            v-model="supervisor" 
            class="form-control"
          >
            <option value="" disabled>Select Supervisor</option>
            <option v-for="sup in supervisors" :key="sup" :value="sup">{{ sup }}</option>
          </select>
        </div>
        
        <div class="shift-actions">
          <button 
            class="btn-primary"
            @click="startShift('Day')"
            :disabled="!supervisor"
          >
            Start Day Shift
          </button>
          <button 
            class="btn-secondary"
            @click="startShift('Night')"
            :disabled="!supervisor"
          >
            Start Night Shift
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Placeholder data (will come from stores)
const isLoading = ref(false)
const isShiftActive = ref(false)
const supervisor = ref('')
const supervisors = ref(['John Doe', 'Jane Smith', 'Mike Johnson'])
const shiftType = ref('Day')
const startTime = ref('08:00')
const formattedDate = ref('May 17, 2025')

// Methods
const startShift = (type: 'Day' | 'Night') => {
  // Will implement actual shift starting with store
  isShiftActive.value = true
  shiftType.value = type
  router.push('/tasks')
}

const openShift = () => {
  router.push('/tasks')
}
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  font-size: 24px;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

.shift-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.shift-type {
  background-color: #0066cc;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 14px;
}

.shift-info {
  padding: 1rem;
}

.shift-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.shift-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0055aa;
}

.btn-primary:disabled {
  background-color: #88b8e8;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-secondary:disabled {
  background-color: #a1a8ae;
  cursor: not-allowed;
}
</style>
