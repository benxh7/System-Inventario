import { LoginPage } from '../support/pages/login.page';
import { ProductosPage } from '../support/pages/productos.page';

describe('TableMaster – Productos', () => {
    const login = new LoginPage();
    const productos = new ProductosPage();

    before(() => {
        login.login('benja@gmail.com', '123456');
        productos.navigate();
    });

    it('La página muestra el título "Productos"', () => {
        productos.getTitle().should('equal', 'Productos');
    });
});