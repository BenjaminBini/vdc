import { memo, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { IconShoppingBag, IconPlus, IconMinus, IconCheck } from './icons';
import type { AddToCartProduct } from '../types';

interface ProductAddToCartProps {
  product: AddToCartProduct;
  inStock: boolean;
}

const ProductAddToCart = memo(function ProductAddToCart({ product, inStock }: ProductAddToCartProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();

  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = useCallback(() => {
    addItem(product);
  }, [addItem, product]);

  const handleIncrement = useCallback(() => {
    updateQuantity(product.id, quantity + 1);
  }, [updateQuantity, product.id, quantity]);

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  }, [updateQuantity, removeItem, product.id, quantity]);

  if (!inStock) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 text-lg px-12 py-5 rounded-sm font-medium cursor-not-allowed w-full sm:w-auto"
      >
        Indisponible
      </button>
    );
  }

  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className="btn-primary text-lg px-12 py-5 flex items-center justify-center gap-3 w-full sm:w-auto"
      >
        <IconShoppingBag className="w-6 h-6" />
        Ajouter au panier
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center bg-beaucharme-cream rounded-full">
        <button
          onClick={handleDecrement}
          className="w-14 h-14 flex items-center justify-center text-beaucharme-dark hover:bg-beaucharme-beige rounded-l-full transition-colors"
          aria-label="Diminuer la quantité"
        >
          <IconMinus className="w-5 h-5" />
        </button>
        <span className="w-12 text-center font-semibold text-lg text-beaucharme-dark">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="w-14 h-14 flex items-center justify-center text-beaucharme-dark hover:bg-beaucharme-beige rounded-r-full transition-colors"
          aria-label="Augmenter la quantité"
        >
          <IconPlus className="w-5 h-5" />
        </button>
      </div>
      <span className="text-beaucharme-sage font-medium flex items-center gap-2">
        <IconCheck className="w-5 h-5" />
        Dans le panier
      </span>
    </div>
  );
});

export default ProductAddToCart;
