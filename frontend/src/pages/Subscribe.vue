<template>
  <div class="subscribe-page container">
    <h2>Subscribe to ChoreSprint</h2>
    <button class="btn btn-primary" @click="startCheckout" :disabled="loading">
      {{ loading ? "Redirecting..." : "Start Stripe Checkout" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePayment } from "../composables/usePayment";

const router = useRouter();
const {
  error,
  loading,
  isSubscribed,
  isAuthenticated,
  subscriptionRequired,
  startCheckout,
  fetchSubscriptionStatus,
} = usePayment();

// Check authentication and subscription status
onMounted(async () => {
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    router.push("/");
    return;
  }

  try {
    await fetchSubscriptionStatus();

    // If user is already subscribed or doesn't require subscription
    if (isSubscribed.value || !subscriptionRequired.value) {
      router.push("/dashboard");
    }
  } catch (error) {
    console.error("Failed to check subscription status:", error);
  }
});
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
