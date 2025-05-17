<template>
  <div class="not-found">
    <div class="not-found-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h1>Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist or has been moved.</p>
    <button class="btn-primary" @click="goHome">Go to Home</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60vh;
  padding: 2rem;
}

.not-found-icon {
  color: #6c757d;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 500px;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0055aa;
}
</style>
