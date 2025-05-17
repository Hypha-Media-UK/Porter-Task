import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Define routes
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Settings' }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../views/TasksView.vue'),
    meta: { title: 'Tasks' }
  },
  {
    path: '/task-form/:taskId?',
    name: 'taskForm',
    component: () => import('../views/TaskFormView.vue'),
    props: true,
    meta: { title: 'Task Form' }
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('../views/ArchiveView.vue'),
    meta: { title: 'Archive' }
  },
  {
    path: '/archive/:shiftId',
    name: 'shiftDetail',
    component: () => import('../views/ShiftDetailView.vue'),
    props: true,
    meta: { title: 'Shift Details' }
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Title handling
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = `${to.meta.title || 'Porter Task'} | Porter Task Manager`
  next()
})

export default router
