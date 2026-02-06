describe('Dashboard E2E Tests', () => {
    beforeEach(() => {
        // Visit the dashboard before each test
        cy.visit('/');
    });

    it('should load the dashboard successfully', () => {
        // Verify the page loads without errors
        cy.get('.header').should('be.visible');
        cy.get('.header h1').should('contain', 'AI Development Team Orchestrator');
        cy.get('.subtitle').should('contain', 'Gerenciador de Time Virtual de Desenvolvimento');
    });

    it('should display all 4 stat cards with correct labels', () => {
        // Wait for dashboard to be visible
        cy.get('.dashboard').should('be.visible');

        // Verify stat cards are present
        cy.get('.stat-card').should('have.length', 4);

        // Verify each stat card content
        cy.get('.stat-card').eq(0).within(() => {
            cy.get('.stat-content h3').should('contain', '0');
            cy.get('.stat-content p').should('contain', 'PROJETOS');
        });

        cy.get('.stat-card').eq(1).within(() => {
            cy.get('.stat-content h3').should('contain', '0');
            cy.get('.stat-content p').should('contain', 'TAREFAS');
        });

        cy.get('.stat-card').eq(2).within(() => {
            cy.get('.stat-content h3').should('contain', '0');
            cy.get('.stat-content p').should('contain', 'AGENTES ATIVOS');
        });

        cy.get('.stat-card').eq(3).within(() => {
            cy.get('.stat-content h3').should('contain', '0');
            cy.get('.stat-content p').should('contain', 'EM PROGRESSO');
        });
    });

    it('should display stat card icons', () => {
        cy.get('.stat-card').each(($card) => {
            cy.wrap($card).find('.stat-icon').should('be.visible');
        });
    });

    it('should show hover effects on stat cards', () => {
        cy.get('.stat-card').first().trigger('mouseover');
        // Verify card has hover state (transform applied)
        cy.get('.stat-card').first().should('have.css', 'transition');
    });

    it('should display "Projetos Recentes" section', () => {
        cy.get('.section').first().within(() => {
            cy.get('.section-header h2').should('contain', 'Projetos Recentes');
            cy.get('.btn-primary').should('contain', 'Novo Projeto');
        });
    });

    it('should display "Time de Desenvolvimento" section', () => {
        cy.get('.section').eq(1).within(() => {
            cy.get('.section-header h2').should('contain', 'Time de Desenvolvimento');
            cy.get('.btn-primary').should('contain', 'Adicionar Agente');
        });
    });

    it('should show empty state for projects', () => {
        cy.get('.section').first().within(() => {
            cy.get('.empty-state').should('be.visible');
            cy.get('.empty-state p').should('contain', 'Nenhum projeto criado ainda');
        });
    });

    it('should show empty state for team members', () => {
        cy.get('.section').eq(1).within(() => {
            cy.get('.empty-state').should('be.visible');
            cy.get('.empty-state p').should('contain', 'Nenhum agente configurado');
        });
    });

    it('should not display loading spinner after page load', () => {
        cy.get('.loading').should('not.be.visible');
    });

    it('should not display error message', () => {
        cy.get('.error-message').should('not.exist');
    });

    it('should have no console errors', () => {
        cy.window().then((win) => {
            cy.spy(win.console, 'error').as('consoleError');
        });

        // Wait a bit for any async operations
        cy.wait(1000);

        // Verify no console errors were logged
        cy.get('@consoleError').should('not.be.called');
    });

    it('should be responsive on mobile viewport', () => {
        cy.viewport('iphone-x');
        cy.get('.header').should('be.visible');
        cy.get('.stat-card').should('be.visible');
    });

    it('should be responsive on tablet viewport', () => {
        cy.viewport('ipad-2');
        cy.get('.header').should('be.visible');
        cy.get('.stat-card').should('have.length', 4);
    });
});
