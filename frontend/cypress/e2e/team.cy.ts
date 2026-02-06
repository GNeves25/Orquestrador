describe('Team Members E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/');
        // Wait for dashboard to load
        cy.get('.dashboard').should('be.visible');
    });

    it('should open "Adicionar Agente" modal when button is clicked', () => {
        // Click the "+ Adicionar Agente" button
        cy.get('.section').eq(1).within(() => {
            cy.get('.btn-primary').contains('Adicionar Agente').click();
        });

        // Verify modal is visible
        cy.get('app-create-member').should('be.visible');
    });

    it('should display all form fields in team member modal', () => {
        // Open modal
        cy.get('.section').eq(1).within(() => {
            cy.get('.btn-primary').contains('Adicionar Agente').click();
        });

        // Verify form fields exist
        cy.get('app-create-member').within(() => {
            cy.get('input[name="name"]').should('exist');
            cy.get('select[name="role"]').should('exist');
            cy.get('textarea[name="description"]').should('exist');
        });
    });

    it('should have working cancel button in team member modal', () => {
        // Open modal
        cy.get('.section').eq(1).within(() => {
            cy.get('.btn-primary').contains('Adicionar Agente').click();
        });

        // Verify modal is open
        cy.get('app-create-member').should('be.visible');

        // Click cancel button
        cy.get('app-create-member').within(() => {
            cy.get('button').contains('Cancelar').click();
        });

        // Verify modal is closed
        cy.get('app-create-member').should('not.be.visible');
    });

    it('should validate required fields in team member form', () => {
        // Open modal
        cy.get('.section').eq(1).within(() => {
            cy.get('.btn-primary').contains('Adicionar Agente').click();
        });

        // Try to submit empty form
        cy.get('app-create-member').within(() => {
            cy.get('button[type="submit"]').click();
        });

        // Form should still be visible (validation failed)
        cy.get('app-create-member').should('be.visible');
    });

    it('should fill out team member form successfully', () => {
        // Open modal
        cy.get('.section').eq(1).within(() => {
            cy.get('.btn-primary').contains('Adicionar Agente').click();
        });

        // Fill out form
        cy.get('app-create-member').within(() => {
            cy.get('input[name="name"]').type('Test Agent');
            cy.get('select[name="role"]').select('Developer');
            cy.get('textarea[name="description"]').type('Test agent description');
        });

        // Verify values were entered
        cy.get('input[name="name"]').should('have.value', 'Test Agent');
        cy.get('textarea[name="description"]').should('have.value', 'Test agent description');
    });

    it('should show "Adicionar Primeiro Agente" button when no team members exist', () => {
        cy.get('.section').eq(1).within(() => {
            cy.get('.empty-state').should('be.visible');
            cy.get('button').contains('Adicionar Primeiro Agente').should('exist');
        });
    });

    it('should open modal from "Adicionar Primeiro Agente" button', () => {
        // Click the empty state button
        cy.get('.section').eq(1).within(() => {
            cy.get('button').contains('Adicionar Primeiro Agente').click();
        });

        // Verify modal opens
        cy.get('app-create-member').should('be.visible');
    });

    it('should have role dropdown with options', () => {
        // Open modal
        cy.get('.section').eq(1).within(() => {
            cy.get('.btn-primary').contains('Adicionar Agente').click();
        });

        // Check role dropdown has options
        cy.get('app-create-member').within(() => {
            cy.get('select[name="role"]').find('option').should('have.length.greaterThan', 1);
        });
    });
});
