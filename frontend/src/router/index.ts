import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Dashboard from "../pages/Dashboard.vue";
import EditChore from "../pages/EditChore.vue";
import { isAuthenticated } from "../lib/auth";
import { api } from "../api";

const routes = [
  { path: "/", name: "Home", component: Home },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/chores/:id/edit",
    name: "EditChore",
    component: EditChore,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const authed = await isAuthenticated();
    if (!authed) return next("/");
  }
  if (to.name === "EditChore") {
    const userRes = await api.get("/auth/me");
    const choreRes = await api.get(`/chores/${to.params.id}`);
    if (!choreRes) {
      return next({ name: "Dashboard" });
    }
    const houseRes = await api.get(`/houses/${choreRes.data.houseId}`);
    if (userRes.data.id !== houseRes.data.createdById) {
      return next({ name: "Dashboard" });
    }
  }
  // If the route doesn't require auth or the user is authenticated, procee

  next();
});

export default router;
