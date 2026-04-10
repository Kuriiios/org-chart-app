import { describe, it, expect } from 'vitest';
import { mockDepartments } from '../data/mockDepartments';
import { mockCollaborators } from '../data/mockCollaborators';
import { getDescendantDepartmentIds, buildCollaboratorMap, getManager, getDirectReports } from '../utils/orgHelpers';

describe('orgHelpers', () => {
  it('getDescendantDepartmentIds returns root and its children', () => {
    const set = getDescendantDepartmentIds(mockDepartments, 'd2');
    // d2 has children d5 and d6
    expect(set.has('d2')).toBe(true);
    expect(set.has('d5')).toBe(true);
    expect(set.has('d6')).toBe(true);
    expect(set.size).toBe(3);
  });

  it('getDescendantDepartmentIds returns single id when no children', () => {
    const set = getDescendantDepartmentIds(mockDepartments, 'd10');
    expect(set.has('d10')).toBe(true);
    expect(set.size).toBe(1);
  });

  it('buildCollaboratorMap and getManager work correctly', () => {
    const map = buildCollaboratorMap(mockCollaborators);
    expect(map['c1']).toBeDefined();
    const c5 = map['c5'];
    const manager = getManager(c5, map);
    expect(manager).toBeDefined();
    expect(manager?.id).toBe('c2');
    // top-level has no manager
    expect(getManager(map['c1'], map)).toBeNull();
  });

  it('getDirectReports returns direct reports using directReportIds', () => {
    const map = buildCollaboratorMap(mockCollaborators);
    const c2 = map['c2'];
    const reports = getDirectReports(c2, mockCollaborators, map);
    const ids = reports.map(r => r.id).sort();
    expect(ids).toEqual(['c10', 'c31', 'c32', 'c5'].sort());
  });

  it('getDirectReports falls back to filtering by managerId when needed', () => {
    const map = buildCollaboratorMap(mockCollaborators);
    // some leaf collaborator (c8) has no directReportIds
    const c8 = map['c8'];
    const reports = getDirectReports(c8, mockCollaborators, map);
    expect(reports).toEqual([]);
  });
});
