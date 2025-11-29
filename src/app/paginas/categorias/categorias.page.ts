import { Component, OnInit, inject } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, startWith, switchMap } from 'rxjs';

import { CategoriaService, Categoria } from '../../services/categoria.service';
import { CategoriaFormComponent } from '../../components/categoria.form.component';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: false
})
export class CategoriasPage implements OnInit {
  private catSrv = inject(CategoriaService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);
  private toast = inject(ToastController);           // ✅ inyectar ToastController
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({ q: [''] });

  // Trigger para recargar desde el servidor (crear/editar/eliminar)
  private trigger$ = new BehaviorSubject<void>(undefined);

  // Ahora sí usamos trigger$ para reconsultar al backend
  categorias$ = combineLatest([
    this.trigger$.pipe(switchMap(() => this.catSrv.listar())),             // ✅ recarga real
    this.filtroForm.valueChanges.pipe(startWith(this.filtroForm.value))
  ]).pipe(
    map(([list, f]) => {
      const q = (f?.q ?? '').toString().trim().toLowerCase();
      return q ? list.filter(c => c.nombre.toLowerCase().includes(q)) : list;
    })
  );

  ngOnInit(): void { }

  // Método de recarga pública
  recargar() { this.trigger$.next(); }

  async agregar() {
    const modal = await this.modal.create({ component: CategoriaFormComponent });
    modal.onDidDismiss().then(() => this.recargar());
    await modal.present();
  }

  async editar(cat: Categoria) {
    const modal = await this.modal.create({
      component: CategoriaFormComponent,
      componentProps: { categoria: cat }
    });
    modal.onDidDismiss().then(() => this.recargar());
    await modal.present();
  }

  async eliminar(c: Categoria) {
    const al = await this.alert.create({
      header: 'Eliminar categoría',
      message: `¿Qué deseas hacer con <b>${c.nombre}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar (bloquear si hay productos)',
          role: 'destructive',
          handler: () => {
            this.catSrv.eliminar(c.id).subscribe({
              next: () => this.recargar(),
              error: async (err) => {
                const msg = err?.error?.detail || 'No se pudo eliminar';
                const t = await this.toast.create({
                  message: msg, duration: 2500, color: 'danger'
                });
                t.present();
              }
            });
          }
        },
        {
          text: 'Eliminar y reasignar a “Sin categoría”',
          handler: () => {
            this.catSrv.eliminar(c.id, { reassign: true }).subscribe({
              next: async () => {
                const t = await this.toast.create({
                  message: 'Categoría eliminada. Productos reasignados.',
                  duration: 2000, color: 'success'
                });
                t.present();
                this.recargar();
              },
              error: async (err) => {
                const msg = err?.error?.detail || 'No se pudo eliminar';
                const t = await this.toast.create({
                  message: msg, duration: 2500, color: 'danger'
                });
                t.present();
              }
            });
          }
        }
      ]
    });
    await al.present();
  }
}
