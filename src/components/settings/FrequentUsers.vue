<template>
  <section class="settings-section">
    <h2>Frequent Users</h2>
    
    <div class="setting-group">
      <div class="frequent-users">
        <div v-if="frequentLocations.length === 0" class="empty-state">
          <p>No frequent locations added yet.</p>
          <p class="hint">To add frequent locations, mark departments as "Frequent" in the Buildings &amp; Locations section.</p>
        </div>
        
        <div v-else class="frequent-list">
          <div 
            v-for="element in frequentLocations" 
            :key="element.id"
            class="frequent-item"
          >
            <div class="drag-handle">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <div class="location-info">
              <div class="location-name">{{ element.name }}</div>
              <div class="location-building">{{ getBuildingName(element.buildingId) }}</div>
            </div>
            <div class="location-actions">
              <button
                class="btn-icon sm"
                @click="removeFromFrequent(element)"
                aria-label="Remove from frequent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '../../stores/settings'

// Store
const settingsStore = useSettingsStore()
const buildings = computed(() => settingsStore.buildings)

// Type for a location with building ID
interface ExtendedLocationItem {
  id: string;
  name: string;
  frequent?: boolean;
  buildingId: string;
  locationType: 'department' | 'ward';
  order?: number;
}

// Get all frequent locations from all buildings
const frequentLocations = ref<ExtendedLocationItem[]>([])

// Load frequent locations
const loadFrequentLocations = () => {
  const allFrequent: ExtendedLocationItem[] = []
  
  buildings.value.forEach(building => {
    // Add departments marked as frequent
    building.departments.forEach(dept => {
      if (dept.frequent) {
        allFrequent.push({
          ...dept,
          buildingId: building.id,
          locationType: 'department',
          order: dept.order || 999 // Default high number for unordered items
        })
      }
    })
    
    // Add wards marked as frequent
    building.wards.forEach(ward => {
      if (ward.frequent) {
        allFrequent.push({
          ...ward,
          buildingId: building.id,
          locationType: 'ward',
          order: ward.order || 999 // Default high number for unordered items
        })
      }
    })
  })
  
  // Sort by order value if available
  frequentLocations.value = allFrequent.sort((a, b) => (a.order || 999) - (b.order || 999))
}

// Get building name for display
const getBuildingName = (buildingId: string): string => {
  const building = buildings.value.find(b => b.id === buildingId)
  return building ? building.name : 'Unknown Building'
}

// Remove location from frequent list
const removeFromFrequent = (location: ExtendedLocationItem) => {
  // Find the building
  const building = buildings.value.find(b => b.id === location.buildingId)
  if (!building) return
  
  // Find the location in the building's appropriate collection
  if (location.locationType === 'department') {
    const dept = building.departments.find(d => d.id === location.id)
    if (dept) {
      dept.frequent = false
      // Save changes
      settingsStore.saveLocationDataToFile()
      // Reload the frequent locations list
      loadFrequentLocations()
    }
  } else {
    const ward = building.wards.find(w => w.id === location.id)
    if (ward) {
      ward.frequent = false
      // Save changes
      settingsStore.saveLocationDataToFile()
      // Reload the frequent locations list
      loadFrequentLocations()
    }
  }
}

// Watch for changes in buildings and reload frequent locations
watch(() => buildings.value, () => {
  loadFrequentLocations()
}, { deep: true })

// Initialize on mount
onMounted(() => {
  loadFrequentLocations()
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
  padding: var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--color-text-light);
}

.hint {
  font-size: var(--font-size-sm);
  font-style: italic;
  margin-top: var(--spacing-sm);
}

.frequent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.frequent-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  background-color: white;
}

.drag-handle {
  color: var(--color-text-light);
  margin-right: var(--spacing-sm);
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: var(--font-weight-medium);
}

.location-building {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.location-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-danger);
}

.btn-icon.sm {
  padding: 4px;
}
</style>
