import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { PersonCard } from '../components/PersonCard';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';

const collab: Collaborator = {
  id: 'c1',
  firstName: 'Jean',
  lastName: 'Moreau',
  fullName: 'Jean Moreau',
  title: 'Directeur Financier',
  departmentId: 'd3',
  departmentName: 'Finance',
  email: 'jean.moreau@example.com',
};

const dept: Department = {
  id: 'd3',
  name: 'Finance',
  colorClass: 'bg-green-600 text-white',
  badgeClass: 'bg-green-100 text-green-800',
};

describe('PersonCard – compact variant (default)', () => {
  it('renders the collaborator name', () => {
    render(<PersonCard collaborator={collab} department={dept} />);
    expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
  });

  it('renders the collaborator title', () => {
    render(<PersonCard collaborator={collab} department={dept} />);
    expect(screen.getByText('Directeur Financier')).toBeInTheDocument();
  });

  it('renders the department name as a badge', () => {
    render(<PersonCard collaborator={collab} department={dept} />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('renders a mailto email link', () => {
    render(<PersonCard collaborator={collab} department={dept} />);
    const link = screen.getByRole('link', { name: /jean.moreau@example.com/i });
    expect(link).toHaveAttribute('href', 'mailto:jean.moreau@example.com');
  });

  it('calls onClick when the card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PersonCard collaborator={collab} department={dept} onClick={onClick} />);
    await user.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses fullName when provided instead of firstName + lastName', () => {
    render(<PersonCard collaborator={{ ...collab, fullName: 'Full Name Override' }} department={dept} />);
    expect(screen.getByText('Full Name Override')).toBeInTheDocument();
  });

  it('derives the display name from firstName + lastName when fullName is absent', () => {
    render(<PersonCard collaborator={{ ...collab, fullName: undefined }} department={dept} />);
    expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
  });
});

describe('PersonCard – carousel variant', () => {
  it('renders the collaborator name in carousel variant', () => {
    render(<PersonCard collaborator={collab} department={dept} variant="carousel" />);
    expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
  });

  it('renders the collaborator title in carousel variant', () => {
    render(<PersonCard collaborator={collab} department={dept} variant="carousel" />);
    expect(screen.getByText('Directeur Financier')).toBeInTheDocument();
  });

  it('renders the department badge in carousel variant', () => {
    render(<PersonCard collaborator={collab} department={dept} variant="carousel" />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('renders a mailto email link in carousel variant', () => {
    render(<PersonCard collaborator={collab} department={dept} variant="carousel" />);
    const link = screen.getByRole('link', { name: /jean.moreau@example.com/i });
    expect(link).toHaveAttribute('href', 'mailto:jean.moreau@example.com');
  });

  it('calls onClick when the carousel card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PersonCard collaborator={collab} department={dept} variant="carousel" onClick={onClick} />);
    await user.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when the email link is clicked (stops propagation)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PersonCard collaborator={collab} department={dept} variant="carousel" onClick={onClick} />);
    await user.click(screen.getByRole('link', { name: /jean.moreau@example.com/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
