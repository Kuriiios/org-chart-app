import type { Department } from '../types/Department';
import type { Collaborator } from '../types/Collaborator';

/**
 * Return a set containing `rootId` and all descendant department ids (recursively).
 * Useful for scoping collaborators to a department and its sub-departments.
 */
export function getDescendantDepartmentIds(departments: Department[], rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const d of departments) {
      if (d.parentId && ids.has(d.parentId) && !ids.has(d.id)) {
        ids.add(d.id);
        changed = true;
      }
    }
  }
  return ids;
}

/**
 * Build a simple id → Collaborator lookup map.
 */
export function buildCollaboratorMap(collaborators: Collaborator[]): Record<string, Collaborator> {
  return Object.fromEntries(collaborators.map(c => [c.id, c])) as Record<string, Collaborator>;
}

/**
 * Return the manager Collaborator if present in the provided map, otherwise null.
 */
export function getManager(collaborator: Collaborator | null | undefined, collabMap: Record<string, Collaborator> | null | undefined): Collaborator | null {
  if (!collaborator || !collabMap) return null;
  if (!collaborator.managerId) return null;
  return collabMap[collaborator.managerId] ?? null;
}

/**
 * Return an array of direct report collaborators for the given collaborator.
 * Tries `directReportIds` first (preserves order), falls back to filtering by `managerId`.
 */
export function getDirectReports(
  collaborator: Collaborator | null | undefined,
  collaborators: Collaborator[],
  collabMap?: Record<string, Collaborator>
): Collaborator[] {
  if (!collaborator) return [];
  if (collaborator.directReportIds && collaborator.directReportIds.length > 0) {
    const map = collabMap ?? buildCollaboratorMap(collaborators);
    return collaborator.directReportIds.map(id => map[id]).filter(Boolean) as Collaborator[];
  }
  // fallback: find by managerId
  return collaborators.filter(c => c.managerId === collaborator.id);
}

export default {
  getDescendantDepartmentIds,
  buildCollaboratorMap,
  getManager,
  getDirectReports,
};
