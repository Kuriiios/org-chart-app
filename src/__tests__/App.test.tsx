import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import App from '../App';

// Mock external layout libraries that rely on browser rendering APIs not
// available in jsdom.
vi.mock('react-organizational-chart', () => {
  type OrgNodeProps = { children?: ReactNode; label?: ReactNode };
  return {
    Tree: ({ children, label }: OrgNodeProps) => (
      <div data-testid="org-tree">{label}{children}</div>
    ),
    TreeNode: ({ children, label }: OrgNodeProps) => (
      <div data-testid="org-tree-node">{label}{children}</div>
    ),
  };
});

vi.mock('react-zoom-pan-pinch', () => {
  type TransformHelpers = { zoomIn: () => void; zoomOut: () => void; resetTransform: () => void };
  type TransformChildren = ReactNode | ((helpers: TransformHelpers) => ReactNode);
  return {
    TransformWrapper: ({ children }: { children?: TransformChildren }) => {
      // TransformWrapper uses a render-prop pattern in production; handle both forms.
      const content = typeof children === 'function'
        ? (children as (helpers: TransformHelpers) => ReactNode)({ zoomIn: () => {}, zoomOut: () => {}, resetTransform: () => {} })
        : children;
      return <div data-testid="transform-wrapper">{content}</div>;
    },
    TransformComponent: ({ children }: { children?: ReactNode }) => (
      <div data-testid="transform-component">{children}</div>
    ),
  };
});

describe('App – integration', () => {
  it('renders the carousel view by default and shows a collaborator count', () => {
    render(<App />);
    // The welcome heading is only shown in carousel view when no dept is selected
    expect(screen.getByText('Bienvenue')).toBeInTheDocument();
    // Count paragraph, e.g. "36 collaborateurs" — narrow by tag to avoid the heading
    expect(
      screen.getByText(
        (content: string, element: Element | null) =>
          element?.tagName === 'P' && /\d/.test(content) && /collaborateur/i.test(content),
      ),
    ).toBeInTheDocument();
  });

  it('renders a person card for every collaborator in the carousel view', () => {
    render(<App />);
    // Each card is an <article>; we should have at least one
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('filters visible collaborator cards when a search term is entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByPlaceholderText('Rechercher un collaborateur');
    // Type a name that exists exactly once
    await user.type(input, 'Luc Dupont');
    const cards = screen.getAllByRole('article');
    // Only Luc Dupont's card should remain
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText('Luc Dupont')).toBeInTheDocument();
  });

  it('shows all cards again after the search term is cleared', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByPlaceholderText('Rechercher un collaborateur');
    await user.type(input, 'Luc Dupont');
    await user.click(screen.getByLabelText('Effacer la recherche'));
    expect(screen.getAllByRole('article').length).toBeGreaterThan(1);
  });

  it('scopes the carousel to the selected department when a sidebar item is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    const totalCards = screen.getAllByRole('article').length;
    // Click the "Finance" department in the sidebar — use first match to avoid card badges
    await user.click(screen.getAllByText('Finance')[0]);
    const filteredCards = screen.getAllByRole('article').length;
    expect(filteredCards).toBeGreaterThan(0);
    expect(filteredCards).toBeLessThan(totalCards);
  });

  it('opens the profile modal when a person card is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    // Click the article containing "Luc Dupont"
    const article = screen.getAllByRole('article').find((el: HTMLElement) =>
      within(el).queryByText('Luc Dupont') !== null,
    )!;
    await user.click(article);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // level:2 targets the modal <h2>, not the card <h3>
    expect(screen.getByRole('heading', { level: 2, name: 'Luc Dupont' })).toBeInTheDocument();
  });

  it('closes the profile modal when the Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const article = screen.getAllByRole('article').find((el: HTMLElement) =>
      within(el).queryByText('Luc Dupont') !== null,
    )!;
    await user.click(article);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the profile modal when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    const article = screen.getAllByRole('article').find((el: HTMLElement) =>
      within(el).queryByText('Luc Dupont') !== null,
    )!;
    await user.click(article);
    await user.click(screen.getByLabelText('Fermer'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches to the overview (org tree) view when the sidebar nav item is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Vue d'ensemble"));
    expect(screen.getByTestId('org-tree')).toBeInTheDocument();
    // Carousel welcome heading should be gone
    expect(screen.queryByText('Bienvenue')).not.toBeInTheDocument();
  });

  it('navigates to another collaborator profile from within the modal', async () => {
    const user = userEvent.setup();
    render(<App />);
    // Open Luc Dupont's profile (he has direct reports)
    const article = screen.getAllByRole('article').find((el: HTMLElement) =>
      within(el).queryByText('Luc Dupont') !== null,
    )!;
    await user.click(article);
    expect(screen.getByRole('heading', { level: 2, name: 'Luc Dupont' })).toBeInTheDocument();
    // Click one of Luc's direct reports listed in the modal
    const directReportsSection = screen.getByText(/Collaborateurs directs/i).parentElement!;
    const firstReport = within(directReportsSection).getAllByRole('button')[0];
    await user.click(firstReport);
    // The modal should now show a different collaborator — level:2 targets the modal <h2>
    expect(screen.queryByRole('heading', { level: 2, name: 'Luc Dupont' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
