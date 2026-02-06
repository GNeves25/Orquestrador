// ***********************************************
// E2E Testing Support File
// ***********************************************

// Import commands
import './commands';

// Global before hook
before(() => {
    // Clear any existing data
    cy.clearCookies();
    cy.clearLocalStorage();
});

// Global beforeEach hook
beforeEach(() => {
    // Intercept API calls to prevent actual backend calls during tests
    cy.intercept('GET', '**/api/projects', { fixture: 'projects.json' }).as('getProjects');
    cy.intercept('GET', '**/api/tasks', { body: [] }).as('getTasks');
    cy.intercept('GET', '**/api/team-members*', { fixture: 'team-members.json' }).as('getTeamMembers');
});

// Global error handler
Cypress.on('uncaught:exception', (err, runnable) => {
    // Returning false here prevents Cypress from failing the test
    // Only for specific expected errors
    if (err.message.includes('ResizeObserver')) {
        return false;
    }

    // Let other errors fail the test
    return true;
});
