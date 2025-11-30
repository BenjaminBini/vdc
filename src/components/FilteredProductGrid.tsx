import { useMemo, useEffect } from 'react';
import { useFilters } from '@stores/filterStore';
import { useCart, cartStore } from '@stores/cartStore';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  ingredients: string[];
  plants?: string[];
  image: string;
  inStock: boolean;
  featured: boolean;
  badge?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Plant {
  id: string;
  name: string;
}

interface FilteredProductGridProps {
  products: Product[];
  categories: Category[];
  plants: Plant[];
  minPrice: number;
  maxPrice: number;
}

function ProductCard({ product }: { product: Product }) {
  const { items, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    cartStore.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <article className="card-product group relative">
      <a href={`/vdc/produit/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden relative bg-beaucharme-cream">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover object-center ${!product.inStock ? 'opacity-50' : ''}`}
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
              {product.category.replace(/-/g, ' ')}
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
              {product.price.toFixed(2).replace('.', ',')} &euro;
            </span>
          </div>
        </div>
      </a>

      <div className="px-6 pb-6">
        {product.inStock ? (
          quantity > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center bg-beaucharme-cream hover:bg-beaucharme-beige text-beaucharme-dark rounded-full transition-colors cursor-pointer"
                aria-label="Diminuer la quantité"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="flex-1 text-center font-semibold text-beaucharme-dark">
                {quantity} dans le panier
              </span>
              <button
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center bg-beaucharme-terracotta hover:bg-beaucharme-terracotta/90 text-white rounded-full transition-colors cursor-pointer"
                aria-label="Augmenter la quantité"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
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
    </article>
  );
}

export default function FilteredProductGrid({ products, categories: categoryList, plants: plantList, minPrice, maxPrice }: FilteredProductGridProps) {
  const { categories, plants, priceRange, inStockOnly, sortBy, searchQuery, toggleCategory, togglePlant, setPriceRange, setInStockOnly, setSearchQuery, resetFilters, hasActiveFilters } = useFilters();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.ingredients.some((i) => i.toLowerCase().includes(query))
      );
    }

    // Filter by categories
    if (categories.length > 0) {
      result = result.filter((p) => categories.includes(p.category));
    }

    // Filter by plants
    if (plants.length > 0) {
      result = result.filter((p) => p.plants && p.plants.some((plant) => plants.includes(plant)));
    }

    // Filter by price range
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by stock status
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name, 'fr'));
        break;
      default:
        // Keep original order (featured first)
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, categories, plants, priceRange, inStockOnly, sortBy, searchQuery]);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-24 h-24 text-beaucharme-beige mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-beaucharme-earth text-lg">Aucun produit ne correspond a vos criteres</p>
        <p className="text-beaucharme-earth/70 text-sm mt-2">
          Essayez de modifier vos filtres pour voir plus de produits
        </p>
      </div>
    );
  }

  // Helper to get category/plant name from id
  const getCategoryName = (id: string) => categoryList.find(c => c.id === id)?.name || id;
  const getPlantName = (id: string) => plantList.find(p => p.id === id)?.name || id;

  // Check if price range is different from default
  const hasPriceFilter = priceRange[0] > minPrice || priceRange[1] < maxPrice;

  // Update product count in header
  useEffect(() => {
    const countEl = document.getElementById('product-count');
    if (countEl) {
      countEl.textContent = `(${filteredProducts.length})`;
    }
  }, [filteredProducts.length]);

  return (
    <div>
      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mb-6 p-4 bg-beaucharme-cream/50 rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-beaucharme-earth font-medium mr-2">Filtres actifs :</span>

            {/* Search query */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-beaucharme-dark border border-beaucharme-beige hover:border-beaucharme-terracotta hover:bg-beaucharme-terracotta/5 transition-colors"
              >
                <span>« {searchQuery} »</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Categories */}
            {categories.map(catId => (
              <button
                key={catId}
                onClick={() => toggleCategory(catId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-beaucharme-terracotta/10 rounded-full text-sm text-beaucharme-terracotta border border-beaucharme-terracotta/30 hover:bg-beaucharme-terracotta/20 transition-colors"
              >
                <span>{getCategoryName(catId)}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}

            {/* Plants */}
            {plants.map(plantId => (
              <button
                key={plantId}
                onClick={() => togglePlant(plantId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-beaucharme-olive/10 rounded-full text-sm text-beaucharme-olive border border-beaucharme-olive/30 hover:bg-beaucharme-olive/20 transition-colors"
              >
                <span>{getPlantName(plantId)}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}

            {/* Price range */}
            {hasPriceFilter && (
              <button
                onClick={() => setPriceRange([minPrice, maxPrice])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-beaucharme-dark border border-beaucharme-beige hover:border-beaucharme-terracotta hover:bg-beaucharme-terracotta/5 transition-colors"
              >
                <span>{priceRange[0]}€ - {priceRange[1]}€</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* In stock only */}
            {inStockOnly && (
              <button
                onClick={() => setInStockOnly(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-beaucharme-dark border border-beaucharme-beige hover:border-beaucharme-terracotta hover:bg-beaucharme-terracotta/5 transition-colors"
              >
                <span>En stock</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Reset all button */}
            <button
              onClick={resetFilters}
              className="ml-auto text-sm text-beaucharme-terracotta hover:text-beaucharme-terracotta/80 underline underline-offset-2 transition-colors"
            >
              Effacer tout
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
