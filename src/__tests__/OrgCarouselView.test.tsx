import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { OrgCarouselView } from '../components/OrgCarouselView';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';

const deptMap: Record<string, Department> = {
  d1: { id: 'd1', name: 'Finance', colorClass: 'bg-green-600 text-white', badgeClass: 'bg-green-100 text-green-800' },
};

const collaborators: Collaborator[] = [
  { id: 'c1', firstName: 'Jean', lastName: 'Moreau', fullName: 'Jean Moreau', title: 'Directeur', departmentId: 'd1' },
  { id: 'c2', firstName: 'Marie', lastName: 'Curie', fullName: 'Marie Curie', title: 'Analyste', departmentId: 'd1' },
];

describe('OrgCarouselView', () => {
  it('shows the empty state message when there are no collaborators', () => {
    render(<OrgCarouselView collaborators={[]} deptMap={deptMap} onSelectCollaborator={vi.fn()} />);
    expect(screen.getByText(/Aucun collaborateur/i)).toBeInTheDocument();
  });

  it('renders one card per collaborator', () => {
    render(
      <OrgCarouselView collaborators={collaborators} deptMap={deptMap} onSelectCollaborator={vi.fn()} />,
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('renders each collaborator name', () => {
    render(
      <OrgCarouselView collaborators={collaborators} deptMap={deptMap} onSelectCollaborator={vi.fn()} />,
    );
    expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
  });

  it('calls onSelectCollaborator with the correct id when a card is clicked', async () => {
    const user = userEvent.setup();
    const onSelectCollaborator = vi.fn();
    render(
      <OrgCarouselView
        collaborators={collaborators}
        deptMap={deptMap}
        onSelectCollaborator={onSelectCollaborator}
      />,
    );
    await user.click(screen.getByText('Jean Moreau'));
    expect(onSelectCollaborator).toHaveBeenCalledWith('c1');
  });

  it('does not render the empty state when collaborators are present', () => {
    render(
      <OrgCarouselView collaborators={collaborators} deptMap={deptMap} onSelectCollaborator={vi.fn()} />,
    );
    expect(screen.queryByText(/Aucun collaborateur/i)).not.toBeInTheDocument();
  });
});
