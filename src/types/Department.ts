// Department domain model for the org chart application.
export interface Department {
  // unique identifier
  id: string;
  // display name (e.g. "Finance")
  name: string;
  // short slug for routing/filtering (e.g. "finance")
  slug?: string;
  // id of the parent department (undefined for root departments)
  parentId?: string;
  // Bold Tailwind classes for large accents: department banner, sidebar strip
  // Example: "bg-green-600 text-white"
  colorClass?: string;
  // Soft Tailwind classes for small inline badges inside cards
  // Example: "bg-green-100 text-green-800"
  badgeClass?: string;
}
