import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductoService, Producto } from '../../services/producto.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { Observable, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false,
})
export class HistorialPage implements OnInit {

  private prodSrv = inject(ProductoService);
  private catSrv = inject(CategoriaService);
  private fb = inject(FormBuilder);

  categorias$!: Observable<Categoria[]>;
  productos$!: Observable<Producto[]>;

  // Productos filtrados según búsqueda por input
  productosFiltrados: Producto[] = [];

  // Producto seleccionado para mostrar su resumen
  seleccionado: Producto | null = null;

  // Historial observable
  historial$!: Observable<any[]>;

  filtroForm: FormGroup = this.fb.group({
    categoria_id: [null],
    buscarProducto: [''],
    producto_id: [null],
    desde: [''],
    hasta: [''],
  });

  ngOnInit() {

    // Cargar categorías
    this.categorias$ = this.catSrv.listar();

    // Cargar productos filtrados por categoría
    this.productos$ = this.filtroForm.get('categoria_id')!.valueChanges.pipe(
      switchMap(catId => {
        if (!catId) return this.prodSrv.listar();
        return this.prodSrv.listar({ categoria_id: catId });
      })
    );

    // Al cambiar producto → cargar historial
    this.historial$ = this.filtroForm.get('producto_id')!.valueChanges.pipe(
      switchMap(productoId => {
        if (!productoId) return of([]);
        return this.prodSrv.historial(productoId);
      })
    );

    // Cuando cargan los productos, inicializar filtrados
    this.productos$.subscribe(list => {
      this.productosFiltrados = list;
    });
  }

  // ----------------------------
  //   MANEJO DE CATEGORÍAS
  // ----------------------------
    seleccionarCategoria(id: number | null) {
    this.filtroForm.patchValue({
      categoria_id: id,
      producto_id: null,
    });

    this.seleccionado = null;

    this.productos$.subscribe(lista => {
      this.productosFiltrados = lista;
    });
  }


  // ----------------------------
  //   FILTRAR PRODUCTOS POR TEXTO
  // ----------------------------
  filtrarProductos() {
    const texto = this.filtroForm.value.buscarProducto?.toLowerCase() ?? '';

    this.productos$.subscribe(lista => {
      this.productosFiltrados = lista.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto)
      );
    });
  }

  // ----------------------------
  //   SELECCIONAR PRODUCTO
  // ----------------------------
  seleccionarProducto(p: Producto) {
    this.filtroForm.patchValue({ producto_id: p.id });
    this.seleccionado = p;
    this.productosFiltrados = [];   // Oculta la lista luego
  }


  // ----------------------------
  //   LIMPIAR FILTROS
  // ----------------------------
  limpiarFiltros() {
    this.filtroForm.reset({
      categoria_id: null,
      buscarProducto: '',
      producto_id: null,
      desde: '',
      hasta: ''
    });

    this.seleccionado = null;

    this.productos$.subscribe(list => {
      this.productosFiltrados = list;
    });
  }
}
