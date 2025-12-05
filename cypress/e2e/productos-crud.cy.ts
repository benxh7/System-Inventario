import { LoginPage } from '../support/pages/login.page';
import { ProductosPage, ProductoData } from '../support/pages/productos.page';

describe('System-Inventario – Gestión de Productos', () => {
  const login = new LoginPage();
  const productos = new ProductosPage();

  const baseProducto: ProductoData = {
    codigo: 'A001',
    nombre: 'Azúcar 1kg',
    categoria: 'Alimentos',   // ← debe coincidir EXACTO con lo que se ve en el menú
    precio: 1500,
  };

  before(() => {
    login.login('benja@gmail.com', '123456');
    productos.navigate();
  });

  it('Crea un nuevo producto (REQ-INV-01 Añadir producto)', () => {
    productos.crearProducto(baseProducto);

    productos.buscarPorNombre(baseProducto.nombre);
    cy.contains('[data-test="fila-producto"]', baseProducto.nombre)
      .should('be.visible');
  });

  it('Modifica un producto existente (REQ-INV-02 Modificar producto)', () => {
    const nuevoNombre = 'Azúcar granulada 1kg';

    productos.editarNombreProducto(baseProducto.nombre, nuevoNombre);

    productos.buscarPorNombre(nuevoNombre);
    cy.contains('[data-test="fila-producto"]', nuevoNombre)
      .should('be.visible');
  });

  it('Busca un producto por nombre (REQ-INV-04 Buscar producto)', () => {
    productos.buscarPorNombre('Azúcar');
    cy.contains('[data-test="fila-producto"]', 'Azúcar')
      .should('be.visible');
  });

  it('Elimina un producto (REQ-INV-03 Eliminar producto)', () => {
    const nombre = 'Azúcar granulada 1kg';

    productos.eliminarProducto(nombre);

    productos.buscarPorNombre(nombre);
    cy.contains('[data-test="fila-producto"]', nombre)
      .should('not.exist');
  });
});
