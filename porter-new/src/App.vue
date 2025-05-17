<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">Porter Task Manager</h1>
      <div class="network-status">
        <!-- Network status indicator will go here -->
      </div>
    </header>
    
    <Navigation />
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from './components/common/Navigation.vue'
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #0066cc;
  color: white;
}

.app-title {
  font-size: 1.5rem;
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
