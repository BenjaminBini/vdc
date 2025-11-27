/// <reference path="../.astro/types.d.ts" />

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  inStock?: boolean;
  badge?: string;
  featured?: boolean;
}

interface Cart {
  items: CartItem[];
  loadCart(): CartItem[];
  saveCart(): void;
  addItem(product: Product): void;
  removeItem(productId: string): void;
  updateQuantity(productId: string, quantity: number): void;
  getTotal(): number;
  getItemCount(): number;
  updateCartUI(): void;
  dispatchCartUpdate(): void;
  clear(): void;
}

declare global {
  interface Window {
    beaucharmeCart: Cart;
  }
}

export {}