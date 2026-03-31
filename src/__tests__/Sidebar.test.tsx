import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../components/Sidebar';
import type { Department } from '../types/Department';
import type { Collaborator } from '../types/Collaborator';

const departments: Department[] = [
  { id: 'd1', name: 'Direction Générale', colorClass: 'bg-purple-600 text-white', badgeClass: 'bg-purple-100 text-purple-800' },
  // d2 is a child of d1 — should be hidden until d1 is expanded
  { id: 'd2', name: 'Technologie', parentId: 'd1', colorClass: 'bg-blue-600 text-white', badgeClass: 'bg-blue-100 text-blue-800' },
  { id: 'd3', name: 'Finance', colorClass: 'bg-green-600 text-white', badgeClass: 'bg-green-100 text-green-800' },
];

const collaborators: Collaborator[] = [
  { id: 'c1', firstName: 'Alice', lastName: 'A', departmentId: 'd1' },
  { id: 'c2', firstName: 'Bob', lastName: 'B', departmentId: 'd2' },
  { id: 'c3', firstName: 'Charlie', lastName: 'C', departmentId: 'd3' },
];

function makeProps(overrides: Partial<Parameters<typeof Sidebar>[0]> = {}) {
  return {
    departments,
    collaborators,
    selectedDepartmentId: null as string | null,
    onSelectDepartment: vi.fn(),
    activeView: 'carousel' as const,
    onChangeView: vi.fn(),
    ...overrides,
  };
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both navigation items', () => {
    render(<Sidebar {...makeProps()} />);
    expect(screen.getByText('Carrousel')).toBeInTheDocument();
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
  });

  it('shows the Accueil badge on the Carrousel nav item', () => {
    render(<Sidebar {...makeProps()} />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
  });

  it('renders all root-level departments', () => {
    render(<Sidebar {...makeProps()} />);
    expect(screen.getByText('Direction Générale')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('does not render child departments before the parent is expanded', () => {
    render(<Sidebar {...makeProps()} />);
    expect(screen.queryByText('Technologie')).not.toBeInTheDocument();
  });

  it('expands children when a parent department is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...makeProps()} />);
    await user.click(screen.getByText('Direction Générale'));
    expect(screen.getByText('Technologie')).toBeInTheDocument();
  });

  it('collapses children when an expanded parent is clicked again', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...makeProps()} />);
    await user.click(screen.getByText('Direction Générale'));
    expect(screen.getByText('Technologie')).toBeInTheDocument();
    await user.click(screen.getByText('Direction Générale'));
    expect(screen.queryByText('Technologie')).not.toBeInTheDocument();
  });

  it('calls onSelectDepartment with the correct id when a department is clicked', async () => {
    const user = userEvent.setup();
    const onSelectDepartment = vi.fn();
    render(<Sidebar {...makeProps({ onSelectDepartment })} />);
    await user.click(screen.getByText('Finance'));
    expect(onSelectDepartment).toHaveBeenCalledWith('d3');
  });

  it('clicking a nav item calls onChangeView with the correct view', async () => {
    const user = userEvent.setup();
    const onChangeView = vi.fn();
    render(<Sidebar {...makeProps({ onChangeView })} />);
    await user.click(screen.getByText("Vue d'ensemble"));
    expect(onChangeView).toHaveBeenCalledWith('overview');
  });

  it('clicking a nav item clears the selected department', async () => {
    const user = userEvent.setup();
    const onSelectDepartment = vi.fn();
    render(<Sidebar {...makeProps({ onSelectDepartment })} />);
    await user.click(screen.getByText('Carrousel'));
    expect(onSelectDepartment).toHaveBeenCalledWith(null);
  });

  it('shows the collaborator count including sub-departments next to each department', () => {
    render(<Sidebar {...makeProps()} />);
    // Direction Générale: c1 (d1) + c2 (d2 sub-dept) = 2
    // Finance: c3 (d3) = 1
    const countEls = screen.getAllByText(/^\d+$/);
    const values = countEls.map(el => el.textContent);
    expect(values).toContain('2'); // Direction Générale (includes sub-dept Technologie count)
    expect(values).toContain('1'); // Finance
  });

  it('marks the active nav item as selected when no department is chosen', () => {
    render(<Sidebar {...makeProps({ activeView: 'overview', selectedDepartmentId: null })} />);
    const overviewBtn = screen.getByText("Vue d'ensemble").closest('button');
    expect(overviewBtn?.className).toContain('bg-slate-900');
  });
});
