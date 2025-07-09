import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '../stores/payment';
import { useUserStore } from '../stores/user';

export function usePayment() {
  const paymentStore = usePaymentStore();
  const userStore = useUserStore();
  const router = useRouter();

  // Computed properties
  const subscription = computed(() => paymentStore.subscription);
  const isSubscribed = computed(() => paymentStore.isSubscribed);
  const hasActiveSubscription = computed(() => paymentStore.hasActiveSubscription);
  const subscriptionStatus = computed(() => paymentStore.subscriptionStatus);
  const loading = computed(() => paymentStore.loading);
  const checkoutLoading = computed(() => paymentStore.checkoutLoading);
  const cancelLoading = computed(() => paymentStore.cancelLoading);
  const error = computed(() => paymentStore.error);

  // Actions
  async function startCheckout() {
    try {
      await paymentStore.createCheckoutSession();
      // Redirect happens in the store action
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  async function handlePaymentSuccess(sessionId: string) {
    try {
      await paymentStore.confirmPayment(sessionId);
      
      // Refresh user data to get updated subscription status
      await userStore.fetchCurrentUser();
      
      // Check if user is authenticated and doesn't require subscription
      if (userStore.isAuthenticated && !userStore.user?.subscriptionRequired) {
        router.push('/dashboard');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return false;
    }

    try {
      const result = await paymentStore.cancelSubscription();
      
      // Refresh user data after cancellation
      if (result) {
        await userStore.fetchCurrentUser();
      }
      
      return result;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw error;
    }
  }

  async function fetchSubscriptionStatus() {
    try {
      return await paymentStore.fetchSubscriptionStatus();
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      throw error;
    }
  }

  function clearError() {
    paymentStore.clearError();
  }

  return {
    // State
    subscription,
    isSubscribed,
    hasActiveSubscription,
    subscriptionStatus,
    loading,
    checkoutLoading,
    cancelLoading,
    error,

    // User state (for convenience)
    isAuthenticated: computed(() => userStore.isAuthenticated),
    subscriptionRequired: computed(() => userStore.user?.subscriptionRequired || false),

    // Actions
    startCheckout,
    handlePaymentSuccess,
    cancelSubscription,
    fetchSubscriptionStatus,
    clearError,
  };
}