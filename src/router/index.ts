import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Define routes
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../views/TasksView.vue')
  },
  {
    path: '/tasks/pending',
    name: 'pendingTasks',
    component: () => import('../views/PendingTasksView.vue')
  },
  {
    path: '/tasks/completed',
    name: 'completedTasks',
    component: () => import('../views/CompletedTasksView.vue')
  },
  {
    path: '/tasks/form',
    name: 'taskForm',
    component: () => import('../views/TaskFormView.vue'),
    props: (route) => ({ taskId: route.query.taskId as string })
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('../views/ArchiveView.vue')
  },
  {
    path: '/archive/:shiftId',
    name: 'shiftDetail',
    component: () => import('../views/ShiftDetailView.vue'),
    props: true
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue')
  }
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when changing routes
    return { top: 0 }
  }
})

export default router
