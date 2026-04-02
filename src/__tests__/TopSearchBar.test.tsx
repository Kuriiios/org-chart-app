import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TopSearchBar } from '../components/TopSearchBar';

describe('TopSearchBar', () => {
  it('renders the search input with the correct placeholder', () => {
    render(<TopSearchBar searchTerm="" onSearchChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Rechercher un collaborateur')).toBeInTheDocument();
  });

  it('displays the current searchTerm value in the input', () => {
    render(<TopSearchBar searchTerm="Jean" onSearchChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
  });

  it('calls onSearchChange with the typed character', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<TopSearchBar searchTerm="" onSearchChange={onSearchChange} />);
    await user.type(screen.getByPlaceholderText('Rechercher un collaborateur'), 'M');
    expect(onSearchChange).toHaveBeenCalledWith('M');
  });

  it('does not render a clear button when searchTerm is empty', () => {
    render(<TopSearchBar searchTerm="" onSearchChange={vi.fn()} />);
    expect(screen.queryByLabelText('Effacer la recherche')).not.toBeInTheDocument();
  });

  it('shows the clear button when searchTerm is non-empty', () => {
    render(<TopSearchBar searchTerm="test" onSearchChange={vi.fn()} />);
    expect(screen.getByLabelText('Effacer la recherche')).toBeInTheDocument();
  });

  it('calls onSearchChange with an empty string when the clear button is clicked', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<TopSearchBar searchTerm="test" onSearchChange={onSearchChange} />);
    await user.click(screen.getByLabelText('Effacer la recherche'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
