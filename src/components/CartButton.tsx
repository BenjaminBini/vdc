import { useCart } from '@stores/cartStore';

export default function CartButton() {
  const { toggleCart, getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:bg-beaucharme-sage-dark rounded-full transition-colors duration-300 cursor-pointer"
      aria-label="Panier"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-beaucharme-earth text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
}
