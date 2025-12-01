import { useEffect } from "react";
import { useCart } from "../contexts/CartContext";

export default function CartSidebar() {
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

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €";
  };

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
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg
                  className="w-24 h-24 text-beaucharme-beige mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-beaucharme-earth text-lg mb-2">
                  Votre panier est vide
                </p>
                <p className="text-beaucharme-earth/70 text-sm">
                  Découvrez nos produits naturels
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 mb-6 pb-6 border-b border-beaucharme-beige last:border-0"
                >
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
                      <div className="flex items-center space-x-2 border border-beaucharme-beige rounded-sm">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1 hover:bg-beaucharme-cream transition-colors duration-300"
                          aria-label="Diminuer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="px-3 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-1 hover:bg-beaucharme-cream transition-colors duration-300"
                          aria-label="Augmenter"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-beaucharme-earth/70 hover:text-red-600 transition-colors duration-300"
                        aria-label="Supprimer"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
                  {formatPrice(getTotal())}
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
}
