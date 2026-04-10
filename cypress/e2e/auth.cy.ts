// Auth-related E2E tests
// These tests run under Cypress and assert the app does not auto-redirect
// to Microsoft while under E2E, and that the login UI is accessible.

describe('Auth (E2E)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('does not auto-redirect to Microsoft login under Cypress', () => {
    // The redirect UI should not be shown when running inside Cypress
    cy.contains('Redirecting to Microsoft login…').should('not.exist');

    // Main app content should be visible
    cy.contains('Organigramme').should('be.visible');
    cy.contains('Bienvenue').should('be.visible');
  });

});
