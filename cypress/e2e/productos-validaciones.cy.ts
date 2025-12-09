// cypress/e2e/productos-validaciones.cy.ts
import { LoginPage } from '../support/pages/login.page';
import { ProductosPage } from '../support/pages/productos.page';

describe('System-Inventario – Validaciones de Producto (NC1, NC2)', () => {
  const login = new LoginPage();
  const productos = new ProductosPage();

  beforeEach(() => {
    login.login('benja@gmail.com', '123456');
    productos.navigate();
  });

  const abrirModalNuevo = () => {
    cy.get('[data-test="btn-nuevo-producto"]').click();
    cy.get('ion-modal', { timeout: 10000 }).should('be.visible');
  };

  const rellenarBasico = (codigo: string, nombre: string) => {
    cy.get('ion-modal').within(() => {
      cy.get('ion-input[formControlName="codigo"] input')
        .clear()
        .type(codigo);

      cy.get('ion-input[formControlName="nombre"] input')
        .clear()
        .type(nombre);
    });
  };

  const seleccionarCategoriaChip = (categoria: string) => {
    cy.get('ion-modal').within(() => {
      cy.get('[data-test="chip-categoria"]')
        .contains(categoria)
        .click();
    });
  };

  const escribirPrecio = (valor: string) => {
    cy.get('ion-modal').within(() => {
      cy.get('ion-input[formControlName="precio"] input')
        .clear()
        .type(valor);
    });
  };

  it('No permite códigos de producto duplicados (REQ-INV-01.i, NC1)', () => {
    // ---- 1) Crear primer producto válido ----
    abrirModalNuevo();
    rellenarBasico('D001', 'Producto original');
    seleccionarCategoriaChip('Alimentos');
    escribirPrecio('1000');

    cy.get('ion-modal [data-test="btn-guardar-producto"]').click();
    cy.wait(500);

    productos.buscarPorNombre('Producto original');
    cy.contains('[data-test="fila-producto"]', 'Producto original')
      .should('be.visible');

    // ---- 2) Intentar crear otro con el mismo código ----
    abrirModalNuevo();
    rellenarBasico('D001', 'Producto duplicado');
    seleccionarCategoriaChip('Alimentos');
    escribirPrecio('1200');

    cy.get('ion-modal [data-test="btn-guardar-producto"]').click();
    cy.wait(500);

    // ASSERT: no hay dos filas con el mismo código
    productos.buscarPorNombre('D001');

    cy.get('[data-test="fila-producto"]')
      .filter(':contains("D001")')
      .should('have.length', 1);
  });

  it('Rechaza código de producto que no cumple patrón inicial + 3 dígitos (NC1)', () => {
    abrirModalNuevo();
    rellenarBasico('1234', 'Producto inválido');
    seleccionarCategoriaChip('Alimentos');
    escribirPrecio('1000');

    // El botón debe permanecer deshabilitado porque el form es inválido
    cy.get('ion-modal [data-test="btn-guardar-producto"]')
      .should('be.disabled');
  });

  it('Requiere categoría obligatoria (REQ-INV-01.h)', () => {
    abrirModalNuevo();
    rellenarBasico('B001', 'Producto sin categoría');
    // No seleccionamos categoría
    escribirPrecio('2000');

    // Form inválido ⇒ botón deshabilitado
    cy.get('ion-modal [data-test="btn-guardar-producto"]')
      .should('be.disabled');
  });

  it('El precio solo acepta números enteros (NC2, REQ-INV-01.k)', () => {
    abrirModalNuevo();
    rellenarBasico('C001', 'Producto con precio inválido');
    seleccionarCategoriaChip('Alimentos');

    // Intentar ingresar un decimal
    escribirPrecio('1000.50');

    // Form inválido ⇒ botón deshabilitado
    cy.get('ion-modal [data-test="btn-guardar-producto"]')
      .should('be.disabled');
  });
});
