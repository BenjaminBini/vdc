/**
 * Cart Actions - Client-side implementation
 *
 * These functions mimic Astro Server Actions pattern but run client-side.
 * When migrating to server hosting (Vercel/Netlify), convert these to
 * real Astro Actions by moving to src/actions/index.ts and using defineAction.
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ActionResult<T> {
  data: T | null;
  error: Error | null;
}

// Simulate network delay (remove in production or set to 0)
const SIMULATED_DELAY = 100;

async function simulateDelay(): Promise<void> {
  if (SIMULATED_DELAY > 0) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  product: Product,
  currentCart: CartItem[]
): Promise<ActionResult<{ cart: CartItem[]; addedItem: CartItem }>> {
  try {
    await simulateDelay();

    const existingItem = currentCart.find((item) => item.id === product.id);

    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      };
      const cart = currentCart.map((item) =>
        item.id === product.id ? updatedItem : item
      );
      return { data: { cart, addedItem: updatedItem }, error: null };
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      return {
        data: { cart: [...currentCart, newItem], addedItem: newItem },
        error: null,
      };
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  productId: string,
  currentCart: CartItem[]
): Promise<ActionResult<{ cart: CartItem[] }>> {
  try {
    await simulateDelay();
    const cart = currentCart.filter((item) => item.id !== productId);
    return { data: { cart }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Update item quantity
 */
export async function updateQuantity(
  productId: string,
  quantity: number,
  currentCart: CartItem[]
): Promise<ActionResult<{ cart: CartItem[] }>> {
  try {
    await simulateDelay();

    if (quantity <= 0) {
      const cart = currentCart.filter((item) => item.id !== productId);
      return { data: { cart }, error: null };
    }

    const cart = currentCart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    return { data: { cart }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<ActionResult<{ cart: CartItem[] }>> {
  try {
    await simulateDelay();
    return { data: { cart: [] }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get cart totals
 */
export async function getCartTotals(currentCart: CartItem[]): Promise<
  ActionResult<{
    subtotal: number;
    itemCount: number;
    shipping: number;
    total: number;
  }>
> {
  try {
    await simulateDelay();

    const subtotal = currentCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 5.9; // Free shipping over 50€

    return {
      data: {
        subtotal,
        itemCount,
        shipping,
        total: subtotal + shipping,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
