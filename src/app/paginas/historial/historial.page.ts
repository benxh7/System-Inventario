import { Component, OnInit, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { combineLatest, map, startWith, switchMap, of } from 'rxjs';

import { ProductoService, Producto, StockHistoryRow } from '../../services/producto.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { AjusteStockComponent } from '../../components/ajuste-stock.component';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {
  private prodSrv = inject(ProductoService);
  private catSrv = inject(CategoriaService);
  private modal = inject(ModalController);
  private fb = inject(FormBuilder);

  // filtros: producto, búsqueda por motivo, rango fechas (simple)
  filtroForm = this.fb.group({
    producto_id: [null as number | null],
    categoria_id: [0],
    q: [''],
    desde: [''],
    hasta: [''],
  });

  // cat + productos para selectores
  categorias$ = this.catSrv.listar();
  productos$ = combineLatest([
    this.categorias$,
    this.filtroForm.valueChanges.pipe(startWith(this.filtroForm.value))
  ]).pipe(
    switchMap(([_, f]) => this.prodSrv.listar({
      categoria_id: f?.categoria_id && f.categoria_id > 0 ? f.categoria_id : undefined
    })),
  );

  // historial del producto seleccionado con filtros locales
historial$ = this.filtroForm.valueChanges.pipe(
  startWith(this.filtroForm.value),
  switchMap(f => {
    const pid = f?.producto_id ?? null;
    return pid ? this.prodSrv.historial(pid) : of<StockHistoryRow[]>([]);
  }),
  map((rows: StockHistoryRow[]) => {
    const f = this.filtroForm.value;
    let out = rows;
  
    // --- Texto en motivo (min 2 chars) ---
    const q = (f?.q ?? '').toString().trim().toLowerCase();
    if (q.length >= 2) {
      out = out.filter(r => (r.motivo || '').toLowerCase().includes(q));
    }
  
    // --- Filtrado por fecha SIN Date() (evita TZ) ---
    // Inputs de tipo date nos dan 'YYYY-MM-DD' o ''.
    const dStr = (f?.desde || '').toString().slice(0, 10); // '' o 'YYYY-MM-DD'
    const hStr = (f?.hasta || '').toString().slice(0, 10);
  
    out = out.filter(r => {
      const rDay = r.fecha.slice(0, 10); // 'YYYY-MM-DD' del backend
      if (dStr && rDay < dStr) return false;
      if (hStr && rDay > hStr) return false;
      return true;
    });
  
    // Orden descendente por fecha/hora
    return out.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  })
);


  // para mostrar stock del seleccionado
  seleccionado?: Producto | null;

  ngOnInit(): void {
    // Mantener seleccionado y, si no hay, autoseleccionar primero
    combineLatest([
      this.productos$,
      this.filtroForm.valueChanges.pipe(startWith(this.filtroForm.value))
    ]).subscribe(([list, f]) => {
      const pid = f?.producto_id ?? null;
  
      // si no hay producto seleccionado y hay lista, seleccionar el primero
      if (!pid && list.length > 0) {
        this.filtroForm.patchValue({ producto_id: list[0].id }, { emitEvent: true });
      }
  
      // guardar referencia del seleccionado (para la tarjeta de resumen)
      this.seleccionado = pid ? list.find(p => p.id === pid) ?? null : null;
    });
  }

  /** abre modal para ajuste del producto elegido */
  async abrirAjuste() {
    const pid = this.filtroForm.value.producto_id;
    if (!pid) return;

    const modal = await this.modal.create({
      component: AjusteStockComponent,
      componentProps: { producto_id: pid }
    });
    modal.onDidDismiss().then(() => {
      // fuerza re-lectura de historial volviendo a emitir el form value
      this.filtroForm.updateValueAndValidity({ emitEvent: true });
    });
    await modal.present();
  }

  limpiarFiltros() {
    this.filtroForm.patchValue({
      q: '',
      desde: null,
      hasta: null
      // si tienes categoria_id o producto_id, decide si también los limpias
    }, { emitEvent: true });
  }
}
