/**
 * Store Service
 *
 * Handles all store-related operations including:
 * - Product management and queries
 * - Order creation and management
 * - Stripe product synchronization
 * - Order fulfillment
 */

import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import {
  ProductType,
  OrderStatus,
  Product,
  Order,
  Prisma,
} from "@/generated/client";
import { devMode } from "./envService";

const debugMode = devMode();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover" as unknown as "2026-01-28.clover",
});

const showcaseImages = [
  "https://i.ibb.co/93Cj1jJV/20260215-142757.jpg",
  "https://i.ibb.co/3Gqqv3n/20260215-142829.jpg",
  "https://i.ibb.co/LzcY4mCD/20260215-143015.jpg",
  "https://i.ibb.co/990z5Pz8/20260215-143132.jpg",
]
  .map((url) => url.trim())
  .filter(Boolean);

export interface ProductFilters {
  type?: ProductType;
  published?: boolean;
  inStock?: boolean;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductQueryResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrderQueryResult {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrderCreateParams {
  userId?: string; // Optional for guest checkout
  guestEmail?: string; // Email for guest orders
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress?: Prisma.JsonValue;
  metadata?: Prisma.JsonValue;
}

/**
 * Get paginated and filtered products
 */
export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = {}
): Promise<ProductQueryResult> {
  try {
    const { type, published = true, inStock = true, search } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (type) {
      where.type = type;
    }

    if (inStock) {
      where.OR = [{ stock: { gt: 0 } }, { stock: null }]; // null means unlimited
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return null;
    }

    return product;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Sync products from Stripe to database
 */
export async function syncProductsFromStripe(): Promise<{
  synced: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // Fetch all active products from Stripe
    const stripeProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });

    for (const stripeProduct of stripeProducts.data) {
      try {
        // Get the default price for this product
        const prices = await stripe.prices.list({
          product: stripeProduct.id,
          active: true,
          limit: 1,
        });

        const defaultPrice = prices.data[0];

        if (!defaultPrice) {
          errors.push(`No active price found for product ${stripeProduct.id}`);
          continue;
        }

        // Extract metadata
        const productType =
          stripeProduct.metadata?.type === "DIGITAL"
            ? ProductType.DIGITAL
            : ProductType.PHYSICAL;
        const stock = 50;

        // Generate slug from name
        const slug =
          stripeProduct.metadata?.slug ||
          stripeProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const productImages =
          showcaseImages.length > 0
            ? showcaseImages
            : stripeProduct.images || [];

        // Upsert product in database
        await prisma.product.upsert({
          where: { stripeProductId: stripeProduct.id },
          update: {
            name: stripeProduct.name,
            description: stripeProduct.description || "",
            price: (defaultPrice.unit_amount || 0) / 100,
            currency: defaultPrice.currency,
            images: productImages,
            type: productType,
            published: stripeProduct.active,
            stock,
            stripePriceId: defaultPrice.id,
            metadata: stripeProduct.metadata,
          },
          create: {
            slug,
            name: stripeProduct.name,
            description: stripeProduct.description || "",
            price: (defaultPrice.unit_amount || 0) / 100,
            currency: defaultPrice.currency,
            images: productImages,
            type: productType,
            published: stripeProduct.active,
            stock,
            stripeProductId: stripeProduct.id,
            stripePriceId: defaultPrice.id,
            metadata: stripeProduct.metadata,
          },
        });

        synced++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to sync product ${stripeProduct.id}: ${message}`);
      }
    }

    if (debugMode) {
      console.log(`Synced ${synced} products from Stripe`);
      if (errors.length > 0) {
        console.error("Sync errors:", errors);
      }
    }

    return { synced, errors };
  } catch (error) {
    console.error("Error syncing products from Stripe:", error);
    throw new Error("Failed to sync products from Stripe");
  }
}

/**
 * Create a new order
 */
export async function createOrder(
  params: OrderCreateParams
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const { userId, guestEmail, items, shippingAddress, metadata } = params;

    // Validate products and check stock
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return {
        success: false,
        error: "Some products not found",
      };
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p: Product) => p.id === item.productId);
      if (!product) {
        return {
          success: false,
          error: `Product ${item.productId} not found`,
        };
      }

      if (product.stock !== null && product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}`,
        };
      }
    }

    // Calculate total
    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p: Product) => p.id === item.productId)!;
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      };
    });

    // Create order with items in a transaction
    const order = await prisma.order.create({
      data: {
        userId: userId || undefined,
        guestEmail: guestEmail || undefined,
        total,
        currency: "usd", // Default currency
        status: OrderStatus.PENDING,
        shippingAddress: shippingAddress as Prisma.InputJsonValue,
        metadata: metadata as Prisma.InputJsonValue,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (debugMode) {
      console.log(
        `Created order ${order.id} for ${userId ? `user ${userId}` : `guest ${guestEmail}`}`
      );
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Failed to create order",
    };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  metadata?: Prisma.JsonValue
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        metadata: metadata || undefined,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (debugMode) {
      console.log(`Updated order ${orderId} status to ${status}`);
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    return {
      success: false,
      error: "Failed to update order status",
    };
  }
}

/**
 * Get user's orders with pagination
 */
export async function getUserOrders(
  userId: string,
  pagination: PaginationParams = {}
): Promise<OrderQueryResult> {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw new Error("Failed to fetch user orders");
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string, userId?: string) {
  try {
    const where: Prisma.OrderWhereUniqueInput = { id: orderId };
    if (userId) {
      where.userId = userId; // Ensure user can only access their own orders
    }

    const order = await prisma.order.findUnique({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw new Error("Failed to fetch order");
  }
}

/**
 * Fulfill order after payment (decrement stock)
 */
export async function fulfillOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    if (order.status === OrderStatus.PAID) {
      // Already fulfilled
      return { success: true };
    }

    // Decrement stock for each item in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.product.stock !== null) {
          // Only decrement if stock is tracked
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Update order status to PAID
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          updatedAt: new Date(),
        },
      });
    });

    if (debugMode) {
      console.log(`Fulfilled order ${orderId} - stock decremented`);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error fulfilling order ${orderId}:`, error);
    return {
      success: false,
      error: "Failed to fulfill order",
    };
  }
}

/**
 * Get order by Stripe session ID
 */
export async function getOrderByStripeSessionId(sessionId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return order;
  } catch (error) {
    console.error(
      `Error fetching order by Stripe session ${sessionId}:`,
      error
    );
    throw new Error("Failed to fetch order by Stripe session");
  }
}
