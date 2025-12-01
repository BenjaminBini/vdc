import { memo, useCallback } from 'react';
import { IconPlus, IconMinus } from './icons';

interface QuantityControlsProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

/**
 * Reusable quantity controls for cart items
 * Used in ProductCardReact, ProductAddToCart, and CartSidebar
 */
const QuantityControls = memo(function QuantityControls({
  quantity,
  onIncrement,
  onDecrement,
  size = 'md',
  variant = 'default',
  showLabel = true,
}: QuantityControlsProps) {
  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  if (variant === 'compact') {
    // Compact variant used in CartSidebar
    return (
      <div className="flex items-center space-x-2 border border-beaucharme-beige rounded-sm">
        <button
          onClick={onDecrement}
          className="px-3 py-1 hover:bg-beaucharme-cream transition-colors duration-300"
          aria-label="Diminuer"
        >
          <IconMinus className={iconSize} />
        </button>
        <span className="px-3 font-medium">{quantity}</span>
        <button
          onClick={onIncrement}
          className="px-3 py-1 hover:bg-beaucharme-cream transition-colors duration-300"
          aria-label="Augmenter"
        >
          <IconPlus className={iconSize} />
        </button>
      </div>
    );
  }

  // Default variant used in ProductCardReact
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={onDecrement}
        className={`${buttonSize} flex items-center justify-center bg-beaucharme-cream hover:bg-beaucharme-beige text-beaucharme-dark rounded-full transition-colors cursor-pointer`}
        aria-label="Diminuer la quantité"
      >
        <IconMinus className={iconSize} />
      </button>
      {showLabel && (
        <span className="flex-1 text-center font-semibold text-beaucharme-dark">
          {quantity} dans le panier
        </span>
      )}
      {!showLabel && (
        <span className="px-4 font-semibold text-beaucharme-dark">{quantity}</span>
      )}
      <button
        onClick={onIncrement}
        className={`${buttonSize} flex items-center justify-center bg-beaucharme-terracotta hover:bg-beaucharme-terracotta/90 text-white rounded-full transition-colors cursor-pointer`}
        aria-label="Augmenter la quantité"
      >
        <IconPlus className={iconSize} />
      </button>
    </div>
  );
});

export default QuantityControls;
