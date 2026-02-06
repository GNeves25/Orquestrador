// ***********************************************
// Custom Cypress Commands
// ***********************************************

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to wait for Angular to be ready
             * @example cy.waitForAngular()
             */
            waitForAngular(): Chainable<void>;

            /**
             * Custom command to open project modal
             * @example cy.openProjectModal()
             */
            openProjectModal(): Chainable<void>;

            /**
             * Custom command to open team member modal
             * @example cy.openTeamModal()
             */
            openTeamModal(): Chainable<void>;

            /**
             * Custom command to fill project form
             * @example cy.fillProjectForm({ name: 'Test', description: 'Desc' })
             */
            fillProjectForm(data: {
                name: string;
                description: string;
                requirements?: string;
                techStack?: string;
            }): Chainable<void>;

            /**
             * Custom command to fill team member form
             * @example cy.fillTeamForm({ name: 'Agent', role: 'Developer' })
             */
            fillTeamForm(data: {
                name: string;
                role: string;
                description?: string;
            }): Chainable<void>;
        }
    }
}

// Wait for Angular to be ready
Cypress.Commands.add('waitForAngular', () => {
    cy.window().then((win: any) => {
        return new Cypress.Promise((resolve) => {
            if (win.getAllAngularTestabilities) {
                const testabilities = win.getAllAngularTestabilities();
                if (testabilities && testabilities.length > 0) {
                    testabilities[0].whenStable(resolve);
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    });
});

// Open project modal
Cypress.Commands.add('openProjectModal', () => {
    cy.get('.section').first().within(() => {
        cy.get('.btn-primary').contains('Novo Projeto').click();
    });
    cy.get('app-create-project').should('be.visible');
});

// Open team member modal
Cypress.Commands.add('openTeamModal', () => {
    cy.get('.section').eq(1).within(() => {
        cy.get('.btn-primary').contains('Adicionar Agente').click();
    });
    cy.get('app-create-member').should('be.visible');
});

// Fill project form
Cypress.Commands.add('fillProjectForm', (data) => {
    cy.get('app-create-project').within(() => {
        cy.get('input[name="name"]').clear().type(data.name);
        cy.get('textarea[name="description"]').clear().type(data.description);

        if (data.requirements) {
            cy.get('textarea[name="requirements"]').clear().type(data.requirements);
        }

        if (data.techStack) {
            cy.get('input[name="techStack"]').clear().type(data.techStack);
        }
    });
});

// Fill team member form
Cypress.Commands.add('fillTeamForm', (data) => {
    cy.get('app-create-member').within(() => {
        cy.get('input[name="name"]').clear().type(data.name);
        cy.get('select[name="role"]').select(data.role);

        if (data.description) {
            cy.get('textarea[name="description"]').clear().type(data.description);
        }
    });
});

export { };
