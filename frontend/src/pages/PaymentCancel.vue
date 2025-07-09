<template>
  <div class="payment-result container">
    <h2>Payment canceled.</h2>
    <RouterLink to="/" class="btn btn-primary">Return Home</RouterLink>
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