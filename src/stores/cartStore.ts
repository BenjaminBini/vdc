import { useState, useEffect, useCallback } from 'react';
import * as cartActions from '../actions/cart';
import type { CartItem, Product } from '../actions/cart';
import { parseAndValidateCart } from '../utils/validation';

export type { CartItem, Product };

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

// Type-safe window extension for cart state
interface BeaucharmeWindow extends Window {
  __beaucharmeCartState?: CartState;
  __beaucharmeCartInitialized?: boolean;
}

declare const window: BeaucharmeWindow;

const STORAGE_KEY = 'beaucharme-cart';
const CART_EVENT = 'beaucharme-cart-change';

/**
 * Load cart from localStorage with validation
 * Invalid items are filtered out to prevent XSS and data corruption
 */
function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const validatedItems = parseAndValidateCart(saved);

    // If we had to filter items, update storage with clean data
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length !== validatedItems.length) {
        saveToStorage(validatedItems);
      }
    }

    return validatedItems;
  } catch (error) {
    console.error('[Cart] Failed to load cart from storage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore if we can't clear
    }
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const emptyState: CartState = { items: [], isOpen: false, isLoading: false };

function getState(): CartState {
  if (typeof window === 'undefined') return emptyState;
  return window.__beaucharmeCartState || emptyState;
}

function setState(newState: CartState) {
  if (typeof window === 'undefined') return;
  window.__beaucharmeCartState = newState;
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

function initializeCart() {
  if (typeof window === 'undefined') return;
  if (!window.__beaucharmeCartInitialized) {
    window.__beaucharmeCartInitialized = true;
    const items = loadFromStorage();
    window.__beaucharmeCartState = { items, isOpen: false, isLoading: false };
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

export function useCart() {
  const [state, setLocalState] = useState<CartState>(emptyState);

  useEffect(() => {
    initializeCart();
    setLocalState({ ...getState() });

    const handleChange = () => setLocalState({ ...getState() });
    window.addEventListener(CART_EVENT, handleChange);
    return () => window.removeEventListener(CART_EVENT, handleChange);
  }, []);

  const openCart = useCallback(() => {
    setState({ ...getState(), isOpen: true });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeCart = useCallback(() => {
    setState({ ...getState(), isOpen: false });
    document.body.style.overflow = '';
  }, []);

  const addItem = useCallback(async (product: Product) => {
    const current = getState();
    setState({ ...current, isLoading: true });

    const { data, error } = await cartActions.addToCart(product, current.items);

    if (error) {
      console.error('Failed to add item:', error);
      setState({ ...current, isLoading: false });
      return;
    }

    if (data) {
      setState({ ...current, items: data.cart, isLoading: false });
      saveToStorage(data.cart);
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    const current = getState();
    setState({ ...current, isLoading: true });

    const { data, error } = await cartActions.removeFromCart(productId, current.items);

    if (error) {
      console.error('Failed to remove item:', error);
      setState({ ...current, isLoading: false });
      return;
    }

    if (data) {
      setState({ ...current, items: data.cart, isLoading: false });
      saveToStorage(data.cart);
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const current = getState();
    setState({ ...current, isLoading: true });

    const { data, error } = await cartActions.updateQuantity(productId, quantity, current.items);

    if (error) {
      console.error('Failed to update quantity:', error);
      setState({ ...current, isLoading: false });
      return;
    }

    if (data) {
      setState({ ...current, items: data.cart, isLoading: false });
      saveToStorage(data.cart);
    }
  }, []);

  const clearCart = useCallback(async () => {
    const current = getState();
    setState({ ...current, isLoading: true });

    const { data, error } = await cartActions.clearCart();

    if (error) {
      console.error('Failed to clear cart:', error);
      setState({ ...current, isLoading: false });
      return;
    }

    if (data) {
      setState({ ...current, items: data.cart, isLoading: false });
      saveToStorage(data.cart);
    }
  }, []);

  const getTotal = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [state.items]);

  const getItemCount = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  return {
    items: state.items,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };
}
