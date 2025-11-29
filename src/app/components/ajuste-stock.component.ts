import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-ajuste-stock',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>Ajuste de stock</ion-title>
      <ion-buttons slot="end"><ion-button (click)="close()">✕</ion-button></ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <form [formGroup]="form" (ngSubmit)="save()">
      <ion-item>
        <ion-label position="stacked">Tipo</ion-label>
        <ion-segment formControlName="tipo">
          <ion-segment-button value="entrada">
            <ion-label>Entrada (+)</ion-label>
          </ion-segment-button>
          <ion-segment-button value="salida">
            <ion-label>Salida (−)</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Cantidad</ion-label>
        <ion-input type="number" inputmode="numeric" formControlName="cantidad"></ion-input>
      </ion-item>
      <ion-note color="danger" *ngIf="form.controls.cantidad.invalid && form.controls.cantidad.touched">
        Ingrese una cantidad ≥ 1
      </ion-note>

      <ion-item>
        <ion-label position="stacked">Motivo (opcional)</ion-label>
        <ion-input formControlName="motivo" placeholder="Compra, corrección, rotura, etc."></ion-input>
      </ion-item>

      <ion-button expand="block" type="submit" [disabled]="form.invalid">Aplicar</ion-button>
    </form>
  </ion-content>
  `
})
export class AjusteStockComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private toast = inject(ToastController);
  private prodSrv = inject(ProductoService);

  @Input() producto_id!: number;

  form = this.fb.group({
    tipo: ['entrada', Validators.required],      // entrada | salida
    cantidad: [1, [Validators.required, Validators.min(1)]],
    motivo: [''],
  });

  close() { this.modal.dismiss(); }

  async save() {
    const { tipo, cantidad, motivo } = this.form.value as any;
    const delta = tipo === 'entrada' ? +cantidad : -cantidad;

    try {
      await this.prodSrv.ajustarStock(this.producto_id, delta, motivo).toPromise();
      (await this.toast.create({ message: 'Ajuste aplicado', duration: 1200 })).present();
      this.modal.dismiss(true);
    } catch (e: any) {
      (await this.toast.create({
        message: e?.error?.detail || 'No se pudo aplicar el ajuste',
        duration: 2000, color: 'danger'
      })).present();
    }
  }
}
