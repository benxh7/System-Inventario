import { LoginPage } from '../support/pages/login.page';

describe('System-Inventario – Login', () => {
  const page = new LoginPage();

  it('La página de login carga y permite iniciar sesión (REQ-SEG-01)', () => {
    page.login('benja@gmail.com', '123456');
  });

  it('No permite acceder con credenciales inválidas (REQ-SEG-02)', () => {
    page.navigate();

    // ✅ Selectores correctos según tu HTML
    cy.get('ion-input[formControlName="correo"] input').type('fake@inventario.com');
    cy.get('ion-input[formControlName="contrasena"] input').type('Wrong123');
    cy.get('ion-button[type="submit"]').click();

    // Como en error no navegas a /home, seguimos en /login
    cy.url().should('include', '/login');

    // OPCIONAL: si quisieras validar el toast:
    // cy.contains('ion-toast', 'Credenciales inválidas', { includeShadowDom: true })
    //   .should('exist');
  });
});
