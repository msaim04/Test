import { useCallback, useMemo } from "react";

/**
 * Generic form field handler creator
 * DRY principle: Single function to create handlers for any form field
 */
export function useFormFieldHandler<T extends string>(
  fieldName: T,
  updateFn: (form: Partial<Record<T, string>>) => void
) {
  return useCallback(
    (value: string) => {
      updateFn({ [fieldName]: value } as Partial<Record<T, string>>);
    },
    [fieldName, updateFn]
  );
}

/**
 * Creates memoized handlers for form fields
 * DRY: Reduces code duplication by generating handlers dynamically
 */
export function useFormFieldHandlers<T extends Record<string, string>>(
  updateFn: (form: Partial<T>) => void,
  fieldNames: Array<keyof T>
) {
  const handlers = useMemo(() => {
    return fieldNames.reduce(
      (acc, fieldName) => {
        acc[fieldName] = (value: string) => {
          updateFn({ [fieldName]: value } as Partial<T>);
        };
        return acc;
      },
      {} as Record<keyof T, (value: string) => void>
    );
  }, [updateFn, fieldNames]);

  return handlers;
}

