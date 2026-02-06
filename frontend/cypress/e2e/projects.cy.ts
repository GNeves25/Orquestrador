describe('Projects E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/');
        // Wait for dashboard to load
        cy.get('.dashboard').should('be.visible');
    });

    it('should open "Novo Projeto" modal when button is clicked', () => {
        // Click the "+ Novo Projeto" button
        cy.get('.section').first().within(() => {
            cy.get('.btn-primary').contains('Novo Projeto').click();
        });

        // Verify modal is visible
        cy.get('app-create-project').should('be.visible');
    });

    it('should display all form fields in project modal', () => {
        // Open modal
        cy.get('.section').first().within(() => {
            cy.get('.btn-primary').contains('Novo Projeto').click();
        });

        // Verify form fields exist
        cy.get('app-create-project').within(() => {
            cy.get('input[name="name"]').should('exist');
            cy.get('textarea[name="description"]').should('exist');
            cy.get('textarea[name="requirements"]').should('exist');
            cy.get('input[name="techStack"]').should('exist');
        });
    });

    it('should have working cancel button in project modal', () => {
        // Open modal
        cy.get('.section').first().within(() => {
            cy.get('.btn-primary').contains('Novo Projeto').click();
        });

        // Verify modal is open
        cy.get('app-create-project').should('be.visible');

        // Click cancel button
        cy.get('app-create-project').within(() => {
            cy.get('button').contains('Cancelar').click();
        });

        // Verify modal is closed
        cy.get('app-create-project').should('not.be.visible');
    });

    it('should validate required fields in project form', () => {
        // Open modal
        cy.get('.section').first().within(() => {
            cy.get('.btn-primary').contains('Novo Projeto').click();
        });

        // Try to submit empty form
        cy.get('app-create-project').within(() => {
            cy.get('button[type="submit"]').click();
        });

        // Form should still be visible (validation failed)
        cy.get('app-create-project').should('be.visible');
    });

    it('should fill out project form successfully', () => {
        // Open modal
        cy.get('.section').first().within(() => {
            cy.get('.btn-primary').contains('Novo Projeto').click();
        });

        // Fill out form
        cy.get('app-create-project').within(() => {
            cy.get('input[name="name"]').type('Test Project');
            cy.get('textarea[name="description"]').type('This is a test project description');
            cy.get('textarea[name="requirements"]').type('Test requirements');
            cy.get('input[name="techStack"]').type('Angular, TypeScript');
        });

        // Verify values were entered
        cy.get('input[name="name"]').should('have.value', 'Test Project');
        cy.get('textarea[name="description"]').should('have.value', 'This is a test project description');
    });

    it('should show "Criar Primeiro Projeto" button when no projects exist', () => {
        cy.get('.section').first().within(() => {
            cy.get('.empty-state').should('be.visible');
            cy.get('button').contains('Criar Primeiro Projeto').should('exist');
        });
    });

    it('should open modal from "Criar Primeiro Projeto" button', () => {
        // Click the empty state button
        cy.get('.section').first().within(() => {
            cy.get('button').contains('Criar Primeiro Projeto').click();
        });

        // Verify modal opens
        cy.get('app-create-project').should('be.visible');
    });
});
