import { LoginPage } from '../support/pages/login.page';
import { ProductosPage, ProductoData } from '../support/pages/productos.page';

describe('System-Inventario – Gestión de Stock e Historial (NC4)', () => {
  const login = new LoginPage();
  const productos = new ProductosPage();

  const prod: ProductoData = {
    codigo: 'S001',
    nombre: 'Silla Gamer',
    categoria: 'Muebles',
    precio: 80000
  };

  before(() => {
    login.login('benja@gmail.com', '123456');
    productos.navigate();
    productos.crearProducto(prod);
  });

  it('Agrega stock a un producto y registra historial', () => {
    productos.ajustarStock(prod.nombre, 10);

    productos.getStock(prod.nombre).then(text => {
      const valor = parseInt(text || '0', 10);
      expect(valor).to.be.gte(10);
    });

    cy.visit('/historial'); // Ajusta según tu ruta real
    cy.contains('[data-test="historial-item"]', prod.nombre)
      .should('contain.text', 'Ingreso')
      .and('contain.text', '10');
  });

  it('Evita dejar el stock en negativo y muestra error', () => {
    cy.visit('/productos');
    productos.ajustarStock(prod.nombre, -9999);

    cy.contains('[data-test="error-stock"]', /no puede ser negativo/i)
      .should('be.visible');
  });
});
