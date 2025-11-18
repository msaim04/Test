import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { HeaderState } from "../types/header.types";

/**
 * Header store
 * Global state management for header feature using Zustand
 * 
 * Performance optimizations:
 * - Persisted state for language and search form (cached in localStorage)
 * - Mobile menu state is ephemeral (resets on page reload)
 * - Optimized state updates with shallow comparison
 */
export const useHeaderStore = create<HeaderState>()(
  persist(
    (set) => ({
      // Mobile menu (ephemeral - not persisted)
      isMobileMenuOpen: false,
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      // Language (persisted for user preference)
      language: "en",
      setLanguage: (lang) => {
        // Only update if language actually changed
        set((state) => {
          if (state.language === lang) return state;
          return { language: lang };
        });
      },

      // Search form (persisted for better UX)
      searchForm: {
        location: "",
        startTime: "",
        category: "",
      },
      setSearchForm: (form) =>
        set((state) => {
          // Shallow comparison to prevent unnecessary updates
          const newForm = { ...state.searchForm, ...form };
          const hasChanges = 
            newForm.location !== state.searchForm.location ||
            newForm.startTime !== state.searchForm.startTime ||
            newForm.category !== state.searchForm.category;
          
          if (!hasChanges) return state;
          return { searchForm: newForm };
        }),
      resetSearchForm: () =>
        set((state) => {
          // Only reset if form has values
          const hasValues = 
            state.searchForm.location ||
            state.searchForm.startTime ||
            state.searchForm.category;
          
          if (!hasValues) return state;
          
          return {
          searchForm: {
            location: "",
            startTime: "",
            category: "",
          },
          };
        }),
    }),
    {
      name: "header-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist language and search form, not mobile menu state
      partialize: (state) => ({
        language: state.language,
        searchForm: state.searchForm,
      }),
      // Skip hydration if localStorage is not available (SSR)
      skipHydration: typeof window === 'undefined',
    }
  )
);

