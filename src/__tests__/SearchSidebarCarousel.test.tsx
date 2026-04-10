import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../components/Sidebar';
import OrgCarouselView from '../components/OrgCarouselView';
import TopSearchBar from '../components/TopSearchBar';
import { mockDepartments } from '../data/mockDepartments';
import { mockCollaborators } from '../data/mockCollaborators';
import { getDescendantDepartmentIds } from '../utils/orgHelpers';

describe('Search + Sidebar + Carousel integration', () => {
  it('scopes carousel to selected department and search term', async () => {
    const user = userEvent.setup();

    const TestApp: React.FC = () => {
      const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | null>(null);
      const [activeView, setActiveView] = React.useState<'overview' | 'carousel'>('carousel');
      const [searchTerm, setSearchTerm] = React.useState('');

      const departments = mockDepartments;
      const collaborators = mockCollaborators;

      const selectedDeptIds = selectedDepartmentId ? getDescendantDepartmentIds(departments as any, selectedDepartmentId) : null;
      const scoped = selectedDeptIds
        ? collaborators.filter(c => c.departmentId != null && selectedDeptIds.has(c.departmentId))
        : collaborators;

      const filtered = searchTerm.trim()
        ? scoped.filter(c =>
            (c.fullName ?? `${c.firstName} ${c.lastName}`).toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            (c.title ?? '').toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            (c.departmentName ?? '').toLowerCase().includes(searchTerm.trim().toLowerCase())
          )
        : scoped;

      const deptMap = Object.fromEntries(departments.map(d => [d.id, d])) as Record<string, any>;

      return (
        <div>
          <Sidebar
            departments={departments}
            collaborators={collaborators}
            selectedDepartmentId={selectedDepartmentId}
            onSelectDepartment={setSelectedDepartmentId}
            activeView={activeView}
            onChangeView={setActiveView}
          />

          <TopSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <OrgCarouselView collaborators={filtered} deptMap={deptMap} onSelectCollaborator={() => {}} />
        </div>
      );
    };

    render(<TestApp />);

    // Initially we should have multiple cards
    const initialCount = screen.getAllByRole('article').length;
    expect(initialCount).toBeGreaterThan(1);

    // Select a department from the sidebar (first matching element)
    await user.click(screen.getAllByText('Finance')[0]);
    const afterDeptCount = screen.getAllByRole('article').length;
    expect(afterDeptCount).toBeGreaterThan(0);
    expect(afterDeptCount).toBeLessThan(initialCount);

    // Type a search term that matches exactly one collaborator in Finance
    await user.type(screen.getByPlaceholderText('Rechercher un collaborateur'), 'Jean Moreau');
    const searchCount = screen.getAllByRole('article').length;
    expect(searchCount).toBe(1);

    // Clear the search and ensure we go back to department-scoped count
    await user.click(screen.getByLabelText('Effacer la recherche'));
    const clearedCount = screen.getAllByRole('article').length;
    expect(clearedCount).toBe(afterDeptCount);
  });
});
