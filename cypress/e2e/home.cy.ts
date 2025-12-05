import { LoginPage } from '../support/pages/login.page';
import { HomePage } from '../support/pages/home.page';

describe('System-Inventario – Home', () => {
  const login = new LoginPage();
  const home = new HomePage();

  before(() => login.login('benja@gmail.com', '123456'));

  it('La pagina carga correctamente', () => {
    home.getTitle().should('contain', 'Inventario – System');
  });
});
