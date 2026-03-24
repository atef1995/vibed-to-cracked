import Stripe from "stripe";
import {
  SubscriptionService,
  Plan,
  SubscriptionStatus,
} from "@/lib/subscriptionService";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/services/emailService";
import { devMode } from "./services/envService";
import { OrderStatus } from "@/generated/client";
import { ShippingAddress } from "@stripe/stripe-js";

// Type for Stripe Invoice parent with subscription details
interface InvoiceParentWithSubscription {
  type: string;
  subscription_details?: {
    subscription: string;
    metadata?: Record<string, string>;
  };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const debugMode = devMode();

/**
 * Service for handling Stripe webhook events
 */
export class WebhookService {
  /**
   * Handle checkout.session.completed event
   */
  static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing checkout session completed:", session.id);
        console.log("Session data:", {
          customer: session.customer,
          metadata: session.metadata,
          paymentStatus: session.payment_status,
          subscriptionId: session.subscription,
        });
      }

      // Check if this is a store order
      if (session.metadata?.type === "store_order") {
        return await this.handleStoreOrderCheckout(session);
      }

      // Handle subscription checkout (existing logic)
      if (!session.customer || !session.metadata?.userId) {
        if (debugMode) {
          console.error("Missing customer or userId in session metadata:", {
            hasCustomer: !!session.customer,
            metadata: session.metadata,
          });
        }
        return;
      }

      const userId = session.metadata.userId;
      const plan = session.metadata.plan as Plan;
      if (debugMode) {
        console.log(`Processing payment for user ${userId}, plan ${plan}`);
      }
      // Update payment record
      const payment = await prisma.payment.findFirst({
        where: { stripeSessionId: session.id },
      });

