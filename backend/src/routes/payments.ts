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
router.post("/checkout", authMiddleware, async (req: Request, res: Response) => {
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
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
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