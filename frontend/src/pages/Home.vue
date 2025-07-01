<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen text-center"
  >
    <h1 class="text-4xl font-bold mb-4">🏠 ChoreSprint</h1>

    <div v-if="loading" class="text-gray-600">Checking authentication...</div>

    <div v-else-if="user">
      <p class="mb-4">Welcome, {{ user.name }}!</p>
      <RouterLink
        to="/dashboard"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Go to Dashboard
      </RouterLink>
      <button
        @click="logout"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>

    <div v-else>
      <p class="mb-4">Split chores. Earn points. Keep your house happy.</p>
      <button
        @click="login"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Login with Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../api/index";

const user = ref<any | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get("/auth/me");
    user.value = res.data;
  } catch (err) {
    user.value = null;
  } finally {
    loading.value = false;
  }
});

const login = () => {
  window.location.href = "http://localhost:4000/api/auth/google"; // your backend login endpoint
};

const logout = async () => {
  try {
    await api.post("/auth/logout");
    user.value = null;
  } catch (err) {
    console.error("Logout failed", err);
  }
};
</script>
