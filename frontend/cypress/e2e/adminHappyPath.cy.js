describe('Admin Full Happy Path Flow', () => {
  it('Registers → Creates → Starts → Ends → Views Results → Logs out → Logs back in', () => {
    const timestamp    = Date.now();
    const testEmail    = `testadmin${timestamp}@example.com`;// generate new email
    const testPassword = 'Password123!';
    const gameName     = 'Test Game';

    // — REGISTER —
    cy.visit('/register');
    cy.get('[aria-label="Email address"]').type(testEmail);
    cy.get('[aria-label="User Name"]').type('Test Admin');
    cy.get('[aria-label="Password"]').type(testPassword);
    cy.get('[aria-label="Confirm Password"]').type(testPassword);
    cy.get('[aria-label="Submit registration form"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard', { timeout: 10000 }).should('exist');

    // — CREATE GAME —
    cy.get('[aria-label="Add a new game"]').click();
    cy.get('#gameName').type(gameName);
    cy.contains('button', 'Create').click();
    cy.contains('Game has been added!', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'OK').click();
    cy.contains(`Game ID: ${gameName}`, { timeout: 10000 }).should('exist');

    cy.wait(1000)
    // — START GAME —
    cy.get(`[aria-label="Open game ${gameName} edit page"]`)
      .within(() => {
        cy.get(`[aria-label="Start game ${gameName}"]`).click();
      });
    cy.contains('Yes').click();
    cy.contains('Game Started!', { timeout: 10000 }).should('exist');

    // — END GAME —
    cy.visit('/dashboard');
    cy.get(`[aria-label="Open game ${gameName} edit page"]`)
      .within(() => {
        cy.get(`[aria-label="Stop game ${gameName}"]`).click();
      });
    cy.contains('Yes').click();
    cy.contains('Yes').click();
    // — VIEW RESULTS —
    cy.url().should('match', /\/session\/\d+$/);
    cy.contains('No player results found').should('exist');
    cy.wait(1000)

    // — LOGOUT —
    cy.contains('Log Out').click();
    cy.url().should('include', '/login');

    // — LOG BACK IN —
    cy.visit('/login');
    cy.get('[aria-label="Email address"]').type(testEmail);
    cy.get('[aria-label="Password"]').type(testPassword);
    cy.get('[aria-label="Submit login form"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('exist');
  });
});
