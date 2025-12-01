/**
 * CartContext - React Context for cart state management
 * Uses CustomEvent for cross-island state synchronization in Astro
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartItem, CartState, CartTotals, AddToCartProduct, CartContextValue } from '../types';
import { parseAndValidateCart } from '../utils/validation';

const STORAGE_KEY = 'beaucharme-cart';
const CART_EVENT = 'beaucharme-cart-change';

// Type-safe window extension for cart state
interface BeaucharmeWindow extends Window {
  __beaucharmeCartState?: CartState;
  __beaucharmeCartInitialized?: boolean;
}

declare const window: BeaucharmeWindow;

const emptyState: CartState = {
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Load cart from localStorage with validation
 */
function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return parseAndValidateCart(saved);
  } catch {
    return [];
  }
}

/**
 * Save cart to localStorage
 */
function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[Cart] Failed to save to storage:', error);
  }
}

/**
 * Get global cart state
 */
function getGlobalState(): CartState {
  if (typeof window === 'undefined') return emptyState;
  return window.__beaucharmeCartState || emptyState;
}

/**
 * Set global cart state and dispatch event
 */
function setGlobalState(newState: CartState) {
  if (typeof window === 'undefined') return;
  window.__beaucharmeCartState = newState;
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/**
 * Initialize cart state on first load
 */
function initializeCart() {
  if (typeof window === 'undefined') return;
  if (!window.__beaucharmeCartInitialized) {
    window.__beaucharmeCartInitialized = true;
    const items = loadFromStorage();
    window.__beaucharmeCartState = { ...emptyState, items };
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, setState] = useState<CartState>(emptyState);

  // Initialize and sync with global state
  useEffect(() => {
    initializeCart();
    setState({ ...getGlobalState() });

    const handleChange = () => setState({ ...getGlobalState() });
    window.addEventListener(CART_EVENT, handleChange);
    return () => window.removeEventListener(CART_EVENT, handleChange);
  }, []);

  // Body overflow for sidebar
  useEffect(() => {
    document.body.style.overflow = state.isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [state.isOpen]);

  const openCart = useCallback(() => {
    setGlobalState({ ...getGlobalState(), isOpen: true });
  }, []);

  const closeCart = useCallback(() => {
    setGlobalState({ ...getGlobalState(), isOpen: false });
  }, []);

  const addItem = useCallback(async (product: AddToCartProduct) => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      const existing = current.items.find((item) => item.id === product.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = current.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...current.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
          },
        ];
      }

      saveToStorage(newItems);
      setGlobalState({ ...current, items: newItems, isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to add item:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible d\'ajouter l\'article au panier' });
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      const newItems = current.items.filter((item) => item.id !== productId);
      saveToStorage(newItems);
      setGlobalState({ ...current, items: newItems, isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to remove item:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible de supprimer l\'article' });
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = current.items.filter((item) => item.id !== productId);
      } else {
        newItems = current.items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
      }

      saveToStorage(newItems);
      setGlobalState({ ...current, items: newItems, isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to update quantity:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible de mettre à jour la quantité' });
    }
  }, []);

  const clearCart = useCallback(async () => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      saveToStorage([]);
      setGlobalState({ ...current, items: [], isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to clear cart:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible de vider le panier' });
    }
  }, []);

  const getTotal = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [state.items]);

  const getItemCount = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  const getTotals = useCallback((): CartTotals => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 5.9;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [state.items]);

  const value: CartContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    error: state.error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    getTotal,
    getItemCount,
    getTotals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart hook - Access cart state and actions
 * Uses global state with CustomEvent for cross-island sync
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  // If not within a CartProvider, create a standalone hook that syncs with global state
  const [state, setState] = useState<CartState>(emptyState);

  useEffect(() => {
    if (context) return; // Skip if within provider

    initializeCart();
    setState({ ...getGlobalState() });

    const handleChange = () => setState({ ...getGlobalState() });
    window.addEventListener(CART_EVENT, handleChange);
    return () => window.removeEventListener(CART_EVENT, handleChange);
  }, [context]);

  // Body overflow for sidebar (standalone mode)
  useEffect(() => {
    if (context) return;
    document.body.style.overflow = state.isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [context, state.isOpen]);

  // If within provider, return provider's value
  if (context) {
    return context;
  }

  // Standalone implementations (same as provider)
  const openCart = () => {
    setGlobalState({ ...getGlobalState(), isOpen: true });
  };

  const closeCart = () => {
    setGlobalState({ ...getGlobalState(), isOpen: false });
  };

  const addItem = async (product: AddToCartProduct) => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      const existing = current.items.find((item) => item.id === product.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = current.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...current.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
          },
        ];
      }

      saveToStorage(newItems);
      setGlobalState({ ...current, items: newItems, isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to add item:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible d\'ajouter l\'article au panier' });
    }
  };

  const removeItem = async (productId: string) => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      const newItems = current.items.filter((item) => item.id !== productId);
      saveToStorage(newItems);
      setGlobalState({ ...current, items: newItems, isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to remove item:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible de supprimer l\'article' });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = current.items.filter((item) => item.id !== productId);
      } else {
        newItems = current.items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
      }

      saveToStorage(newItems);
      setGlobalState({ ...current, items: newItems, isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to update quantity:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible de mettre à jour la quantité' });
    }
  };

  const clearCart = async () => {
    const current = getGlobalState();
    setGlobalState({ ...current, isLoading: true });

    try {
      saveToStorage([]);
      setGlobalState({ ...current, items: [], isLoading: false });
    } catch (err) {
      console.error('[Cart] Failed to clear cart:', err);
      setGlobalState({ ...current, isLoading: false, error: 'Impossible de vider le panier' });
    }
  };

  const getTotal = () => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotals = (): CartTotals => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 5.9;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  return {
    items: state.items,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    error: state.error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    getTotal,
    getItemCount,
    getTotals,
  };
}
