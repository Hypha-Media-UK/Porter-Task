<template>
  <section class="settings-section">
    <h2>Job Categories</h2>
    
    <div class="setting-group">
      <div class="job-categories">
        <div v-for="(items, category) in typedJobCategories" :key="category" class="category-section">
          <div class="category-header">
            <div class="category-info">
              <span v-if="editingCategory !== category" class="category-name">{{ category }}</span>
              <input 
                v-else
                type="text" 
                v-model="editedCategoryName" 
                @keyup.enter="confirmEditCategory(category)"
                @keyup.esc="cancelEditCategory"
                ref="categoryEditInput"
                class="edit-input"
              >
            </div>
            <div class="category-actions">
              <button 
                v-if="editingCategory !== category"
                class="btn-icon location-defaults" 
                @click="showDefaultLocations(category)"
                aria-label="Set default locations"
                title="Set default locations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </button>
              <button 
                v-if="editingCategory !== category"
                class="btn-icon" 
                @click="startEditCategory(category)"
                aria-label="Edit category"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                v-if="editingCategory === category"
                class="btn-icon" 
                @click="confirmEditCategory(category)"
                aria-label="Save category"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </button>
              <button 
                v-if="editingCategory === category"
                class="btn-icon" 
                @click="cancelEditCategory"
                aria-label="Cancel edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button 
                v-if="editingCategory !== category"
                class="btn-icon" 
                @click="addItemType(category)"
                aria-label="Add item type"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button 
                v-if="editingCategory !== category"
                class="btn-icon" 
                @click="removeCategory(category)"
                aria-label="Remove category"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <ul class="item-list">
            <li v-for="(item, index) in items" :key="index" class="item">
              <div class="item-info">
                <span v-if="editingItemType !== item || editingItemCategory !== category">{{ item }}</span>
                <input 
                  v-else
                  type="text" 
                  v-model="editedItemTypeName" 
                  @keyup.enter="confirmEditItemType(category, item)"
                  @keyup.esc="cancelEditItemType"
                  ref="itemTypeEditInput"
                  class="edit-input"
                >
              </div>
              <div class="item-actions">
                <button 
                  v-if="editingItemType !== item || editingItemCategory !== category"
                  class="btn-icon sm" 
                  @click="startEditItemType(category, item)"
                  aria-label="Edit item type"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  v-if="editingItemType === item && editingItemCategory === category"
                  class="btn-icon sm" 
                  @click="confirmEditItemType(category, item)"
                  aria-label="Save item type"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </button>
                <button 
                  v-if="editingItemType === item && editingItemCategory === category"
                  class="btn-icon sm" 
                  @click="cancelEditItemType"
                  aria-label="Cancel edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button 
                  v-if="editingItemType !== item || editingItemCategory !== category"
                  class="btn-icon sm" 
                  @click="removeItemType(category, item)"
                  aria-label="Remove item type"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="add-category">
          <input 
            type="text" 
            v-model="newCategory" 
            placeholder="Enter new category name"
            @keyup.enter="addCategory"
          >
          <button 
            class="btn-primary" 
            @click="addCategory"
            :disabled="!newCategory.trim()"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Item Type Modal -->
    <div v-if="showAddItemModal" class="modal-backdrop" @click.self="showAddItemModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Item Type to {{ selectedCategory }}</h3>
        </div>
        
        <div class="modal-body">
          <input 
            type="text" 
            v-model="newItemType" 
            placeholder="Enter item type name"
            class="modal-input"
            ref="itemTypeInput"
          >
        </div>
        
        <div class="modal-actions">
          <button class="btn-secondary" @click="showAddItemModal = false">
            Cancel
          </button>
          <button 
            class="btn-primary" 
            @click="confirmAddItemType"
            :disabled="!newItemType.trim()"
          >
            Add
          </button>
        </div>
      </div>
    </div>
    
    <!-- Default Locations Modal -->
    <div v-if="showDefaultsModal" class="modal-backdrop" @click.self="showDefaultsModal = false">
      <div class="modal-content default-locations-modal">
        <CategoryDefaultLocations 
          :category="selectedCategory" 
          @close="showDefaultsModal = false" 
          @saved="onDefaultLocationsSaved"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import type { JobCategoriesMap } from '../../types'
import CategoryDefaultLocations from './CategoryDefaultLocations.vue'

// Store
const settingsStore = useSettingsStore()
const { jobCategories, updateSettings } = settingsStore

