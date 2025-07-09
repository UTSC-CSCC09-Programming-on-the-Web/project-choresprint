<template>
  <div class="manage-sub container">
    <div class="subscription-card card">
      <div class="card-header">
        <h2 class="card-title">Subscription Management</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="centered">
          <div class="loader"></div>
          <p class="loading-text">Loading subscription details...</p>
        </div>

        <div v-else-if="error" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
          <button @click="clearError" class="alert-close">&times;</button>
        </div>

        <div v-else>
          <div v-if="hasActiveSubscription" class="subscription-active">
            <div class="status-badge active">
              <span class="status-icon">✓</span>
              <span>Active Subscription</span>
            </div>
            
            <div class="subscription-details">
              <p><strong>Status:</strong> {{ subscriptionStatus }}</p>
              <p v-if="subscription?.id"><strong>ID:</strong> {{ subscription.id }}</p>
              <p v-if="subscription?.currentPeriodEnd">
                <strong>Next billing:</strong> {{ formatDate(subscription.currentPeriodEnd) }}
              </p>
            </div>

            <div class="subscription-actions">
              <button 
                class="btn btn-danger" 
                @click="handleCancelSubscription" 
                :disabled="cancelLoading"
              >
                <span v-if="cancelLoading" class="loader-inline"></span>
                <span v-else>Cancel Subscription</span>
              </button>
            </div>
          </div>

          <div v-else class="subscription-inactive">
            <div class="status-badge inactive">
              <span class="status-icon">⏸</span>
              <span>No Active Subscription</span>
            </div>
            
            <p class="inactive-message">
              You do not have an active subscription. Subscribe now to access all ChoreSprint features.
            </p>

            <div class="subscription-actions">
              <RouterLink to="/subscribe" class="btn btn-primary">
                Buy Subscription
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { usePayment } from '../composables/usePayment';

const { 
  subscription,
  hasActiveSubscription,
  subscriptionStatus,
  loading,
  cancelLoading,
  error,
  fetchSubscriptionStatus,
  cancelSubscription,
  clearError
} = usePayment();

onMounted(async () => {
  try {
    await fetchSubscriptionStatus();
  } catch (error) {
    // Error handled by store
    console.error('Failed to load subscription:', error);
  }
});

async function handleCancelSubscription() {
  try {
    await cancelSubscription();
    // Success feedback is handled by the store updating the state
  } catch (error) {
    // Error handled by store
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
</script>

<style scoped>
.manage-sub {
  padding: var(--spacing-xl) 0;
}

.subscription-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-title {
  color: var(--primary);
  margin-bottom: 0;
}

.centered {
  text-align: center;
}

.loading-text {
  color: var(--gray);
  margin-top: var(--spacing-md);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  font-weight: 500;
  margin-bottom: var(--spacing-lg);
}

.status-badge.active {
  background-color: var(--success-light);
  color: var(--success-dark);
}

.status-badge.inactive {
  background-color: var(--gray-light);
  color: var(--gray-dark);
}

.status-icon {
  font-size: 1.2em;
}

.subscription-details {
  background-color: var(--light);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.subscription-details p {
  margin-bottom: var(--spacing-sm);
  color: var(--text);
}

.subscription-details p:last-child {
  margin-bottom: 0;
}

.subscription-actions {
  text-align: center;
}

.inactive-message {
  color: var(--gray);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  line-height: 1.6;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: auto;
}

/* Keep your existing error styles */
.error {
  color: red;
}
</style>