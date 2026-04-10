// Org Chart App — end-to-end tests
// Assumes the app is running at baseUrl (http://localhost:4173 via `vite preview`)

describe('App shell', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the app title in the header', () => {
    cy.contains('Organigramme').should('be.visible');
  });

  it('shows the welcome heading and collaborator count in carousel view by default', () => {
    cy.contains('Bienvenue').should('be.visible');
    cy.contains(/\d+ collaborateurs?/i).should('be.visible');
  });

  it('renders at least one person card', () => {
    cy.get('article').should('have.length.greaterThan', 0);
  });
});

describe('Search', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('filters cards when a name is typed in the search bar', () => {
    cy.get('article').its('length').then(total => {
      cy.get('input[placeholder="Rechercher un collaborateur"]').type('Luc Dupont');
      cy.get('article').should('have.length', 1);
      cy.get('article').should('contain.text', 'Luc Dupont');
      // total is captured before; just verify we narrowed down
      expect(total).to.be.greaterThan(1);
    });
  });

  it('clears the search with the × button and restores all cards', () => {
    cy.get('input[placeholder="Rechercher un collaborateur"]').type('Luc');
    cy.get('[aria-label="Effacer la recherche"]').click();
    cy.get('input[placeholder="Rechercher un collaborateur"]').should('have.value', '');
    cy.get('article').should('have.length.greaterThan', 1);
  });

  it('shows no cards for a search that matches nothing', () => {
    cy.get('input[placeholder="Rechercher un collaborateur"]').type('zzz_no_match_zzz');
    cy.contains(/Aucun collaborateur/i).should('be.visible');
  });
});

describe('Sidebar navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('switches to org-tree view when "Vue d\'ensemble" is clicked', () => {
    cy.contains("Vue d'ensemble").click();
    cy.contains('Bienvenue').should('not.exist');
    // The tree root node should be visible
    cy.get('[data-testid="org-tree"], .rst__tree, svg, [class*="Tree"]').should('exist');
  });

  it('switches back to carousel view when "Accueil" is clicked', () => {
    cy.contains("Vue d'ensemble").click();
    cy.contains('Accueil').click();
    cy.contains('Bienvenue').should('be.visible');
  });

  it('filters cards to a department subset when a sidebar department is clicked', () => {
    cy.get('article').its('length').then(totalCards => {
      // "Finance" is a root-level department in the sidebar
      cy.get('aside').contains('Finance').click();
      cy.get('article').should('have.length.lessThan', totalCards);
      cy.get('article').should('have.length.greaterThan', 0);
    });
  });
});

describe('Profile modal', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('opens the profile modal when a person card is clicked', () => {
    cy.get('article').first().click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('shows the collaborator name inside the modal', () => {
    // Search for a specific person so we know exactly what's in the modal
    cy.get('input[placeholder="Rechercher un collaborateur"]').type('Luc Dupont');
    cy.get('article').should('have.length', 1).click();
    cy.get('[role="dialog"]').within(() => {
      cy.contains('h2', 'Luc Dupont').should('be.visible');
    });
  });

  it('closes the modal with the close button', () => {
    cy.get('article').first().click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[aria-label="Fermer"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('closes the modal when the Escape key is pressed', () => {
    cy.get('article').first().click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('closes the modal when the backdrop is clicked', () => {
    cy.get('article').first().click();
    cy.get('[role="dialog"]').should('be.visible');
    // Click the dialog overlay itself (not the inner panel)
    cy.get('[role="dialog"]').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
  });
});

describe('Accessibility basics', () => {
  it('has a visible page heading', () => {
    cy.visit('/');
    cy.get('header').should('be.visible');
    cy.contains('Organigramme').should('be.visible');
  });

  it('search input is keyboard-reachable', () => {
    cy.visit('/');
    cy.get('input[placeholder="Rechercher un collaborateur"]').focus().should('be.focused');
  });
});
