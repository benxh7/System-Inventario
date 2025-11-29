import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService, Categoria } from '../services/categoria.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ categoria ? 'Editar' : 'Nueva' }} categoría</ion-title>
      <ion-buttons slot="end"><ion-button (click)="close()">✕</ion-button></ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <form [formGroup]="form" (ngSubmit)="save()">
      <ion-item>
        <ion-label position="stacked">Nombre</ion-label>
        <ion-input formControlName="nombre"></ion-input>
      </ion-item>
      <ion-note color="danger" *ngIf="form.controls.nombre.invalid && form.controls.nombre.touched">
        Ingrese un nombre (mín. 2 caracteres)
      </ion-note>

      <ion-button expand="block" type="submit" [disabled]="form.invalid">
        {{ categoria ? 'Guardar cambios' : 'Crear categoría' }}
      </ion-button>
    </form>
  </ion-content>
  `
})
export class CategoriaFormComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private toast = inject(ToastController);
  private catSrv = inject(CategoriaService);

  @Input() categoria?: Categoria;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    if (this.categoria) {
      this.form.patchValue({ nombre: this.categoria.nombre });
    }
  }

  close() { this.modal.dismiss(); }

  async save() {
    const nombre = this.form.value.nombre!.trim();
    if (!nombre) return;

    if (this.categoria) {
      await this.catSrv.actualizar(this.categoria.id, nombre).toPromise();
    } else {
      await this.catSrv.crear(nombre).toPromise();
    }
    (await this.toast.create({ message: 'Guardado', duration: 1200 })).present();
    this.modal.dismiss(true);
  }
}
