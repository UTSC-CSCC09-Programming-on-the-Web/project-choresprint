<template>
  <div class="payment-result container">
    <div v-if="loading" class="loader"></div>
    <div v-else>
      <h2>Payment successful!</h2>
      <RouterLink to="/dashboard" class="btn btn-primary">Go to Dashboard</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { api } from '../api'
import { getAuthStatus } from '../lib/auth'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

onMounted(async () => { // check if the user has a session ID in the URL
  const sessionId = route.query.session_id as string | undefined
  if (sessionId) {
    try {
      await api.get('/payments/confirm', { params: { session_id: sessionId } })
    } catch (e) {
      console.error(e)
    }
  }
  const status = await getAuthStatus()
  if (status.authed && !status.subscriptionRequired) {
    router.push('/dashboard')
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.payment-result {
  padding: 2rem;
  text-align: center;
}
</style>