<template>
  <div class="payment-result container">
    <h2>Payment successful!</h2>
    <RouterLink to="/dashboard" class="btn btn-primary">Go to Dashboard</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.payment-result {
  padding: 2rem;
  text-align: center;
}
</style>