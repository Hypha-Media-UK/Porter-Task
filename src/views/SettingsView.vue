<template>
  <div class="settings-view">
    <div class="content">
      <h1>Settings</h1>
      
      <ApplicationSettings />
      <SupervisorsList />
      <PortersList />
      <BuildingsLocations />
      <JobCategories />
    </div>
    
    <!-- Tab navigation -->
    <TabNavigation current-route="settings" @navigate="navigate" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { RouteParams } from '../types'
import TabNavigation from '../components/TabNavigation.vue'
import ApplicationSettings from '../components/settings/ApplicationSettings.vue'
import SupervisorsList from '../components/settings/SupervisorsList.vue'
import PortersList from '../components/settings/PortersList.vue'
import BuildingsLocations from '../components/settings/BuildingsLocations.vue'
import JobCategories from '../components/settings/JobCategories.vue'

// Router injection
const navigate = inject<(route: string, params?: RouteParams) => void>('navigate')
</script>

<style scoped>
.settings-view {
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
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .settings-view {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
