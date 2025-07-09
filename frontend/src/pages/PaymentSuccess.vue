<template>
  <div class="payment-result container">
    <div class="result-card card">
      <div v-if="loading" class="card-body centered">
        <div class="loader"></div>
        <p class="loading-text">Processing your payment...</p>
      </div>

      <div v-else-if="error" class="card-body centered">
        <div class="error-icon">❌</div>
        <h2 class="error-title">Payment Processing Error</h2>
        <p class="error-message">{{ error }}</p>
        <div class="error-actions">
          <router-link to="/subscribe" class="btn btn-primary">
            Try Again
          </router-link>
          <router-link to="/dashboard" class="btn btn-outline">
            Back to Dashboard
          </router-link>
        </div>
      </div>

      <div v-else class="card-body centered">
        <div class="success-icon">✅</div>
        <h2 class="success-title">Payment Successful!</h2>
        <p class="success-message">
          Welcome to ChoreSprint Premium! Your subscription is now active.
        </p>

        <div class="success-actions">
          <router-link to="/dashboard" class="btn btn-primary btn-lg">
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { usePayment } from "../composables/usePayment";

const route = useRoute();
const { handlePaymentSuccess } = usePayment();

const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const sessionId = route.query.session_id as string | undefined;

  if (!sessionId) {
    error.value = "Missing payment session ID";
    loading.value = false;
    return;
  }

  try {
    const success = await handlePaymentSuccess(sessionId);

    if (!success) {
      // If handlePaymentSuccess doesn't redirect, show success page
      loading.value = false;
    }
    // If success is true, the composable will handle the redirect
  } catch (err: any) {
    error.value = err.message || "Failed to process payment";
    loading.value = false;
  }
});
</script>

<style scoped>
.payment-result {
  padding: var(--spacing-xl) 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  max-width: 600px;
  width: 100%;
}

.centered {
  text-align: center;
}

.loading-text {
  color: var(--gray);
  margin-top: var(--spacing-md);
}

.success-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.success-title,
.error-title {
  color: var(--primary);
  margin-bottom: var(--spacing-md);
}

.success-message,
.error-message {
  color: var(--gray);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.success-actions,
.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .success-actions,
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
