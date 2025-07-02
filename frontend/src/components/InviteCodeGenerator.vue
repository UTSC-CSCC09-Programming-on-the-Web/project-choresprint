<template>
  <div>
    <button @click="generateInvite" :disabled="loading">
      Generate Invite Code
    </button>

    <div v-if="inviteCode">
      <p><strong>Invite Code:</strong> {{ inviteCode }}</p>
      <button @click="copyToClipboard">Copy Code</button>
    </div>

    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../api/index"; // Adjust the import path as necessary



const inviteCode = ref("");
const loading = ref(false);
const error = ref("");

const props = defineProps<{ houseId: number }>();

async function generateInvite() {
  loading.value = true;
  error.value = "";

  try {
    const data = await api.post(`/houses/${props.houseId}/invitations`);
    inviteCode.value = data.data.code;
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to create invite.";
  } finally {
    loading.value = false;
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(inviteCode.value);
}
</script>