      if (payment) {
        if (debugMode) {
          console.log("Updating payment record:", payment.id);
        }
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "COMPLETED" },
        });
      } else {
        console.warn("No payment record found for session:", session.id);
      }

      // If there's a subscription, it will be handled by subscription.created event
      // But we can also check subscription status here for immediate updates
      if (session.subscription) {
        if (debugMode) {
          console.log(
            "Session has subscription, will be handled by subscription events"
          );
        }
      }

      // Send payment confirmation email
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          if (debugMode) {
            console.log("Sending payment confirmation email to user");
          }
          await emailService.sendPaymentConfirmationEmail(user, {
            plan: plan,
            amount: 0, // Will be updated by invoice payment handler
            currency: "usd",
            subscriptionStatus: "COMPLETED",
            subscriptionEndsAt: undefined,
            isTrialActive: false,
          });
          if (debugMode) {
            console.log(" Payment confirmation email sent successfully");
          }
        }
      } catch (emailError) {
        console.error(
          "Failed to send payment confirmation email:",
          emailError
        );
        // Don't throw - email failure shouldn't break webhook processing
      }

      Checkout completed for user ${userId}, plan ${plan}`);
    } catch (error) {
      console.error("Error handling checkout session completed:", error);
      throw error;
    }
  }

  /**
   * Handle store order checkout completion
   */
  static async handleStoreOrderCheckout(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing store order checkout:", session.id);
      }

      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;
      const guestEmail = session.metadata?.guestEmail;

      if (!orderId) {
        console.error("Missing orderId in session metadata");
        return;
      }

      if (!userId && !guestEmail) {
        console.error(
          "Missing both userId and guestEmail in session metadata"
        );
        return;
      }

      // Import store services dynamically to avoid circular dependencies
      const { getOrderById, updateOrderStatus, fulfillOrder } =
        await import("@/lib/services/storeService");
      const { clearCart } = await import("@/lib/services/cartService");

      // Get order details
      const order = await getOrderById(orderId);

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }

      // Extract shipping address from session
      const sessionWithShipping = session as Stripe.Checkout.Session & {
        shipping_details?: {
          name?: string;
          address?: Stripe.Address;
        };
      };
      const shippingAddress = sessionWithShipping.shipping_details?.address
        ? {
            name: sessionWithShipping.shipping_details.name,
            line1: sessionWithShipping.shipping_details.address.line1,
            line2: sessionWithShipping.shipping_details.address.line2,
            city: sessionWithShipping.shipping_details.address.city,
            state: sessionWithShipping.shipping_details.address.state,
            postal_code:
              sessionWithShipping.shipping_details.address.postal_code,
            country: sessionWithShipping.shipping_details.address.country,
          }
        : null;

      // Update order with payment info and shipping address
      await updateOrderStatus(orderId, OrderStatus.PAID, {
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        shippingAddress,
        phone: sessionWithShipping.customer_details?.phone,
        completedAt: new Date().toISOString(),
      });

      // Fulfill order (decrement stock)
      const fulfillResult = await fulfillOrder(orderId);

      if (!fulfillResult.success) {
        console.error(
          `Failed to fulfill order ${orderId}:`,
          fulfillResult.error
        );
      }

      // Clear cart (works for both authenticated and anonymous)
      if (userId) {
        await clearCart(userId);
      }

      // Award XP only for authenticated users
      if (userId) {
        const { awardXP } = await import("@/lib/services/xpService");

        const previousOrders = await prisma.order.count({
          where: {
            userId,
            status: OrderStatus.PAID,
            id: { not: orderId },
          },
        });

        if (previousOrders === 0) {
          // First purchase bonus
          await awardXP(userId, 50, "FIRST_PURCHASE", {
            orderId,
            total: order.total,
          });
          if (debugMode) {
            console.log(`Awarded first purchase bonus to user ${userId}`);
          }
        } else {
          // Regular purchase
          await awardXP(userId, 25, "PURCHASE", {
            orderId,
            total: order.total,
          });
        }
      } else {
        if (debugMode) {
          console.log(
            `Guest order completed (no XP awarded): ${guestEmail}`
          );
        }
      }

      // Send order confirmation email
      const email = userId ? order.user?.email : guestEmail;
      const customerName = userId ? order.user?.name : null;
      if (email) {
        try {
          // Transform order data for email service
          const emailOrderData = {
            id: order.id,
            total: order.total,
            currency: order.currency,
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress as ShippingAddress,
            items: order.items.map((item) => ({
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              product: {
                name: item.product.name,
                slug: item.product.slug,
                images: item.product.images as string[] | null,
              },
            })),
          };

          await emailService.sendOrderConfirmationEmail(
            email,
            emailOrderData,
            customerName || undefined
          );
          if (debugMode) {
            console.log(`Order confirmation email sent to ${email}`);
          }
        } catch (emailError) {
          console.error("Failed to send order confirmation email:", emailError);
          // Don't throw - email failure shouldn't stop order processing
        }
      }

      if (debugMode) {
        console.log(`Store order ${orderId} processed successfully`);
      }
    } catch (error) {
      console.error("Error handling store order checkout:", error);
      throw error;
    }
  }

  /**
   * Handle customer.subscription.created event
   */
  static async handleSubscriptionCreated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing subscription created:", subscription.id);
        console.log("Subscription data:", {
          customerId: subscription.customer,
          status: subscription.status,
          metadata: subscription.metadata,
          priceId: subscription.items.data[0]?.price.id,
        });
      }
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        console.error("Customer is deleted");
        return;
      }
      if (debugMode) {
        console.log("Customer data:", {
          id: customer.id,
          metadata: customer.metadata,
        });
      }
      const userId = customer.metadata?.userId;
      if (!userId) {
        if (debugMode) {
          console.error(
            "No userId found in customer metadata:",
            customer.metadata
          );
        }
        return;
      }

      // Get plan from subscription metadata or price
      let plan: Plan = Plan.VIBED;
      if (subscription.metadata?.plan) {
        plan = subscription.metadata.plan as Plan;
      } else {
        // Determine plan from price ID
        const priceId = subscription.items.data[0]?.price.id;
        if (
          priceId === process.env.STRIPE_CRACKED_PRICE_ID ||
          priceId === process.env.STRIPE_CRACKED_ANNUAL_PRICE_ID
        ) {
          plan = Plan.CRACKED;
        } else if (
          priceId === process.env.STRIPE_VIBED_PRICE_ID ||
          priceId === process.env.STRIPE_VIBED_ANNUAL_PRICE_ID
        ) {
          plan = Plan.VIBED;
        }
      }

      // Get billing cycle dates from subscription
      const billingCycleAnchor = subscription.billing_cycle_anchor;
      const subscriptionItem = subscription.items.data[0];

      // Calculate subscription end date from subscription item
      const subscriptionEndsAt = new Date(
        subscriptionItem.current_period_end * 1000
      );
      const subscriptionStartsAt = new Date(
        subscriptionItem.current_period_start * 1000
      );
      if (debugMode) {
        console.log("Subscription dates:", {
          billing_cycle_anchor: billingCycleAnchor,
          item_current_period_end: subscriptionItem.current_period_end,
          item_current_period_start: subscriptionItem.current_period_start,
          subscriptionEndsAt: subscriptionEndsAt.toISOString(),
          subscriptionStartsAt: subscriptionStartsAt.toISOString(),
          isValidEndDate: !isNaN(subscriptionEndsAt.getTime()),
          isValidStartDate: !isNaN(subscriptionStartsAt.getTime()),
        });
      }
      // Validate dates before updating
      if (
        isNaN(subscriptionEndsAt.getTime()) ||
        isNaN(subscriptionStartsAt.getTime())
      ) {
        console.error(
          "Invalid subscription dates, cannot update subscription"
        );
        return;
      }

      if (debugMode) {
        console.log(
          `Updating user subscription: userId=${userId}, plan=${plan}, endsAt=${subscriptionEndsAt.toISOString()}`
        );
      }
      // Determine if this is a trial subscription
      const isTrialSubscription = subscription.status === "trialing";
      const subscriptionStatus = isTrialSubscription
        ? SubscriptionStatus.TRIAL
        : SubscriptionStatus.ACTIVE;
      if (debugMode) {
        console.log(`Subscription details:`, {
          stripeStatus: subscription.status,
          isTrialing: isTrialSubscription,
          trialEnd: subscription.trial_end,
          ourStatus: subscriptionStatus,
        });
      }
      // Update user subscription
      await SubscriptionService.updateUserSubscription(
        userId,
        plan,
        subscriptionStatus,
        subscriptionEndsAt
      );

      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: subscriptionStatus,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          currentPeriodStart: subscriptionStartsAt,
          currentPeriodEnd: subscriptionEndsAt,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        },
      });

      // Send payment confirmation email with full subscription details
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          if (debugMode) {
            console.log("Sending subscription confirmation email to user");
          }
          // Get subscription price from Stripe
          const priceId = subscription.items.data[0]?.price.id;
          let amount = 0;

          if (priceId) {
            try {
              const price = await stripe.prices.retrieve(priceId);
              amount = price.unit_amount || 0;
            } catch (priceError) {
              if (debugMode) {
                console.warn(
                  "Could not retrieve price information:",
                  priceError
                );
              }
            }
          }

          await emailService.sendPaymentConfirmationEmail(user, {
            plan: plan,
            amount: amount,
            currency: subscription.currency || "usd",
            subscriptionStatus: subscriptionStatus,
            subscriptionEndsAt: subscriptionEndsAt,
            isTrialActive: isTrialSubscription,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : undefined,
          });
          console.log(" Subscription confirmation email sent successfully");
        }
      } catch (emailError) {
        if (debugMode) {
          console.error(
            "Failed to send subscription confirmation email:",
            emailError
          );
        }
        // Don't throw - email failure shouldn't break webhook processing
      }
      if (debugMode) {
        Subscription created for user ${userId}, plan ${plan}`);
      }
    } catch (error) {
      console.error("Error handling subscription created:", error);
      throw error;
    }
  }

  /**
   * Handle customer.subscription.updated event
   */
  static async handleSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing subscription updated:", subscription.id);
      }
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        console.error("Customer is deleted");
        return;
      }

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("No userId found in customer metadata");
        return;
      }

      // Determine new status
      let status: SubscriptionStatus;
      if (subscription.status === "active") {
        status = SubscriptionStatus.ACTIVE;
      } else if (subscription.status === "trialing") {
        status = SubscriptionStatus.TRIAL;
      } else if (subscription.status === "canceled") {
        status = SubscriptionStatus.CANCELLED;
      } else if (
        subscription.status === "past_due" ||
        subscription.status === "unpaid"
      ) {
        status = SubscriptionStatus.EXPIRED;
      } else {
        status = SubscriptionStatus.INACTIVE;
      }

      if (debugMode) {
        console.log(`Status update:`, {
          stripeStatus: subscription.status,
          ourStatus: status,
          isTrialTransition:
            subscription.status === "active" &&
            status === SubscriptionStatus.ACTIVE,
        });
      }
      // Get plan from subscription metadata or price
      let plan: Plan = Plan.VIBED;
      if (subscription.metadata?.plan) {
        plan = subscription.metadata.plan as Plan;
      } else {
        const priceId = subscription.items.data[0]?.price.id;
        if (
          priceId === process.env.STRIPE_CRACKED_PRICE_ID ||
          priceId === process.env.STRIPE_CRACKED_ANNUAL_PRICE_ID
        ) {
          plan = Plan.CRACKED;
        } else if (
          priceId === process.env.STRIPE_VIBED_PRICE_ID ||
          priceId === process.env.STRIPE_VIBED_ANNUAL_PRICE_ID
        ) {
          plan = Plan.VIBED;
        }
      }

      // Get dates from subscription item
      const subscriptionItem = subscription.items.data[0];
      const subscriptionEndsAt = new Date(
        subscriptionItem.current_period_end * 1000
      );
      const subscriptionStartsAt = new Date(
        subscriptionItem.current_period_start * 1000
      );

      // Validate dates
      if (
        isNaN(subscriptionEndsAt.getTime()) ||
        isNaN(subscriptionStartsAt.getTime())
      ) {
        console.error("Invalid subscription dates in update, skipping");
        return;
      }

      // Update user subscription
      // Allow premium access during trials and active subscriptions
      const userPlan =
        status === SubscriptionStatus.ACTIVE ||
        status === SubscriptionStatus.TRIAL
          ? plan
          : Plan.FREE;

      await SubscriptionService.updateUserSubscription(
        userId,
        userPlan,
        status,
        subscriptionEndsAt
      );

      // Update subscription record
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status,
          currentPeriodStart: subscriptionStartsAt,
          currentPeriodEnd: subscriptionEndsAt,
          stripePriceId: subscription.items.data[0]?.price.id,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        },
      });

      if (debugMode) {
        console.log(
          ` Subscription updated for user ${userId}, status ${status}`
        );
      }
    } catch (error) {
      console.error("Error handling subscription updated:", error);
      throw error;
    }
  }

  /**
   * Handle customer.subscription.deleted event
   */
  static async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing subscription deleted:", subscription.id);
      }
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        console.error("Customer is deleted");
        return;
      }

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("No userId found in customer metadata");
        return;
      }

      // Use canceled_at timestamp or current date
      const canceledAt = subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : new Date();

      if (debugMode) {
        console.log("Cancellation date:", {
          canceled_at: subscription.canceled_at,
          canceledAtDate: canceledAt.toISOString(),
        });
      }
      // Update user to free plan
      await SubscriptionService.updateUserSubscription(
        userId,
        Plan.FREE,
        SubscriptionStatus.CANCELLED,
        canceledAt
      );

      // Update subscription record
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelAtPeriodEnd: false, // No longer relevant when cancelled
        },
      });

      if (debugMode) {
        Subscription deleted for user ${userId}`);
      }
    } catch (error) {
      console.error("Error handling subscription deleted:", error);
      throw error;
    }
  }

  /**
   * Handle invoice.payment_succeeded event
   */
  static async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing invoice payment succeeded:", invoice.id);
      }
      // Check for subscription ID in the correct location
      const invoiceParent = invoice.parent as InvoiceParentWithSubscription;
      const subscriptionId = invoiceParent?.subscription_details?.subscription;

      if (debugMode) {
        console.log("Invoice parent data:", {
          parentType: invoiceParent?.type,
          hasSubscriptionDetails: !!invoiceParent?.subscription_details,
          subscriptionId: subscriptionId,
        });
      }
      if (!subscriptionId) {
        if (debugMode) {
          console.log("⏭Skipping non-subscription invoice");
        }
        return; // Skip non-subscription invoices
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        console.error("Customer is deleted");
        return;
      }

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("No userId found in customer metadata");
        return;
      }

      // Record successful payment
      await prisma.payment.create({
        data: {
          userId,
          plan: subscription.metadata?.plan || "VIBED",
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "COMPLETED",
        },
      });

      if (debugMode) {
        console.log(
          ` Invoice payment succeeded for user ${userId}, amount ${invoice.amount_paid}`
        );
      }
    } catch (error) {
      console.error("Error handling invoice payment succeeded:", error);
      throw error;
    }
  }

  /**
   * Handle invoice.payment_failed event
   */
  static async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing invoice payment failed:", invoice.id);
      }
      // Check for subscription ID in the correct location
      const invoiceParent = invoice.parent as InvoiceParentWithSubscription;
      const subscriptionId = invoiceParent?.subscription_details?.subscription;

      if (debugMode) {
        console.log("Invoice parent data (failed):", {
          parentType: invoiceParent?.type,
          hasSubscriptionDetails: !!invoiceParent?.subscription_details,
          subscriptionId: subscriptionId,
        });
      }
      if (!subscriptionId) {
        if (debugMode) {
          console.log("⏭Skipping non-subscription invoice");
        }
        return; // Skip non-subscription invoices
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        console.error("Customer is deleted");
        return;
      }

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("No userId found in customer metadata");
        return;
      }

      // Record failed payment
      await prisma.payment.create({
        data: {
          userId,
          plan: subscription.metadata?.plan || "VIBED",
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: "FAILED",
        },
      });

      // #TODO: Send email notification about failed payment
      // #TODO: Implement dunning management

      if (debugMode) {
        console.log(
          ` Invoice payment failed for user ${userId}, amount ${invoice.amount_due}`
        );
      }
    } catch (error) {
      console.error("Error handling invoice payment failed:", error);
      throw error;
    }
  }

  /**
   * Handle customer.subscription.trial_will_end event
   */
  static async handleTrialWillEnd(
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      if (debugMode) {
        console.log("Processing trial will end:", subscription.id);
      }
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        console.error("Customer is deleted");
        return;
      }

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("No userId found in customer metadata");
        return;
      }

      // Get trial end date
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;

      if (debugMode) {
        console.log("Trial ending soon:", {
          userId,
          trialEnd: trialEnd?.toISOString(),
          subscriptionId: subscription.id,
        });
      }
      // TODO: Send email notification about trial ending
      // You could implement email service here to notify user
      // Example: await EmailService.sendTrialEndingNotification(userId, trialEnd);

      if (debugMode) {
        console.log(
          ` Trial will end notification processed for user ${userId}`
        );
      }
    } catch (error) {
      console.error("Error handling trial will end:", error);
      throw error;
    }
  }
}
