import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/middleware";
import bodyParser from "body-parser";

export const router = Router();

// stripe api version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// checkout session creation
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // if the user does not have a Stripe customer ID, create one and update the user
    let stripeCustomerId = user.stripeCustomerId || undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Copilot: Finish this checkout session creation using stripe
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) { // check if the price ID is set in the environment variables
      console.error("STRIPE_PRICE_ID environment variable is missing");
      res.status(500).json({ error: "Stripe price configuration missing" });
      return;
    }
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        (process.env.CLIENT_URL || "http://localhost:5173") +
        "/payments/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        (process.env.CLIENT_URL || "http://localhost:5173") +
        "/payments/cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
});

// webhook endpoint to handle Stripe events
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string | undefined; // get the signature from the headers

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig || "",
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": { // checkout session is completed
          const session = event.data.object as Stripe.Checkout.Session;
          const customerId = session.customer as string;
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionStatus: "active" },
            });
          }
          break;
        }
        case "customer.subscription.deleted": { // subscription is canceled
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionStatus: "canceled" },
            });
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error("Error handling webhook event:", err);
      res.status(500).send();
      return;
    }
    res.json({ received: true });
  }
);

// return the current subscription status for the logged in user
router.get("/subscription", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      res.json({ subscribed: false });
      return;
    }

    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    if (subs.data.length === 0) {
      res.json({ subscribed: false });
      return;
    }

    const sub = subs.data[0];
    res.json({
      id: sub.id,
      status: sub.status,
      current_period_end: (sub as any).current_period_end,
    });
  } catch (err) {
    console.error("Error fetching subscription:", err);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// cancel the user's active subscription
router.post("/subscription/cancel", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      res.status(400).json({ error: "No active subscription" });
      return;
    }

    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });
    if (subs.data.length === 0) {
      res.status(400).json({ error: "No active subscription" });
      return;
    }

    const sub = subs.data[0];
    await stripe.subscriptions.cancel(sub.id);
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "canceled" },
    });

    res.json({ canceled: true });
  } catch (err) {
    console.error("Error canceling subscription:", err);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// confirm a checkout session and update the user's subscription status
router.get("/confirm", async (req, res) => {
  try {
    const sessionId = req.query.session_id as string | undefined;
    if (!sessionId) {
      res.status(400).json({ error: "Missing session id" });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subId = session.subscription as string | undefined;
    if (!subId || session.payment_status !== "paid") {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    const subscription = (await stripe.subscriptions.retrieve(subId)) as any;
    const customerId = subscription.customer as string;
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: subscription.status },
      });
    }

    res.json({
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    });
  } catch (err) {
    console.error("Error confirming session:", err);
    res.status(500).json({ error: "Failed to confirm session" });
  }
});