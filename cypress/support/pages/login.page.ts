export class LoginPage {
  private email() {
    return cy.get('ion-input[formControlName="correo"] input');
  }

  private pass() {
    return cy.get('ion-input[formControlName="contrasena"] input');
  }

  private submit() {
    return cy.get('ion-button[type="submit"]');
  }

  navigate() {
    cy.visit('/login');
  }

  login(email: string, pwd: string) {
    this.navigate();
    this.email().clear().type(email);
    this.pass().clear().type(pwd);
    this.submit().click();

    // ✅ Lo que sí sabemos seguro: te vas a /home
    cy.url().should('include', '/home');
  }

  title() {
    return cy.get('[data-test="login-title"]');
  }
}