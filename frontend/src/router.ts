import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Chores from './views/Chores.vue'
import DraftLobby from './views/DraftLobby.vue'

// Routes
const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard },
  { path: '/chores', component: Chores },
  { path: '/draft-lobby', component: DraftLobby },
]

// Router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router