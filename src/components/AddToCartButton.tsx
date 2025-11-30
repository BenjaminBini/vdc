import { useState } from 'react';
import { useCart, type CartItem } from '@stores/cartStore';

interface Props {
  product: Omit<CartItem, 'quantity'>;
}

export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full btn-primary transition-all duration-300 ${
        isAdded ? 'bg-beaucharme-sage' : ''
      }`}
    >
      {isAdded ? 'Ajouté !' : 'Ajouter au panier'}
    </button>
  );
}
