<template>
  <form @submit.prevent="handleSubmit">
    <h2>Create a House</h2>
    <input v-model="name" placeholder="House name" required />
    <button type="submit">Create</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../api/index";
import { useRouter } from "vue-router";

const name = ref("");
const error = ref("");
const router = useRouter();

const handleSubmit = async () => {
  error.value = "";
  try {
    await api.post("/houses", { name: name.value });
    router.push(`/dashboard`); // or res.data.house.id if you want
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to create house.";
  }
};
</script>
