import { useState, useRef } from 'react';
import { useCart } from '../stores/cartStore';
import type { Product } from '../stores/cartStore';

interface ProductAddToCartCompactProps {
  product: Product;
  inStock: boolean;
}

export default function ProductAddToCartCompact({ product, inStock }: ProductAddToCartCompactProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdd = async () => {
    if (isAdding) return;

    setIsAdding(true);

    // Only show loading text if operation takes longer than 300ms
    loadingTimeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, 300);

    await addItem(product);

    // Clear the loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setIsAdding(false);
    setShowLoading(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-500 px-8 py-3 rounded-sm font-medium tracking-wide cursor-not-allowed text-sm"
      >
        Indisponible
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isAdding}
      className={`w-full text-sm py-3 font-medium tracking-wide rounded-sm transition-colors duration-300 ${
        added
          ? 'bg-beaucharme-sage text-white'
          : 'btn-primary'
      }`}
    >
      {showLoading ? 'Ajout...' : added ? 'Ajouté !' : 'Ajouter au panier'}
    </button>
  );
}
