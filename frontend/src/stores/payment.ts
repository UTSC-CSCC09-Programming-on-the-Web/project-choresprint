import { defineStore } from "pinia";
import paymentApiService from "../api/payment";

export interface SubscriptionInfo {
  id: string;
  status: string;
  currentPeriodEnd?: string;
  subscribed?: boolean;
}

export const usePaymentStore = defineStore("payments", {
  state: () => ({
    subscription: null as SubscriptionInfo | null,
    loading: false,
    error: null as string | null,
    checkoutLoading: false,
    cancelLoading: false,
  }),

  getters: {
    isSubscribed: (state) => {
      return (
        state.subscription?.status === "active" ||
        state.subscription?.subscribed === true
      );
    },
    subscriptionStatus: (state) => state.subscription?.status || "inactive",
    hasActiveSubscription: (state) => {
      return state.subscription && state.subscription.status === "active";
    },
  },

  actions: {
    async fetchSubscriptionStatus() {
      this.loading = true;
      this.error = null;

      try {
        const data = await paymentApiService.getSubscriptionStatus();
        this.subscription = data.subscribed === false ? null : data;
        return this.subscription;
      } catch (error: any) {
        this.error = "Failed to load subscription.";
        this.subscription = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createCheckoutSession() {
      this.checkoutLoading = true;
      this.error = null;

      try {
        const data = await paymentApiService.startCheckout();

        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        }

        return data;
      } catch (error: any) {
        this.error = "Unable to start checkout.";
        this.checkoutLoading = false;
        throw error;
      }
    },

    async confirmPayment(sessionId: string) {
      this.loading = true;
      this.error = null;

      try {
        const data = await paymentApiService.confirmPayment({
          session_id: sessionId,
        });

        // Refresh subscription status after successful payment
        await this.fetchSubscriptionStatus();

        return data;
      } catch (error: any) {
        this.error = "Payment confirmation failed.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelSubscription() {
      if (!this.subscription) return false;

      this.cancelLoading = true;
      this.error = null;

      try {
        await paymentApiService.cancelSubscription();

        // Refresh subscription status after cancellation
        await this.fetchSubscriptionStatus();

        return true;
      } catch (error: any) {
        this.error = "Failed to cancel subscription.";
        throw error;
      } finally {
        this.cancelLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.subscription = null;
      this.loading = false;
      this.error = null;
      this.checkoutLoading = false;
      this.cancelLoading = false;
    },
  },
});
