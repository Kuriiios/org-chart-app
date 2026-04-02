import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { ProfileModal } from '../components/ProfileModal';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';

const manager: Collaborator = {
  id: 'm1',
  firstName: 'Luc',
  lastName: 'Dupont',
  fullName: 'Luc Dupont',
  title: 'Directeur Général',
  departmentId: 'd1',
};

const directReport: Collaborator = {
  id: 'dr1',
  firstName: 'Marie',
  lastName: 'Durand',
  fullName: 'Marie Durand',
  title: 'Analyste',
  departmentId: 'd3',
};

const collab: Collaborator = {
  id: 'c1',
  firstName: 'Jean',
  lastName: 'Moreau',
  fullName: 'Jean Moreau',
  title: 'Directeur Financier',
  departmentId: 'd3',
  email: 'jean.moreau@example.com',
  managerId: 'm1',
  directReportIds: ['dr1'],
};

const dept: Department = {
  id: 'd3',
  name: 'Finance',
  colorClass: 'bg-green-600 text-white',
  badgeClass: 'bg-green-100 text-green-800',
};

function makeProps(overrides: Partial<Parameters<typeof ProfileModal>[0]> = {}) {
  return {
    collaborator: collab,
    manager,
    directReports: [directReport],
    department: dept,
    isOpen: true,
    onClose: vi.fn(),
    onSelectCollaborator: vi.fn(),
    ...overrides,
  };
}

describe('ProfileModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ProfileModal {...makeProps({ isOpen: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when collaborator is null', () => {
    const { container } = render(<ProfileModal {...makeProps({ collaborator: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the collaborator name when open', () => {
    render(<ProfileModal {...makeProps()} />);
    expect(screen.getByRole('heading', { name: 'Jean Moreau' })).toBeInTheDocument();
  });

  it('renders the collaborator title', () => {
    render(<ProfileModal {...makeProps()} />);
    expect(screen.getByText('Directeur Financier')).toBeInTheDocument();
  });

  it('renders the department name as a badge', () => {
    render(<ProfileModal {...makeProps()} />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('renders the email as a mailto link', () => {
    render(<ProfileModal {...makeProps()} />);
    const link = screen.getByRole('link', { name: /jean.moreau@example.com/i });
    expect(link).toHaveAttribute('href', 'mailto:jean.moreau@example.com');
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ProfileModal {...makeProps({ onClose })} />);
    await user.click(screen.getByLabelText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop overlay is clicked', () => {
    const onClose = vi.fn();
    render(<ProfileModal {...makeProps({ onClose })} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when the modal panel content is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ProfileModal {...makeProps({ onClose })} />);
    // The heading is inside the panel which stops propagation
    await user.click(screen.getByRole('heading', { name: 'Jean Moreau' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<ProfileModal {...makeProps({ onClose })} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose on Escape when modal is already closed', () => {
    const onClose = vi.fn();
    render(<ProfileModal {...makeProps({ isOpen: false, onClose })} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows the manager section with the manager name', () => {
    render(<ProfileModal {...makeProps()} />);
    expect(screen.getByText('Luc Dupont')).toBeInTheDocument();
    expect(screen.getByText(/Responsable/i)).toBeInTheDocument();
  });

  it('does not show the manager section when manager is null', () => {
    render(<ProfileModal {...makeProps({ manager: null })} />);
    expect(screen.queryByText('Luc Dupont')).not.toBeInTheDocument();
    expect(screen.queryByText(/Responsable/i)).not.toBeInTheDocument();
  });

  it('shows the direct reports section with report names', () => {
    render(<ProfileModal {...makeProps()} />);
    expect(screen.getByText('Marie Durand')).toBeInTheDocument();
    expect(screen.getByText(/Collaborateurs directs/i)).toBeInTheDocument();
  });

  it('does not show the direct reports section when the list is empty', () => {
    render(<ProfileModal {...makeProps({ directReports: [] })} />);
    expect(screen.queryByText(/Collaborateurs directs/i)).not.toBeInTheDocument();
  });

  it('calls onSelectCollaborator with the manager id when the manager is clicked', async () => {
    const user = userEvent.setup();
    const onSelectCollaborator = vi.fn();
    render(<ProfileModal {...makeProps({ onSelectCollaborator })} />);
    await user.click(screen.getByText('Luc Dupont'));
    expect(onSelectCollaborator).toHaveBeenCalledWith('m1');
  });

  it('calls onSelectCollaborator with the direct report id when a report is clicked', async () => {
    const user = userEvent.setup();
    const onSelectCollaborator = vi.fn();
    render(<ProfileModal {...makeProps({ onSelectCollaborator })} />);
    await user.click(screen.getByText('Marie Durand'));
    expect(onSelectCollaborator).toHaveBeenCalledWith('dr1');
  });

  it('has role="dialog" and aria-modal="true" for accessibility', () => {
    render(<ProfileModal {...makeProps()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
