import { memo, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../utils/formatting";
import { IconX, IconShoppingBag, IconTrash } from "./icons";
import QuantityControls from "./QuantityControls";

const CartSidebar = memo(function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal } =
    useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  const total = useMemo(() => getTotal(), [getTotal]);

  return (
    <>
      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transition-transform duration-300"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-beaucharme-beige">
            <h2 className="font-serif text-2xl font-semibold text-beaucharme-dark">
              Votre Panier
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-beaucharme-cream rounded-full transition-colors duration-300"
              aria-label="Fermer"
            >
              <IconX className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <IconShoppingBag className="w-24 h-24 text-beaucharme-beige mb-4" strokeWidth={1} />
                <p className="text-beaucharme-earth text-lg mb-2">
                  Votre panier est vide
                </p>
                <p className="text-beaucharme-earth/70 text-sm">
                  Découvrez nos produits naturels
                </p>
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-beaucharme-beige p-6 bg-beaucharme-cream/30">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-beaucharme-dark">
                  Sous-total
                </span>
                <span className="font-serif text-2xl font-semibold text-beaucharme-dark">
                  {formatPrice(total)}
                </span>
              </div>

              <p className="text-sm text-beaucharme-earth/80">
                Frais de livraison calculés à la prochaine étape
              </p>

              <button
                onClick={() =>
                  alert(
                    "Merci pour votre commande ! Cette fonctionnalité sera bientôt disponible. (Interface de démonstration)"
                  )
                }
                className="w-full btn-primary"
              >
                Passer commande
              </button>

              <button onClick={closeCart} className="w-full btn-secondary">
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={closeCart}
      />
    </>
  );
});

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem = memo(function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleIncrement = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [onUpdateQuantity, item.id, item.quantity]);

  const handleDecrement = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [onUpdateQuantity, item.id, item.quantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [onRemove, item.id]);

  return (
    <div className="flex space-x-4 mb-6 pb-6 border-b border-beaucharme-beige last:border-0">
      <img
        src={item.image}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-sm"
      />
      <div className="flex-1">
        <h3 className="font-medium text-beaucharme-dark mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-beaucharme-earth/70 mb-3">
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center justify-between">
          <QuantityControls
            quantity={item.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            variant="compact"
            size="sm"
          />

          <button
            onClick={handleRemove}
            className="text-beaucharme-earth/70 hover:text-red-600 transition-colors duration-300"
            aria-label="Supprimer"
          >
            <IconTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default CartSidebar;
