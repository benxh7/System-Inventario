import { LoginPage } from '../support/pages/login.page';

describe('System-Inventario – Seguridad de sesión (NC3)', () => {
  const login = new LoginPage();

  it('No permite acceder a productos sin estar autenticado', () => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit('/productos');
    cy.url().should('include', '/login');
  });

  it('Simula sesión expirada y redirige a login', () => {
    login.login('benja@gmail.com', '123456');

    // Simula expira token (ajusta a cómo guardas el token)
    cy.window().then(win => {
      win.localStorage.setItem('token_expiration', '2000-01-01T00:00:00Z');
    });

    cy.visit('/productos');
    cy.url().should('include', '/login');
  });
});
