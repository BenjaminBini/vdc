import { useCart } from '../stores/cartStore';

interface ProductAddToCartProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  inStock: boolean;
}

export default function ProductAddToCart({ product, inStock }: ProductAddToCartProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();

  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
          </svg>
        </button>
        <span className="w-12 text-center font-semibold text-lg text-beaucharme-dark">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="w-14 h-14 flex items-center justify-center text-beaucharme-dark hover:bg-beaucharme-beige rounded-r-full transition-colors"
          aria-label="Augmenter la quantité"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
      <span className="text-beaucharme-sage font-medium flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
        </svg>
        Dans le panier
      </span>
    </div>
  );
}
