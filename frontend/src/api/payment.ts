import { api } from ".";

interface PaymentApiService {
  startCheckout: () => Promise<any>;
  confirmPayment: (params: { session_id: string }) => Promise<any>;
  cancelSubscription: () => Promise<any>;
  getSubscriptionStatus: () => Promise<any>;
}

let paymentApiService: PaymentApiService = {} as PaymentApiService;

paymentApiService.startCheckout = async function () {
  try {
    const response = await api.post("/payments/checkout");
    return response.data;
  } catch (error) {
    console.error("Error starting checkout:", error);
    throw error;
  }
};

paymentApiService.confirmPayment = async function (params: {
  session_id: string;
}) {
  try {
    const response = await api.get("/payments/confirm", { params });
    return response.data;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

paymentApiService.cancelSubscription = async function () {
  try {
    const response = await api.post("/payments/subscription/cancel");
    return response.data;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

paymentApiService.getSubscriptionStatus = async function () {
  try {
    const response = await api.get("/payments/subscription");
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    throw error;
  }
};

export default paymentApiService;
