// Content type constants
export const PROJECT_TYPES = ['creative', 'technical'] as const;
export type ProjectType = typeof PROJECT_TYPES[number];

export const BLOG_CATEGORIES = ['development', 'design', 'thoughts', 'tutorial'] as const;
export type BlogCategory = typeof BLOG_CATEGORIES[number];

// Date utilities
export const currentYear = new Date().getFullYear();

// Validation helpers
export function isValidProjectType(type: string): type is ProjectType {
  return PROJECT_TYPES.includes(type as ProjectType);
}

export function isValidYear(year: number): boolean {
  return year >= 2005 && year <= currentYear;
}
