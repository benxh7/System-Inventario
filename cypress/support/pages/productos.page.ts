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
      return cy.get('input[placeholder="Buscar (código/nombre)"]', {
        includeShadowDom: true,
        timeout: 10000,
      });
    }
  
    private filaProducto(nombre: string) {
      // buscamos el ion-item-sliding que contiene el nombre
      return cy.contains('ion-item-sliding[data-test="fila-producto"]', nombre);
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
    
                  // Categoría (nuevo sistema con chips)
          cy.get('[data-test="chip-categoria"]')
            .contains(data.categoria)
            .click();
                // Precio
          cy.get('ion-input[formcontrolname="precio"] input').clear().type(String(data.precio));

          // Guardar
          cy.get('[data-test="btn-guardar-producto"]').click();

          // Espera a que el modal cierre
          cy.wait(500);

        });
    }    
  
    buscarPorNombre(nombre: string) {
      this.inputBuscar().clear().type(nombre);
    }
  
    editarNombreProducto(nombreActual: string, nuevoNombre: string) {
      cy.contains('[data-test="fila-producto"]', nombreActual)
        .find('[data-test="btn-editar-producto"]')
        .click();

      cy.get('ion-input[formcontrolname="nombre"] input')
        .clear()
        .type(nuevoNombre);

      cy.get('[data-test="btn-guardar-producto"]').click();
      cy.wait(500);
    }

  
    eliminarProducto(nombre: string) {
      // 1) Abrimos el ion-item-sliding hacia el lado "end"
      this.filaProducto(nombre)
        .then($row => {
          const el = $row[0] as any;
          // llamamos al método open('end') del web component
          if (el && typeof el.open === 'function') {
            el.open('end');
          }
        });
    
      // 2) Ahora que las opciones están visibles, clic al tarro de basura
      this.filaProducto(nombre)
        .find('[data-test="btn-eliminar-producto"]')
        .click({ force: true });
    
      // 3) Confirmar en el alert
      cy.contains('ion-button, button', /eliminar|aceptar/i)
        .click({ force: true });
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