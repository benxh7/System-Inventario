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
      return cy.get('[data-test="btn-nuevo-producto"]');
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
      // filtro de la página, no del modal
      return cy
        .get('[data-test="buscar-producto"]')
        .shadow()
        .find('input');
    }
  
    private filaProducto(nombre: string) {
      return cy.contains('[data-test="fila-producto"]', nombre);
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
      // Abrir el modal
      this.btnNuevo().click();
    
      // 1) Trabajamos dentro del modal para código, nombre y abrir el select de categoría
      cy.get('ion-modal', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.get('ion-input[formControlName="codigo"] input')
            .clear()
            .type(data.codigo);
    
          cy.get('ion-input[formControlName="nombre"] input')
            .clear()
            .type(data.nombre);
    
          // Abrimos el select de categoría del FORMULARIO del modal
          cy.get('ion-select[formControlName="categoria_id"]')
            .click({ force: true });
        });
    
      // 2) Seleccionamos la opción "Alimentos" (o la que venga en data.categoria)
      cy.get('ion-alert, ion-popover', {
          includeShadowDom: true,
          timeout: 10000,
        })
        .contains(new RegExp(`^\\s*${data.categoria}\\s*$`, 'i'))
        .click({ force: true });
    
      // 3) Precio y guardar, otra vez scoped al modal
      cy.get('ion-modal', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.get('ion-input[formControlName="precio"] input')
            .click()
            .type('{selectAll}{backspace}' + String(data.precio));
    
          cy.get('[data-test="btn-guardar-producto"]')
            .click();
        });
    }    
  
    buscarPorNombre(nombre: string) {
      this.inputBuscar().clear().type(nombre);
    }
  
    editarNombreProducto(nombreActual: string, nuevoNombre: string) {
      this.btnEditar(nombreActual).click();
      this.inputNombre().clear().type(nuevoNombre);
      this.btnGuardar().click();
    }
  
    eliminarProducto(nombre: string) {
      this.btnEliminar(nombre).click();
      cy.contains('ion-button, button', /aceptar|confirmar/i).click({ force: true });
    }
  
    ajustarStock(nombre: string, cantidad: number) {
      this.btnAjustarStock(nombre).click();
      this.inputStockCantidad().clear().type(String(cantidad));
      this.btnConfirmarStock().click();
    }
  
    getStock(nombre: string) {
      return this.etiquetaStock(nombre).invoke('text');
    }
  }