// Ensure jobCategories is properly typed
const typedJobCategories = computed(() => jobCategories as JobCategoriesMap)

// Modal state
const showAddItemModal = ref(false)
const showDefaultsModal = ref(false)
const selectedCategory = ref('')
const newItemType = ref('')
const itemTypeInput = ref<HTMLInputElement | null>(null)

// Local state for category management
const newCategory = ref('')
const editingCategory = ref<string | null>(null)
const editedCategoryName = ref('')
const categoryEditInput = ref<HTMLInputElement | null>(null)

// Item type editing state
const editingItemType = ref<string | number | null>(null)
const editingItemCategory = ref<string | null>(null)
const editedItemTypeName = ref('')
const itemTypeEditInput = ref<HTMLInputElement | null>(null)

// Category management
const addCategory = () => {
  const name = newCategory.value.trim()
  if (name && !(name in jobCategories)) {
    if (settingsStore.addCategory(name)) {
      newCategory.value = ''
    }
  }
}

const startEditCategory = (category: string) => {
  editingCategory.value = category
  editedCategoryName.value = category
  
  // Focus the input after render
  nextTick(() => {
    categoryEditInput.value?.focus()
  })
}

const confirmEditCategory = (oldName: string) => {
  const newName = editedCategoryName.value.trim()
  if (newName && settingsStore.updateCategory(oldName, newName)) {
    editingCategory.value = null
  }
}

const cancelEditCategory = () => {
  editingCategory.value = null
  editedCategoryName.value = ''
}

const removeCategory = (category: string) => {
  if (confirm(`Are you sure you want to remove category "${category}" and all its items?`)) {
    settingsStore.deleteCategory(category)
  }
}

// Item type management
const addItemType = (category: string) => {
  selectedCategory.value = category
  newItemType.value = ''
  showAddItemModal.value = true
  
  // Focus the input after the modal is shown
  nextTick(() => {
    itemTypeInput.value?.focus()
  })
}

const confirmAddItemType = () => {
  const name = newItemType.value.trim()
  const category = selectedCategory.value
  
  if (name && category && typeof jobCategories === 'object') {
    const categoryItems = (jobCategories as Record<string, string[]>)[category]
    if (Array.isArray(categoryItems) && !categoryItems.includes(name)) {
      categoryItems.push(name)
      updateSettings({ jobCategories })
    }
    
    showAddItemModal.value = false
    newItemType.value = ''
  }
}

// Item type editing
const startEditItemType = (category: string, item: string | number) => {
  editingItemCategory.value = category
  editingItemType.value = item
  editedItemTypeName.value = String(item)
  
  // Focus the input after render
  nextTick(() => {
    itemTypeEditInput.value?.focus()
  })
}

const confirmEditItemType = (category: string, oldItemName: string | number) => {
  const newName = editedItemTypeName.value.trim()
  if (newName && settingsStore.updateItemType(category, String(oldItemName), newName)) {
    editingItemType.value = null
    editingItemCategory.value = null
  }
}

const cancelEditItemType = () => {
  editingItemType.value = null
  editingItemCategory.value = null
  editedItemTypeName.value = ''
}

const removeItemType = (category: string, item: string | number) => {
  if (confirm(`Are you sure you want to remove item "${item}" from category "${category}"?`)) {
    settingsStore.deleteItemType(category, String(item))
  }
}

// Default Locations management
const showDefaultLocations = (category: string) => {
  selectedCategory.value = category
  showDefaultsModal.value = true
}

const onDefaultLocationsSaved = () => {
  // Can show a success notification or add additional logic if needed
  console.log(`Default locations for ${selectedCategory.value} saved`)
}
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

.job-categories {
  padding: var(--spacing-md);
}

.category-section {
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.category-header {
  background-color: var(--color-background);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-light);
}

.category-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.category-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.item-list {
  list-style: none;
  padding: var(--spacing-md);
  margin: 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  background-color: white;
}

.item-actions {
  display: flex;
  gap: 2px;
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
  padding: 2px;
}

.add-category {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.add-category input, .edit-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.edit-input {
  width: 100%;
}

.btn-primary {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}

.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background-color: var(--color-background-light);
  border-color: var(--color-border-dark);
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 400px;
}

.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.modal-header h3 {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
  font-size: var(--font-size-lg);
}

.modal-body {
  margin-bottom: var(--spacing-lg);
}

.modal-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
