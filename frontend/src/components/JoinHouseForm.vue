<template>
  <form @submit.prevent="handleSubmit">
    <h2>Join a House</h2>
    <input v-model="inviteCode" placeholder="Invite Code" required />
    <button type="submit">Join</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../api/index";
import { useRouter } from "vue-router";

const inviteCode = ref("");
const error = ref("");
const router = useRouter();

const handleSubmit = async () => {
  error.value = "";
  try {
    await api.post(`/houses/invitations/${inviteCode.value}/use`);
    
    // Refresh the page to update the user's house association
    window.location.reload();
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to join house.";
  }
};
</script>
