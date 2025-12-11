import { LoginPage } from '../support/pages/login.page';
import { ProductosPage, ProductoData } from '../support/pages/productos.page';

describe('System-Inventario – Gestión de Stock e Historial (NC4)', () => {
  const login = new LoginPage();
  const productos = new ProductosPage();

  const prod = {
    codigo: 'S001',
    nombre: 'Silla Gamer',
    categoria: 'Muebles',
    precio: 80000
  };
      before(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
      });

      beforeEach(() => {
        login.login('benja@gmail.com', '123456');
        productos.navigate();
      });

    it('Ajusta stock de un producto existente y verifica historial', () => {

    cy.intercept('GET', '**/productos').as('getProductos');

    cy.visit('/productos');
    cy.wait('@getProductos');

    cy.contains('[data-test="producto-nombre"]', prod.nombre)
      .should('exist')
      .parents('[data-test="fila-producto"]')
      .as('productoFila');

    cy.get('@productoFila')
      .find('[data-test="btn-ajustar-stock"]')
      .click();

    // TIPO: entrada
    cy.get('ion-segment-button[value="entrada"]').click();

    // CANTIDAD: 10 (con soporte para ion-input)
    // Ajustar +10
      cy.get('ion-segment-button[value="entrada"]').click();

      cy.get('ion-input[formcontrolname="cantidad"] input')
        .clear()
        .type('10');

      //  Guardar ajuste
      cy.contains('ion-button', 'Aplicar').click({ force: true });


          // Volver a buscar el producto (no usar alias anterior porque DOM se refrescó)
      cy.contains('[data-test="producto-nombre"]', prod.nombre)
        .parents('[data-test="fila-producto"]')
        .find('[data-test="producto-stock"]')
        .invoke('text')
        .then(text => {
          const valor = parseInt(text.replace(/\D/g, '') || '0', 10);
          expect(valor).to.be.gte(10);
        });


    // Ir a historial
      cy.visit('/historial');
    cy.wait(400);

    
    //   7) Elegir categoría con chip

    cy.contains('[data-test="chip-categoria"]', prod.categoria, {
      timeout: 4000,
    }).click();

  
    //  Seleccionar producto en lista compacta

    cy.contains('[data-test="producto-list-item"]', prod.nombre, {
      timeout: 5000,
    }).click();

    // Confirmar que se cargó el card
    cy.contains('ion-card-title', prod.nombre, { timeout: 4000 })
      .should('exist');

 
    // Validar movimiento +10
 
    cy.get('[data-test="historial-item"] h2')
      .first()
      .should('contain.text', '+10');
  });
});