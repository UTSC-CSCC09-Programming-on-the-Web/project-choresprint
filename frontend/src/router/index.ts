import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Dashboard from "../pages/Dashboard.vue";
import EditChore from "../pages/EditChore.vue";
import Subscribe from "../pages/Subscribe.vue";
import PaymentSuccess from "../pages/PaymentSuccess.vue";
import PaymentCancel from "../pages/PaymentCancel.vue";
import { getAuthStatus } from "../lib/auth";
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
    path: "/subscribe",
    name: "Subscribe",
    component: Subscribe,
  },
  {
    path: "/payments/success",
    name: "PaymentSuccess",
    component: PaymentSuccess,
  },
  {
    path: "/payments/cancel",
    name: "PaymentCancel",
    component: PaymentCancel,
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

router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth) {
    const status = await getAuthStatus();
    if (!status.authed) return next("/");
    if (status.subscriptionRequired) return next("/subscribe");
  }
  if (to.name === "EditChore") {
    const auth = await getAuthStatus();
    if (!auth.authed || auth.subscriptionRequired) {
      return next("/");
    }
    const choreRes = await api.get(`/chores/${to.params.id}`);
    if (!choreRes) {
      return next({ name: "Dashboard" });
    }
    const houseRes = await api.get(`/houses/${choreRes.data.houseId}`);
    if (auth.user.id !== houseRes.data.createdById) {
      return next({ name: "Dashboard" });
    }
  }
  // If the route doesn't require auth or the user is authenticated, procee

  next();
});

export default router;
