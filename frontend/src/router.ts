import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Dashboard from './views/Dashboard.vue'

// Routes
const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard },
]

// Router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router