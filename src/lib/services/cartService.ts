/**
 * Cart Service
 *
 * Handles shopping cart operations including:
 * - Cart CRUD operations
 * - Anonymous cart support (session-based)
 * - Cart item management
 * - Stock validation
 * - Cart merging on user login
 */

import { prisma } from "@/lib/prisma";
import { CartItem, Prisma } from "@/generated/client";
import { devMode } from "./envService";

const debugMode = devMode();

export interface CartWithItems {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: Array<{
    id: string;
    quantity: number;
    addedAt: Date;
    product: {
      id: string;
      slug: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      images: string[];
      type: string;
      stock: number | null;
      published: boolean;
    };
  }>;
  total: number;
  itemCount: number;
}

export interface AddToCartParams {
  productId: string;
  quantity: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Get or create cart for user or session
 */
export async function getOrCreateCart(
  userId?: string,
  sessionId?: string
): Promise<string> {
  try {
    if (!userId && !sessionId) {
      throw new Error("Either userId or sessionId must be provided");
    }

    // Try to find existing cart
    const where: Prisma.CartWhereInput = {};
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    let cart = await prisma.cart.findFirst({ where });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId || null,
          sessionId: sessionId || null,
        },
      });

      if (debugMode) {
        console.log(
          `Created new cart ${cart.id} for ${userId ? `user ${userId}` : `session ${sessionId}`}`
        );
      }
    }

    return cart.id;
  } catch (error) {
    console.error("Error getting or creating cart:", error);
    throw new Error("Failed to get or create cart");
  }
}

/**
 * Get cart with all items and product details
 */
export async function getCart(
  userId?: string,
  sessionId?: string
): Promise<CartWithItems | null> {
  try {
    if (!userId && !sessionId) {
      return null;
    }

    const where: Prisma.CartWhereInput = {};
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const cart = await prisma.cart.findFirst({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                price: true,
                currency: true,
                images: true,
                type: true,
                stock: true,
                published: true,
              },
            },
          },
          orderBy: {
            addedAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      return null;
    }

    // Calculate total and item count
    const total = cart.items.reduce((sum: number, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce((sum: number, item) => {
      return sum + item.quantity;
    }, 0);

    return {
      ...cart,
      total,
      itemCount,
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Failed to fetch cart");
  }
}

/**
 * Add item to cart or update quantity if already exists
 */
export async function addToCart(
  params: AddToCartParams
): Promise<{ success: boolean; cartItem?: CartItem; error?: string }> {
  try {
    const { productId, quantity, userId, sessionId } = params;

    if (quantity <= 0) {
      return {
        success: false,
        error: "Quantity must be greater than 0",
      };
    }

    // Validate product exists and is published
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (!product.published) {
      return {
        success: false,
        error: "Product is not available",
      };
    }

    // Check stock availability
    if (product.stock !== null && product.stock < quantity) {
      return {
        success: false,
        error: `Only ${product.stock} items available in stock`,
      };
    }

    // Get or create cart
    const cartId = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock for new quantity
      if (product.stock !== null && product.stock < newQuantity) {
        return {
          success: false,
          error: `Only ${product.stock} items available in stock`,
        };
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });

      if (debugMode) {
        console.log(
          `Updated cart item ${cartItem.id} quantity to ${newQuantity}`
        );
      }
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          quantity,
        },
        include: { product: true },
      });

      if (debugMode) {
        console.log(`Added product ${productId} to cart ${cartId}`);
      }
    }

    return {
      success: true,
      cartItem,
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      error: "Failed to add item to cart",
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; cartItem?: CartItem; error?: string }> {
  try {
    if (quantity <= 0) {
      return {
        success: false,
        error: "Quantity must be greater than 0",
      };
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!cartItem) {
      return {
        success: false,
        error: "Cart item not found",
      };
    }

    // Check stock availability
    if (cartItem.product.stock !== null && cartItem.product.stock < quantity) {
      return {
        success: false,
        error: `Only ${cartItem.product.stock} items available in stock`,
      };
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });

    if (debugMode) {
      console.log(`Updated cart item ${cartItemId} quantity to ${quantity}`);
    }

    return {
      success: true,
      cartItem: updatedItem,
    };
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return {
      success: false,
      error: "Failed to update cart item",
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  cartItemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    if (debugMode) {
      console.log(`Removed cart item ${cartItemId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return {
      success: false,
      error: "Failed to remove item from cart",
    };
  }
}

/**
 * Clear all items from cart
 */
export async function clearCart(
  userId?: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId && !sessionId) {
      return {
        success: false,
        error: "Either userId or sessionId must be provided",
      };
    }

    const where: Prisma.CartWhereInput = {};
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const cart = await prisma.cart.findFirst({ where });

    if (!cart) {
      return { success: true }; // Nothing to clear
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    if (debugMode) {
      console.log(`Cleared cart ${cart.id}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return {
      success: false,
      error: "Failed to clear cart",
    };
  }
}

/**
 * Merge anonymous cart into user cart when user logs in
 */
export async function mergeAnonymousCart(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; merged: number; error?: string }> {
  try {
    let merged = 0;

    // Find anonymous cart
    const anonymousCart = await prisma.cart.findFirst({
      where: { sessionId },
      include: { items: true },
    });

    if (!anonymousCart || anonymousCart.items.length === 0) {
      return { success: true, merged: 0 }; // Nothing to merge
    }

    // Get or create user cart
    const userCartId = await getOrCreateCart(userId);

    // Merge items
    for (const item of anonymousCart.items) {
      const existingUserItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: userCartId,
            productId: item.productId,
          },
        },
      });

      if (existingUserItem) {
        // Combine quantities
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: {
            quantity: existingUserItem.quantity + item.quantity,
          },
        });
      } else {
        // Move item to user cart
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { cartId: userCartId },
        });
      }

      merged++;
    }

    // Delete anonymous cart
    await prisma.cart.delete({
      where: { id: anonymousCart.id },
    });

    if (debugMode) {
      console.log(
        `Merged ${merged} items from anonymous cart to user ${userId}`
      );
    }

    return { success: true, merged };
  } catch (error) {
    console.error("Error merging anonymous cart:", error);
    return {
      success: false,
      merged: 0,
      error: "Failed to merge cart",
    };
  }
}

/**
 * Validate cart items stock before checkout
 */
export async function validateCartStock(cartId: string): Promise<{
  valid: boolean;
  errors?: Array<{ productId: string; productName: string; message: string }>;
}> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      return {
        valid: false,
        errors: [{ productId: "", productName: "", message: "Cart not found" }],
      };
    }

    const errors: Array<{
      productId: string;
      productName: string;
      message: string;
    }> = [];

    for (const item of cart.items) {
      // Check if product is still published
      if (!item.product.published) {
        errors.push({
          productId: item.product.id,
          productName: item.product.name,
          message: "Product is no longer available",
        });
        continue;
      }

      // Check stock
      if (item.product.stock !== null && item.product.stock < item.quantity) {
        errors.push({
          productId: item.product.id,
          productName: item.product.name,
          message: `Only ${item.product.stock} items available (you have ${item.quantity} in cart)`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error validating cart stock:", error);
    return {
      valid: false,
      errors: [
        { productId: "", productName: "", message: "Failed to validate cart" },
      ],
    };
  }
}

/**
 * Get cart item count for a user or session
 */
export async function getCartItemCount(
  userId?: string,
  sessionId?: string
): Promise<number> {
  try {
    const cart = await getCart(userId, sessionId);
    return cart?.itemCount || 0;
  } catch (error) {
    console.error("Error getting cart item count:", error);
    return 0;
  }
}
