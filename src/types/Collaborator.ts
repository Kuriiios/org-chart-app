// Collaborator domain model for the org chart application.
// Fields are intentionally simple and include examples for beginners.
export interface Collaborator {
  // unique identifier for the collaborator
  id: string;
  // given name (e.g. "Jean")
  firstName: string;
  // family name (e.g. "Moreau")
  lastName: string;
  // optional convenience field: full display name (e.g. "Jean Moreau")
  fullName?: string;
  // job title (e.g. "Directeur Financier")
  title?: string;
  // department id reference (e.g. "finance")
  departmentId?: string;
  // department display name (duplicated for convenience)
  departmentName?: string;
  // contact email
  email?: string;
  // link to a photo or avatar
  photoUrl?: string;
  // id of the manager (parent) in the org tree
  managerId?: string;
  // numeric tier in the hierarchy tree (1 = top level, larger numbers are deeper levels)
  hierarchyTier?: number;
  // list of direct report ids
  directReportIds?: string[];
}
