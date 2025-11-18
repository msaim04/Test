/**
 * Auth Keyword Matcher Utilities
 * Helper functions to simplify keyword checking instead of long || chains
 * Makes code more maintainable and readable
 */

/**
 * Check if message contains any of the provided keywords (case-insensitive)
 */
export function containsAnyKeyword(message: string, keywords: readonly string[] | string[]): boolean {
  if (!message || keywords.length === 0) return false;
  
  const messageLower = message.toLowerCase();
  return keywords.some((keyword) => messageLower.includes(keyword.toLowerCase()));
}

/**
 * Check if message contains all of the provided keywords (case-insensitive)
 */
export function containsAllKeywords(message: string, keywords: string[]): boolean {
  if (!message || keywords.length === 0) return false;
  
  const messageLower = message.toLowerCase();
  return keywords.every((keyword) => messageLower.includes(keyword.toLowerCase()));
}

/**
 * Check if value matches any of the provided values (case-insensitive)
 */
export function matchesAnyValue(value: string | number | boolean | null | undefined, values: (string | number | boolean)[]): boolean {
  if (value === null || value === undefined) return false;
  
  const valueStr = String(value).toLowerCase();
  return values.some((val) => String(val).toLowerCase() === valueStr);
}

/**
 * Check if value is one of the provided exact values (case-sensitive)
 */
export function isOneOf<T>(value: T, values: T[]): boolean {
  return values.includes(value);
}

/**
 * Check if any property in object matches any of the provided values
 */
export function hasAnyPropertyValue(
  obj: Record<string, unknown>,
  properties: string[],
  values: (string | number | boolean)[]
): boolean {
  if (!obj) return false;
  
  return properties.some((prop) => {
    const propValue = obj[prop];
    if (propValue === undefined || propValue === null) return false;
    // Type guard: ensure propValue is string, number, or boolean
    if (typeof propValue === 'string' || typeof propValue === 'number' || typeof propValue === 'boolean') {
      return matchesAnyValue(propValue, values);
    }
    return false;
  });
}

/**
 * Check if any property in object equals any of the provided values (exact match)
 */
export function hasAnyPropertyExact(
  obj: Record<string, unknown>,
  properties: string[],
  values: (string | number | boolean)[]
): boolean {
  if (!obj) return false;
  
  return properties.some((prop) => {
    const propValue = obj[prop];
    if (propValue === undefined || propValue === null) return false;
    // Type guard: ensure propValue is string, number, or boolean
    if (typeof propValue === 'string' || typeof propValue === 'number' || typeof propValue === 'boolean') {
      return isOneOf(propValue, values);
    }
    return false;
  });
}

