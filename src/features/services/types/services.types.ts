/**
 * Services Types
 * Type definitions for services feature
 */

export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  description: string;
}

/**
 * Categories API Response
 * Based on actual API documentation:
 * - 200 OK: Returns array of categories directly [{ id, name, icon, image, description }]
 * - Other errors: Standard error response
 */
export type CategoriesResponse = Category[];

