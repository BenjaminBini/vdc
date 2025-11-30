import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const STORAGE_KEY = 'beaucharme-cart';
const CART_EVENT = 'beaucharme-cart-change';

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const emptyState: CartState = { items: [], isOpen: false };

function getState(): CartState {
  if (typeof window === 'undefined') return emptyState;
  return (window as any).__beaucharmeCartState || emptyState;
}

function setState(newState: CartState) {
  if (typeof window === 'undefined') return;
  (window as any).__beaucharmeCartState = newState;
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

function initializeCart() {
  if (typeof window === 'undefined') return;
  if (!(window as any).__beaucharmeCartInitialized) {
    (window as any).__beaucharmeCartInitialized = true;
    const items = loadFromStorage();
    (window as any).__beaucharmeCartState = { items, isOpen: false };
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

export function useCart() {
  const [state, setLocalState] = useState<CartState>(emptyState);

  useEffect(() => {
    // Initialize cart from localStorage (only once globally)
    initializeCart();

    // Sync local state with global state
    setLocalState({ ...getState() });

    // Listen for changes from other components
    const handleChange = () => setLocalState({ ...getState() });
    window.addEventListener(CART_EVENT, handleChange);
    return () => window.removeEventListener(CART_EVENT, handleChange);
  }, []);

  const openCart = () => {
    setState({ ...getState(), isOpen: true });
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    setState({ ...getState(), isOpen: false });
    document.body.style.overflow = '';
  };

  const addItem = (product: Omit<CartItem, 'quantity'>) => {
    const current = getState();
    const existing = current.items.find((item) => item.id === product.id);
    let newItems: CartItem[];

    if (existing) {
      newItems = current.items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [...current.items, { ...product, quantity: 1 }];
    }

    setState({ ...current, items: newItems });
    saveToStorage(newItems);
  };

  const removeItem = (productId: string) => {
    const current = getState();
    const newItems = current.items.filter((item) => item.id !== productId);
    setState({ ...current, items: newItems });
    saveToStorage(newItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const current = getState();
    const newItems = current.items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    setState({ ...current, items: newItems });
    saveToStorage(newItems);
  };

  const getTotal = () => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    items: state.items,
    isOpen: state.isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
  };
}
