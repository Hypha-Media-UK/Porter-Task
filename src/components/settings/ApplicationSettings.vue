<template>
  <section class="settings-section">
    <h2>Application Settings</h2>
    
    <!-- Department Designations section -->
    <DesignationDepartmentManager />
    
    <div class="setting-group">
      <div class="setting-row">
        <div class="setting-label">
          <h3>Data Storage</h3>
          <p>Choose how shift data is stored and backed up</p>
        </div>
        <div class="setting-control">
          <select v-model="settings.storage.type" class="select-control">
            <option value="local">Local Storage</option>
            <option value="cloud">Cloud Storage</option>
          </select>
        </div>
      </div>
      
      <div class="setting-row">
        <div class="setting-label">
          <h3>Auto Backup</h3>
          <p>Automatically create backups of completed shifts</p>
        </div>
        <div class="setting-control">
          <label class="switch">
            <input type="checkbox" v-model="settings.storage.autoBackup">
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    </div>
    
    <h2>Shift Schedule</h2>
    
    <div class="setting-group">
      <div class="setting-row shift-time-row">
        <div class="setting-label">
          <h3>Day Shift Hours</h3>
          <p>Set the standard start and end times for day shifts</p>
        </div>
        <div class="setting-control time-control">
          <div class="time-inputs">
            <div class="time-input-group">
              <label>Start</label>
              <input 
                type="time" 
                v-model="settings.shifts.day.start" 
                class="time-input"
              >
            </div>
            <span class="time-separator">to</span>
            <div class="time-input-group">
              <label>End</label>
              <input 
                type="time" 
                v-model="settings.shifts.day.end" 
                class="time-input"
              >
            </div>
          </div>
        </div>
      </div>
      
      <div class="setting-row shift-time-row">
        <div class="setting-label">
          <h3>Night Shift Hours</h3>
          <p>Set the standard start and end times for night shifts</p>
        </div>
        <div class="setting-control time-control">
          <div class="time-inputs">
            <div class="time-input-group">
              <label>Start</label>
              <input 
                type="time" 
                v-model="settings.shifts.night.start" 
                class="time-input"
              >
            </div>
            <span class="time-separator">to</span>
            <div class="time-input-group">
              <label>End</label>
              <input 
                type="time" 
                v-model="settings.shifts.night.end" 
                class="time-input"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import DesignationDepartmentManager from './DesignationDepartmentManager.vue'

// Get the settings store
const settingsStore = useSettingsStore()

// Local state with storage settings
const settings = reactive({
  storage: {
    type: 'local',
    autoBackup: true
  },
  shifts: settingsStore.shifts
})

// Watch for changes to the shifts and save them to the store
watch(() => settings.shifts, (newShifts) => {
  settingsStore.updateSettings({ shifts: newShifts })
}, { deep: true })

// Initialize settings from the store
onMounted(() => {
  // Any additional initialization logic would go here
})
</script>

<style scoped>
.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-md);
  color: var(--color-text);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border-light);
}

.setting-group {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
}

.setting-row {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-light);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  flex: 1;
}

.setting-label h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-xs);
  color: var(--color-text);
}

.setting-label p {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin: 0;
}

.setting-control {
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
}

.select-control {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  min-width: 120px;
}

/* Shift time inputs */
.shift-time-row {
  flex-direction: column;
  align-items: flex-start;
}

.time-control {
  width: 100%;
  margin-top: var(--spacing-sm);
  justify-content: flex-start;
}

.time-inputs {
  display: flex;
  align-items: center;
  width: 100%;
}

.time-input-group {
  display: flex;
  flex-direction: column;
}

.time-input-group label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.time-input {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  width: 100px;
  appearance: none;
  background-color: var(--color-background);
}

.time-separator {
  margin: 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  align-self: flex-end;
  margin-bottom: var(--spacing-xs);
}

/* Switch toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

@media (min-width: 768px) {
  .shift-time-row {
    flex-direction: row;
    align-items: center;
  }
  
  .time-control {
    width: auto;
    margin-top: 0;
  }
}
</style>
