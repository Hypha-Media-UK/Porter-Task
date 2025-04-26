<template>
  <section class="settings-section">
    <h2>Application Settings</h2>
    
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
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// Local state
const settings = reactive({
  storage: {
    type: 'local',
    autoBackup: true
  }
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
</style>
