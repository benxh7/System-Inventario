export interface ProductoData {
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
}

export class ProductosPage {
  // Selectores base
  private title() {
    return cy.get('[data-test="productos-title"]');
  }

  private btnNuevo() {
    return cy.get('[data-test="btn-nuevo-producto"]', { timeout: 10000 });
  }

  private inputCodigo() {
    return cy.get('ion-modal ion-input[formControlName="codigo"] input', { timeout: 10000 });
  }

  private inputNombre() {
    return cy.get('ion-modal ion-input[formControlName="nombre"] input', { timeout: 10000 });
  }

  private selectCategoria() {
    return cy.get('ion-modal ion-select[formControlName="categoria_id"]', { timeout: 10000 });
  }

  private inputPrecio() {
    return cy.get('ion-modal ion-input[formControlName="precio"] input', { timeout: 10000 });
  }

  private btnGuardar() {
    return cy.get('ion-modal [data-test="btn-guardar-producto"]', { timeout: 10000 });
  }

  private inputBuscar() {
    return cy.get('input[placeholder="Buscar (código/nombre)"]', {
      includeShadowDom: true,
      timeout: 10000,
    });
  }

  private filaProducto(nombre: string) {
    return cy.contains('ion-item[data-test="fila-producto"]', nombre);
  }

  private btnEditar(nombre: string) {
    return this.filaProducto(nombre).find('[data-test="btn-editar-producto"]');
  }

  private btnEliminar(nombre: string) {
    return this.filaProducto(nombre).find('[data-test="btn-eliminar-producto"]');
  }

  private etiquetaStock(nombre: string) {
    return this.filaProducto(nombre).find('[data-test="producto-stock"]');
  }

  private btnAjustarStock(nombre: string) {
    return this.filaProducto(nombre).find('[data-test="btn-ajustar-stock"]');
  }

  private inputStockCantidad() {
    return cy.get('ion-input[formControlName="cantidad"] input');
  }

  private btnConfirmarStock() {
    return cy.get('[data-test="btn-confirmar-stock"]');
  }

  navigate() {
    cy.visit('/productos');
  }

  getTitle() {
    return this.title().should('contain.text', 'Productos').invoke('text');
  }

  crearProducto(data: ProductoData) {
    this.btnNuevo().click({ force: true });

    cy.get('ion-modal', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.get('ion-input[formControlName="codigo"] input')
          .clear({ force: true })
          .type(data.codigo, { force: true });

        cy.get('ion-input[formControlName="nombre"] input')
          .clear({ force: true })
          .type(data.nombre, { force: true });

        // Categoría (chips)
        cy.get('[data-test="chip-categoria"]')
          .contains(data.categoria)
          .click({ force: true });

        cy.get('ion-input[formcontrolname="precio"] input')
          .clear({ force: true })
          .type(String(data.precio), { force: true });

        cy.get('[data-test="btn-guardar-producto"]').click({ force: true });
        cy.wait(500);
      });
  }

  buscarPorNombre(nombre: string) {
    this.inputBuscar().clear({ force: true }).type(nombre, { force: true });
  }

  editarNombreProducto(nombreActual: string, nuevoNombre: string) {
    this.btnEditar(nombreActual).click({ force: true });

    cy.get('ion-input[formcontrolname="nombre"] input')
      .clear({ force: true })
      .type(nuevoNombre, { force: true });

    this.btnGuardar().click({ force: true });
    cy.wait(500);
  }

  eliminarProducto(nombre: string) {
    // Abrimos ion-item-sliding
    this.filaProducto(nombre)
      .then($row => {
        const el = $row[0] as any;
        if (el && typeof el.open === 'function') {
          el.open('end');
        }
      });

    this.btnEliminar(nombre).click({ force: true });

    // Confirmar alerta
    cy.contains('ion-button, button', /eliminar|aceptar/i).click({ force: true });
  }

  ajustarStock(nombre: string, cantidad: number) {
    this.btnAjustarStock(nombre).click({ force: true });
    this.inputStockCantidad().clear({ force: true }).type(String(cantidad), { force: true });
    this.btnConfirmarStock().click({ force: true });
  }

  getStock(nombre: string) {
    return this.etiquetaStock(nombre).invoke('text');
  }
}
