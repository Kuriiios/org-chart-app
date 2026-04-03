import { describe, it, expect } from 'vitest';
import { mockCollaborators } from '../../data/mockCollaborators';
import { mockDepartments } from '../../data/mockDepartments';

describe('mockDepartments data integrity', () => {
  it('exports a non-empty array', () => {
    expect(mockDepartments.length).toBeGreaterThan(0);
  });

  it('every department has a unique id', () => {
    const ids = mockDepartments.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every department has a non-empty id and name', () => {
    for (const d of mockDepartments) {
      expect(d.id, `department.id must be truthy`).toBeTruthy();
      expect(d.name, `department.name must be truthy for id "${d.id}"`).toBeTruthy();
    }
  });

  it('all parentId references point to an existing department id', () => {
    const ids = new Set(mockDepartments.map(d => d.id));
    for (const d of mockDepartments.filter(dep => dep.parentId)) {
      expect(
        ids.has(d.parentId!),
        `Department "${d.id}" has unknown parentId "${d.parentId}"`,
      ).toBe(true);
    }
  });

  it('the hierarchy contains no cycles (every dept can reach a root)', () => {
    const idMap = Object.fromEntries(mockDepartments.map(d => [d.id, d]));
    for (const start of mockDepartments) {
      const seen = new Set<string>();
      let current = start;
      while (current.parentId) {
        expect(seen.has(current.id), `Cycle detected at department "${current.id}"`).toBe(false);
        seen.add(current.id);
        current = idMap[current.parentId];
      }
    }
  });
});

describe('mockCollaborators data integrity', () => {
  it('exports a non-empty array', () => {
    expect(mockCollaborators.length).toBeGreaterThan(0);
  });

  it('every collaborator has a unique id', () => {
    const ids = mockCollaborators.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every collaborator has a non-empty id, firstName, and lastName', () => {
    for (const c of mockCollaborators) {
      expect(c.id, 'collaborator.id must be truthy').toBeTruthy();
      expect(c.firstName, `firstName missing for id "${c.id}"`).toBeTruthy();
      expect(c.lastName, `lastName missing for id "${c.id}"`).toBeTruthy();
    }
  });

  it('all departmentId references point to an existing department', () => {
    const deptIds = new Set(mockDepartments.map(d => d.id));
    for (const c of mockCollaborators.filter(col => col.departmentId)) {
      expect(
        deptIds.has(c.departmentId!),
        `Collaborator "${c.id}" has unknown departmentId "${c.departmentId}"`,
      ).toBe(true);
    }
  });

  it('all managerId references point to an existing collaborator', () => {
    const collabIds = new Set(mockCollaborators.map(c => c.id));
    for (const c of mockCollaborators.filter(col => col.managerId)) {
      expect(
        collabIds.has(c.managerId!),
        `Collaborator "${c.id}" has unknown managerId "${c.managerId}"`,
      ).toBe(true);
    }
  });

  it('all directReportIds reference existing collaborators', () => {
    const collabIds = new Set(mockCollaborators.map(c => c.id));
    for (const c of mockCollaborators) {
      for (const reportId of c.directReportIds ?? []) {
        expect(
          collabIds.has(reportId),
          `Collaborator "${c.id}" has unknown directReportId "${reportId}"`,
        ).toBe(true);
      }
    }
  });

  it('manager/report relationships are consistent (if A reports to B, B lists A as report)', () => {
    const collabMap = Object.fromEntries(mockCollaborators.map(c => [c.id, c]));
    for (const c of mockCollaborators.filter(col => col.managerId)) {
      const manager = collabMap[c.managerId!];
      if (manager?.directReportIds) {
        expect(
          manager.directReportIds.includes(c.id),
          `Manager "${c.managerId}" does not list "${c.id}" as a direct report`,
        ).toBe(true);
      }
    }
  });
});
