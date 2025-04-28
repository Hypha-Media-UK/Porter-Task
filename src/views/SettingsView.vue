<template>
  <main class="settings-view">
    <header class="top-header">
      <h1>Settings</h1>
    </header>
      
    <!-- Settings Tabs Navigation -->
    <nav class="settings-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon" v-html="tab.icon"></span>
          {{ tab.name }}
        </button>
    </nav>
    
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
import JobCategories from '../components/settings/JobCategories.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')

// Tab data with SVG icons
const tabs = [
  {
    id: 'app',
    name: 'App Settings',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>`
  },
  {
    id: 'staff',
    name: 'Staff',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`
  },
  {
    id: 'locations',
    name: 'Locations',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>`
  },
  {
    id: 'tasks',
    name: 'Task Types',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>`
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

.settings-tabs {
  display: flex;
  overflow-x: auto;
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-md);
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
}

.settings-tabs::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.tab-button {
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-xs);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tab-button.active {
  color: var(--color-primary);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  right: 25%;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 1px;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xs);
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
