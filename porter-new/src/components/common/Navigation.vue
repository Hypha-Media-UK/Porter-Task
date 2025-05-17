<template>
  <nav class="main-nav">
    <router-link to="/" class="nav-link">Home</router-link>
    <router-link to="/tasks" class="nav-link">Tasks</router-link>
    <router-link to="/settings" class="nav-link">Settings</router-link>
    <router-link to="/archive" class="nav-link">Archive</router-link>
  </nav>
</template>

<script setup lang="ts">
// No additional setup needed
</script>

<style scoped>
.main-nav {
  display: flex;
  background-color: #004a99;
  padding: 0.25rem 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 16px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: white;
  font-weight: 500;
  border-bottom: 2px solid white;
}
</style>
