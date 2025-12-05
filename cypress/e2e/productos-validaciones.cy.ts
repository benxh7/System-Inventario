import { LoginPage } from '../support/pages/login.page';
import { ProductosPage } from '../support/pages/productos.page';

describe('System-Inventario – Validaciones de Producto (NC1, NC2)', () => {
  const login = new LoginPage();
  const productos = new ProductosPage();

  beforeEach(() => {
    login.login('benja@gmail.com', '123456');
    productos.navigate();
  });

  it('No permite códigos de producto duplicados (REQ-INV-01.i, NC1)', () => {
    // Crear primer producto
    cy.get('[data-test="btn-nuevo-producto"]').click();
    cy.get('ion-input[formControlName="codigo"] input').type('D001');
    cy.get('ion-input[formControlName="nombre"] input').type('Producto original');
    cy.get('[data-test="select-categoria"]').click();
    cy.contains('ion-select-option', 'Alimentos').click();
    cy.get('ion-input[formControlName="precio"] input').type('1000');
    cy.get('[data-test="btn-guardar-producto"]').click();
  
    // Intentar crear otro con el mismo código
    cy.get('[data-test="btn-nuevo-producto"]').click();
    cy.get('ion-input[formControlName="codigo"] input').type('D001');
    cy.get('ion-input[formControlName="nombre"] input').type('Producto duplicado');
    cy.get('[data-test="select-categoria"]').click();
    cy.contains('ion-select-option', 'Alimentos').click();
    cy.get('ion-input[formControlName="precio"] input').type('1200');
    cy.get('[data-test="btn-guardar-producto"]').click();
  
    cy.contains('[data-test="error-codigo"]', /código ya existe/i)
      .should('be.visible');
  });

  it('Rechaza código de producto que no cumple patrón inicial + 3 dígitos (NC1)', () => {
    cy.get('[data-test="btn-nuevo-producto"]').click();
    cy.get('ion-input[formControlName="codigo"] input').type('1234');
    cy.get('ion-input[formControlName="nombre"] input').type('Producto inválido');
    cy.get('[data-test="select-categoria"]').click();
    cy.contains('ion-select-option', 'Alimentos').click();
    cy.get('ion-input[formControlName="precio"] input').type('1000');

    cy.get('[data-test="btn-guardar-producto"]').click();

    cy.contains('[data-test="error-codigo"]', /código debe seguir el patrón/i)
      .should('be.visible');
  });

  it('Requiere categoría obligatoria (REQ-INV-01.h)', () => {
    cy.get('[data-test="btn-nuevo-producto"]').click();
    cy.get('ion-input[formControlName="codigo"] input').type('B001');
    cy.get('ion-input[formControlName="nombre"] input').type('Producto sin categoría');
    // No se selecciona categoría
    cy.get('ion-input[formControlName="precio"] input').type('2000');

    cy.get('[data-test="btn-guardar-producto"]').click();

    cy.contains('[data-test="error-categoria"]', /categoría es obligatoria/i)
      .should('be.visible');
  });

  it('El precio solo acepta números enteros (NC2, REQ-INV-01.k)', () => {
    cy.get('[data-test="btn-nuevo-producto"]').click();
    cy.get('ion-input[formControlName="codigo"] input').type('C001');
    cy.get('ion-input[formControlName="nombre"] input').type('Producto con precio inválido');
    cy.get('[data-test="select-categoria"]').click();
    cy.contains('ion-select-option', 'Alimentos').click();

    // Intentar ingresar un decimal
    cy.get('ion-input[formControlName="precio"] input').type('1000.50');
    cy.get('[data-test="btn-guardar-producto"]').click();

    cy.contains('[data-test="error-precio"]', /precio debe ser un número entero/i)
      .should('be.visible');
  });
});
