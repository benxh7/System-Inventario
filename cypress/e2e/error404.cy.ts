import { Error404Page } from '../support/pages/error404.page';
import { LoginPage } from '../support/pages/login.page';

describe('Rutas inexistentes – Error 404', () => {
    const error = new Error404Page();
    const login = new LoginPage();

    beforeEach(() => {
        // Limpiar sesión
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    it('Muestra la página 404 al navegar a una URL desconocida', () => {
        error.navigate('/ruta/que/no-existe');
        error.h1().should('be.visible');
    });

    it('Permite volver al Home desde la página 404', () => {
        // Hacer login primero
        login.login('benja@gmail.com', '123456');

        // Navegar a una ruta inexistente
        error.navigate('/otra/ruta-fallida');

        // Esperar que el botón "volver al Home" exista 
        error.volverAlHome();

        // Esperar a que la URL sea /home
        cy.url({ timeout: 10000 }).should('include', '/home');
    });
});
