import { useCallback, useMemo } from "react";
import { useHeaderStore } from "../stores/header.store";

/**
 * Custom hook for search form logic
 * Encapsulates search form state management
 * Uses DRY principle with generic form handlers
 */
export function useSearchForm() {
  const { searchForm, setSearchForm, resetSearchForm } = useHeaderStore();

  // Generic handler creator - DRY: One function handles all fields
  const createFieldHandler = useCallback(
    (fieldName: keyof typeof searchForm) => (value: string) => {
      setSearchForm({ [fieldName]: value });
    },
    [setSearchForm]
  );

  // Memoized handlers for each field using the generic creator
  const handleLocationChange = useMemo(
    () => createFieldHandler("location"),
    [createFieldHandler]
  );

  const handleStartTimeChange = useMemo(
    () => createFieldHandler("startTime"),
    [createFieldHandler]
  );

  const handleCategoryChange = useMemo(
    () => createFieldHandler("category"),
    [createFieldHandler]
  );

  const handleSubmit = useCallback(() => {
    // Handle search submission
    console.log("Search submitted:", searchForm);
    // You can add navigation or API call here
  }, [searchForm]);

  return {
    searchForm,
    handleLocationChange,
    handleStartTimeChange,
    handleCategoryChange,
    handleSubmit,
    resetSearchForm,
  };
}

