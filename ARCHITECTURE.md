# Architecture Documentation

## Overview

Beaucharme Cosmétique is built with **Astro** using the Islands Architecture pattern, with **React** for interactive components and **Tailwind CSS** for styling.

## Technology Stack

- **Framework**: Astro 5.x
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.x
- **Testing**: Vitest + Testing Library
- **Build**: Vite (via Astro)

## Project Structure

```
src/
├── components/          # UI components (Astro + React)
├── contexts/            # React Context providers
├── data/                # Static data (products, categories)
├── layouts/             # Page layouts
├── pages/               # Astro pages (file-based routing)
├── services/            # Data access layer
├── styles/              # Global CSS
├── test/                # Test setup and utilities
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Key Architectural Decisions

### 1. Astro Islands Architecture

Interactive React components are hydrated as "islands" within static Astro pages:

```astro
<CartButton client:load />
<ProductCardReact client:visible product={product} />
```

- `client:load` - Hydrate immediately (critical UI)
- `client:visible` - Hydrate when visible (performance optimization)

### 2. Cross-Island State Management

React Context cannot share state across islands by default. We solve this using:

1. **Window globals** for SSR-safe state initialization
2. **CustomEvent** for cross-island synchronization

```typescript
// CartContext.tsx
const CART_EVENT = 'beaucharme-cart-change';

function setGlobalState(newState: CartState) {
  window.__beaucharmeCartState = newState;
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

// Each island listens for changes
useEffect(() => {
  const handler = () => syncFromGlobal();
  window.addEventListener(CART_EVENT, handler);
  return () => window.removeEventListener(CART_EVENT, handler);
}, []);
```

### 3. Data Layer

`ProductService` provides a clean API for product data access:

```typescript
const products = ProductService.getAll();
const product = ProductService.getById('huile-bourrache');
const filtered = ProductService.getByCategory('huiles-vegetales');
```

### 4. Input Validation

All user inputs are validated and sanitized:

```typescript
import { sanitizeSearchQuery, isValidId } from '../utils/validation';

const safeQuery = sanitizeSearchQuery(userInput);
if (isValidId(productId)) {
  // Safe to use
}
```

## Component Patterns

### React Components

- Use `memo()` for performance optimization
- Use `useCallback()` for event handlers passed to children
- Use `useMemo()` for expensive computations

```typescript
const ProductCard = memo(function ProductCard({ product }) {
  const handleClick = useCallback(() => {
    addItem(product);
  }, [addItem, product]);

  return <button onClick={handleClick}>Add</button>;
});
```

### Astro Components

- Keep logic minimal
- Pass data to React islands via props
- Use `baseUrl` for asset paths

```astro
---
const baseUrl = import.meta.env.BASE_URL;
---
<ProductCardReact client:visible product={product} baseUrl={baseUrl} />
```

## Testing

Run tests with:

```bash
npm test           # Run once
npm run test:watch # Watch mode
npm run coverage   # With coverage report
```

Test files are co-located with source files (`*.test.ts`).

## Security

- All user inputs sanitized via `validation.ts`
- CSP headers in Layout.astro
- No inline scripts (except Astro's `is:inline` for critical path)
- XSS prevention in search and filter components

## Performance

- Images use `loading="lazy"`
- React components use `memo`, `useCallback`, `useMemo`
- Preconnect hints for Google Fonts
- Viewport-based hydration with `client:visible`
