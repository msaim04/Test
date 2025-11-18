# Header Component Architecture

## Overview
The header component follows Next.js and React best practices with a **feature-based, modular architecture** that respects the project's feature structure.

## Architecture Principles

### ✅ Feature-Based Architecture
- Organized as a self-contained feature in `shared/components/header/`
- Follows the same structure as other features:
  - `stores/` - State management
  - `types/` - Type definitions
  - `hooks/` - Custom hooks
  - `components/` - UI components
  - `constants.ts` - Configuration values
- Clear boundaries between features

### ✅ Rendering Strategy
- **Client Component** (`"use client"`) - Required for interactivity (state, event handlers)
- Server Components used where appropriate (static content can be server-rendered)
- Optimal rendering method chosen for each piece

### ✅ State Management
- **Global State**: Zustand store in `stores/header.store.ts`
- **Local State**: Avoided unnecessary useState; logic extracted to custom hooks
- **Selective Persistence**: Only language and search form persist to localStorage

### ✅ Reusability
- **Custom Hooks**: `useNavigation`, `useSearchForm`, `useLanguage`, `useMobileMenu`
- **Reusable Components**: Logo, NavigationLinks, AuthButtons, SearchForm, etc.
- **Constants**: Centralized configuration (NAV_LINKS, LOGO_CONFIG, etc.)

### ✅ Performance Optimizations
- **React.memo**: All sub-components memoized to prevent unnecessary re-renders
- **useMemo**: Navigation links memoized
- **useCallback**: Event handlers memoized
- **Image Optimization**: Next.js Image component with priority for logo
- **Code Splitting**: Components lazy-loaded where appropriate

### ✅ Scalability
- Modular structure allows easy feature additions
- Clear separation of concerns
- Easy to test individual pieces
- Adding new navigation links doesn't require touching component logic

### ✅ Maintainability
- **Consistent Patterns**: All components follow same structure
- **Readable Names**: Clear, descriptive component and function names
- **Type Safety**: Full TypeScript support with types in `types/` directory
- **Documentation**: JSDoc comments on all hooks and components
- **Clear File Boundaries**: Each file has a single responsibility

## File Structure

```
header/
├── index.tsx                    # Main header component
├── constants.ts                 # Configuration and constants
├── stores/
│   └── header.store.ts         # Zustand store for state management
├── types/
│   └── header.types.ts         # TypeScript type definitions
├── hooks/
│   ├── use-navigation.ts       # Navigation logic
│   ├── use-search-form.ts      # Search form logic
│   ├── use-language.ts         # Language management
│   └── use-mobile-menu.ts      # Mobile menu logic
└── components/
    ├── logo.tsx                 # Logo component
    ├── navigation-links.tsx     # Navigation links
    ├── auth-buttons.tsx         # Authentication buttons
    ├── search-form.tsx          # Search form
    ├── mobile-menu.tsx          # Mobile menu
    ├── language-selector.tsx    # Language selector
    └── support-message.tsx     # Support message
```

## Usage

```tsx
import Header from "@/shared/components/header";

export default function Page() {
  return (
    <div>
      <Header />
      {/* Your content */}
    </div>
  );
}
```

## Customization

```tsx
// Hide search form
<Header showSearchForm={false} />

// Hide support message
<Header showSupportMessage={false} />

// Custom className
<Header className="shadow-md" />
```

## Feature Architecture Compliance

The header feature follows the same structure as other features in the project:

| Directory | Purpose | Example |
|-----------|---------|---------|
| `stores/` | Global state management | `header.store.ts` |
| `types/` | TypeScript definitions | `header.types.ts` |
| `hooks/` | Custom React hooks | `use-navigation.ts` |
| `components/` | UI components | `logo.tsx` |
| `constants.ts` | Configuration values | `NAV_LINKS` |

## Best Practices Followed

1. ✅ **Architecture**: Feature-based organization matching project structure
2. ✅ **Rendering**: Client component only where needed
3. ✅ **State**: Zustand for global state, hooks for logic
4. ✅ **Reusability**: Extract hooks and components
5. ✅ **Performance**: Memoization, optimized images
6. ✅ **Scalability**: Modular, isolated components
7. ✅ **Maintainability**: Clear patterns, readable code
8. ✅ **Type Safety**: All types in dedicated `types/` directory
9. ✅ **Separation**: Store, types, hooks, components all in respective directories

