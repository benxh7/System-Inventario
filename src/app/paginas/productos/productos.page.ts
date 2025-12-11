import { Component, OnInit, inject } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, combineLatest, startWith, switchMap } from 'rxjs';
import { ProductoService, Producto } from '../../services/producto.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { ProductoFormComponent } from '../../components/producto-form.component';
import { FormBuilder } from '@angular/forms';
import { AjusteStockComponent } from 'src/app/components/ajuste-stock.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit {
  private prodSrv = inject(ProductoService);
  private catSrv = inject(CategoriaService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);
  private fb = inject(FormBuilder);

  // Filtros (reactivos)
  filtroForm = this.fb.group({
    q: [''],
    categoria_id: [null as number | null],
  });

  // Observable para categorías (lo usa el HTML con | async)
  categorias$!: Observable<Categoria[]>;

  // Disparador manual de recarga
  private trigger$ = new BehaviorSubject<void>(undefined);

  // Listado de productos reactivo a filtros y recargas
  productos$: Observable<Producto[]> = combineLatest([
    this.filtroForm.valueChanges.pipe(startWith(this.filtroForm.value)),
    this.trigger$
  ]).pipe(
    switchMap(([f]) =>
      this.prodSrv.listar({
        q: f?.q || undefined,
        categoria_id: f?.categoria_id ? f.categoria_id : undefined,
      })
    )
  );

  ngOnInit() {
    // Carga de categorías
    this.categorias$ = this.catSrv.listar();
  }

  recargar() { this.trigger$.next(); }

  async agregar() {
    const modal = await this.modal.create({ component: ProductoFormComponent });
    modal.onDidDismiss().then(() => this.recargar());
    await modal.present();
  }

  async editar(p: Producto) {
    const modal = await this.modal.create({
      component: ProductoFormComponent,
      componentProps: { producto: p }
    });
    modal.onDidDismiss().then(() => this.recargar());
    await modal.present();
  }

  async eliminar(p: Producto) {
    const al = await this.alert.create({
      header: 'Eliminar',
      message: `¿Eliminar el producto <b>${p.nombre}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.prodSrv.eliminar(p.id) }
      ]
    });
    await al.present();
  }
    async abrirAjusteStock(p: Producto) {
    if (!p || !p.id) {
      console.error('Error: producto inválido en abrirAjusteStock:', p);

      const alert = await this.alert.create({
        header: 'Error',
        message: 'No se pudo identificar el producto para ajustar el stock.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

    const modal = await this.modal.create({
      component: AjusteStockComponent,
      componentProps: { producto_id: p.id }
    });

    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.recargar();
      }
    });

    await modal.present();
  }
}
