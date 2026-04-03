import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // vite preview serves the production build on 4173 — used in both CI and local runs.
    // Start the server first: `npm run build && npm run preview`
    baseUrl: 'http://localhost:4173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    // Prevent browser code from reading Cypress.env() values.
    allowCypressEnv: false,
  },
});
