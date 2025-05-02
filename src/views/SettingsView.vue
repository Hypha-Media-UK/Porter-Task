<template>
  <main class="settings-view">
    <header class="top-header">
      <h1>Settings</h1>
    </header>
      
    <!-- Settings Tabs Navigation -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    
    <!-- Tab content -->
    <section class="tab-content">
        <!-- App Settings Tab -->
        <div v-if="activeTab === 'app'" class="tab-pane">
          <ApplicationSettings />
        </div>
        
        <!-- Staff Tab -->
        <div v-if="activeTab === 'staff'" class="tab-pane">
          <SupervisorsList />
          <PortersList />
        </div>
        
        <!-- Locations Tab -->
        <div v-if="activeTab === 'locations'" class="tab-pane">
          <FrequentUsers />
          <BuildingsLocations />
        </div>
        
        <!-- Task Types Tab -->
        <div v-if="activeTab === 'tasks'" class="tab-pane">
          <JobCategories />
        </div>
    </section>
    
    <!-- Removed TabNavigation as all navigation items are in header -->
  </main>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import type { RouteParams } from '../types'
import TabNavigation from '../components/TabNavigation.vue'
import ApplicationSettings from '../components/settings/ApplicationSettings.vue'
import SupervisorsList from '../components/settings/SupervisorsList.vue'
import PortersList from '../components/settings/PortersList.vue'
import BuildingsLocations from '../components/settings/BuildingsLocations.vue'
import FrequentUsers from '../components/settings/FrequentUsers.vue'
import JobCategories from '../components/settings/JobCategories.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Tab data
const tabs = [
  {
    id: 'app',
    name: 'App Settings'
  },
  {
    id: 'staff',
    name: 'Staff'
  },
  {
    id: 'locations',
    name: 'Locations'
  },
  {
    id: 'tasks',
    name: 'Task Types'
  }
]

// Active tab state
const activeTab = ref('app')
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.top-header {
  margin-bottom: var(--spacing-md);
}

h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text);
}

/* Tabs Container */
.tabs-container {
  margin-bottom: var(--spacing-md);
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-xs);
  overflow-x: auto;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
}

.tabs::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.tab {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: none;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.tab.active {
  color: var(--color-primary);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: var(--border-radius-pill);
}

.tab:hover:not(.active) {
  color: var(--color-text);
  background-color: rgba(0, 0, 0, 0.03);
}


.tab-content {
  padding-bottom: var(--spacing-md);
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .settings-view {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .tab-button {
    font-size: var(--font-size-sm);
    padding: var(--spacing-md) var(--spacing-md);
  }
}
</style>
