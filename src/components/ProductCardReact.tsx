import { memo, useEffect, useRef, useState, useCallback } from "react";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../utils/formatting";
import type { Product } from "../types";
import QuantityControls from "./QuantityControls";

interface ProductCardReactProps {
  product: Product;
  baseUrl?: string;
}

const ProductCardReact = memo(function ProductCardReact({
  product,
  baseUrl = "",
}: ProductCardReactProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const articleRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = articleRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = useCallback(() => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }, [addItem, product.id, product.name, product.price, product.image]);

  const handleIncrement = useCallback(() => {
    updateQuantity(product.id, quantity + 1);
  }, [updateQuantity, product.id, quantity]);

  const handleDecrement = useCallback(() => {
    updateQuantity(product.id, quantity - 1);
  }, [updateQuantity, product.id, quantity]);

  const productUrl = `${baseUrl}/produit/${product.id}`;

  return (
    <article
      ref={articleRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        <a href={productUrl} className="block">
          <div className="aspect-square overflow-hidden relative bg-beaucharme-cream">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover object-center ${!product.inStock ? "opacity-50" : ""}`}
              loading="lazy"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-beaucharme-dark/20"></div>
            )}
            {quantity > 0 && (
              <div className="absolute top-3 right-3 bg-beaucharme-terracotta text-white text-sm w-7 h-7 rounded-full flex items-center justify-center font-semibold shadow-md">
                {quantity}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-widest uppercase text-beaucharme-earth opacity-75">
                {product.category.replace(/-/g, " ")}
              </span>
              {!product.inStock && (
                <span className="badge-out text-xs">Rupture de stock</span>
              )}
              {product.badge && product.inStock && (
                <span className="badge-new text-xs">{product.badge}</span>
              )}
            </div>

            <h3 className="font-serif text-xl font-semibold text-beaucharme-dark mb-2 group-hover:text-beaucharme-terracotta transition-colors duration-300">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-beaucharme-earth/80 mb-4 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-4">
              <span className="text-2xl font-serif font-semibold text-beaucharme-dark">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </a>

        <div className="px-6 pb-6">
          {product.inStock ? (
            quantity > 0 ? (
              <QuantityControls
                quantity={quantity}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary text-sm py-3 cursor-pointer"
              >
                Ajouter au panier
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 px-8 py-3 rounded-sm font-medium tracking-wide cursor-not-allowed text-sm"
            >
              Indisponible
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export default ProductCardReact;
