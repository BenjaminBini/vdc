import { useSyncExternalStore } from 'react';

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

let state: CartState = {
  items: [],
  isOpen: false,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Initialize from localStorage
if (typeof window !== 'undefined') {
  state.items = loadFromStorage();
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): CartState {
    return state;
  },

  getServerSnapshot(): CartState {
    return { items: [], isOpen: false };
  },

  openCart() {
    state = { ...state, isOpen: true };
    document.body.classList.add('overflow-hidden');
    emitChange();
  },

  closeCart() {
    state = { ...state, isOpen: false };
    document.body.classList.remove('overflow-hidden');
    emitChange();
  },

  toggleCart() {
    if (state.isOpen) {
      cartStore.closeCart();
    } else {
      cartStore.openCart();
    }
  },

  addItem(product: Omit<CartItem, 'quantity'>) {
    const existing = state.items.find((item) => item.id === product.id);
    let newItems: CartItem[];

    if (existing) {
      newItems = state.items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [...state.items, { ...product, quantity: 1 }];
    }

    state = { ...state, items: newItems };
    saveToStorage(newItems);
    emitChange();
  },

  removeItem(productId: string) {
    const newItems = state.items.filter((item) => item.id !== productId);
    state = { ...state, items: newItems };
    saveToStorage(newItems);
    emitChange();
  },

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      cartStore.removeItem(productId);
      return;
    }

    const newItems = state.items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    state = { ...state, items: newItems };
    saveToStorage(newItems);
    emitChange();
  },

  getTotal(): number {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount(): number {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  clear() {
    state = { ...state, items: [] };
    saveToStorage([]);
    emitChange();
  },
};

export function useCart() {
  const cartState = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  return {
    ...cartState,
    openCart: cartStore.openCart,
    closeCart: cartStore.closeCart,
    toggleCart: cartStore.toggleCart,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    getTotal: cartStore.getTotal,
    getItemCount: cartStore.getItemCount,
    clear: cartStore.clear,
  };
}

// Make cart available globally for non-React components
if (typeof window !== 'undefined') {
  (window as any).beaucharmeCart = cartStore;
}
