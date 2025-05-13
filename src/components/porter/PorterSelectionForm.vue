<template>
  <div class="porter-selection-form">
    <h3>Porter Assignment</h3>
    <p class="description">Select porters who will be working during this shift</p>
    
    <div class="form-section">
      <div class="selection-control">
        <select 
          v-model="selectedPorter" 
          class="form-control"
          :disabled="!availablePorters.length"
        >
          <option value="" disabled>Select porter</option>
          <option v-for="porter in availablePorters" :key="porter" :value="porter">
            {{ porter }}
          </option>
        </select>
        <button 
          class="btn-primary" 
          @click="addPorter"
          :disabled="!selectedPorter"
        >
          Add Porter
        </button>
      </div>
      
      <div v-if="assignedPorters.length === 0" class="empty-state">
        <p>No porters assigned to this shift yet.</p>
      </div>
      
      <div v-else class="porter-list">
        <h4>Assigned Porters:</h4>
        <div class="porter-tags">
          <div v-for="porter in assignedPorters" :key="porter" class="porter-tag">
            <span class="porter-name">{{ porter }}</span>
            <button class="remove-porter" @click="removePorter(porter)" title="Remove porter">
              &times;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  availablePorters: string[],
  assignedPorters: string[],
}>()

const emit = defineEmits(['add-porter', 'remove-porter'])

const selectedPorter = ref('')

function addPorter() {
  if (selectedPorter.value && !props.assignedPorters.includes(selectedPorter.value)) {
    emit('add-porter', selectedPorter.value)
    selectedPorter.value = ''
  }
}

function removePorter(porter: string) {
  emit('remove-porter', porter)
}
</script>

<style scoped>
.porter-selection-form {
  margin-bottom: 20px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

h4 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  margin-top: 16px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.form-section {
  background-color: #f5f8fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.selection-control {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.selection-control select {
  flex: 1;
}

.form-control {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.empty-state {
  background-color: #f0f4f8;
  padding: 16px;
  border-radius: 4px;
  text-align: center;
  color: #666;
}

.porter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.porter-tag {
  display: flex;
  align-items: center;
  background-color: #e0f0ff;
  color: #0066cc;
  padding: 6px 12px;
  border-radius: 16px;
}

.porter-name {
  margin-right: 8px;
}

.remove-porter {
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}
</style>
