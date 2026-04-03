import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContextBar } from '../components/ContextBar';
import type { Department } from '../types/Department';

const departments: Department[] = [
  { id: 'd1', name: 'Direction Générale', slug: 'direction-generale', colorClass: 'bg-purple-600' },
  { id: 'd2', name: 'Technologie', parentId: 'd1', colorClass: 'bg-blue-600' },
  { id: 'd3', name: 'Frontend', parentId: 'd2', colorClass: 'bg-sky-500' },
];

describe('ContextBar', () => {
  it('shows "Tous les départements" when no department is selected', () => {
    render(
      <ContextBar activeView="carousel" selectedDepartmentId={null} departments={departments} />,
    );
    expect(screen.getByText(/Tous les départements/i)).toBeInTheDocument();
  });

  it('shows the selected department name in the breadcrumb', () => {
    render(
      <ContextBar activeView="carousel" selectedDepartmentId="d2" departments={departments} />,
    );
    expect(screen.getByText('Technologie')).toBeInTheDocument();
  });

  it('builds the full ancestor breadcrumb path for a deeply nested department', () => {
    render(
      <ContextBar activeView="carousel" selectedDepartmentId="d3" departments={departments} />,
    );
    expect(screen.getByText('Direction Générale')).toBeInTheDocument();
    expect(screen.getByText('Technologie')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('renders the breadcrumb nav with an accessible aria-label', () => {
    render(
      <ContextBar activeView="carousel" selectedDepartmentId="d2" departments={departments} />,
    );
    expect(screen.getByRole('navigation', { name: /Fil d'Ariane/i })).toBeInTheDocument();
  });

  it('renders breadcrumb separators between ancestor segments', () => {
    render(
      <ContextBar activeView="carousel" selectedDepartmentId="d3" departments={departments} />,
    );
    // Two separators for three segments
    const separators = screen.getAllByText('›');
    expect(separators.length).toBe(2);
  });
});
