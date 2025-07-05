<template>
  <div class="subscribe-page container">
    <h2>Subscribe to ChoreSprint</h2>
    <button class="btn btn-primary" @click="startCheckout" :disabled="loading">
      {{ loading ? 'Redirecting...' : 'Start Stripe Checkout' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../api'

const loading = ref(false)
const error = ref('')

async function startCheckout() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/payments/checkout')
    window.location.href = res.data.url
  } catch (e: any) {
    error.value = 'Unable to start checkout.'
    loading.value = false
  }
}
</script>

<style scoped>
.subscribe-page {
  padding: 2rem;
  text-align: center;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>