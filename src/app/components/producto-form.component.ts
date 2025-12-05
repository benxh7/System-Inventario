import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { IonicModule, ModalController, ToastController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Producto, ProductoService } from '../services/producto.service';
import { CategoriaService } from '../services/categoria.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ producto ? 'Editar' : 'Nuevo' }} producto</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="save()">

        <!-- Código (A123) -->
        <ion-item>
          <ion-label position="stacked">Código (A123)</ion-label>
          <ion-input
            formControlName="codigo"
            (ionInput)="toUpper($event)">
          </ion-input>
        </ion-item>
        <ion-note color="danger" *ngIf="fc('codigo')?.invalid && fc('codigo')?.touched">
          Formato inválido. Use una letra mayúscula + 3 dígitos, p.ej. A123.
        </ion-note>

        <!-- Nombre -->
        <ion-item>
          <ion-label position="stacked">Nombre</ion-label>
          <ion-input formControlName="nombre"></ion-input>
        </ion-item>
        <ion-note color="danger" *ngIf="form.hasError('codigoNombreIguales') && fc('nombre')?.touched">
          El código y el nombre no pueden ser iguales.
        </ion-note>

        <!-- Categoría -->
        <ion-item>
          <ion-label position="stacked">Categoría</ion-label>
          <ion-select
            interface="popover"
            formControlName="categoria_id"
            placeholder="Selecciona..."
            data-test="modal-select-categoria"
          >
            <ion-select-option *ngFor="let c of categorias" [value]="c.id">
              {{ c.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-note color="danger" *ngIf="fc('categoria_id')?.invalid && fc('categoria_id')?.touched">
          La categoría es obligatoria.
        </ion-note>

        <!-- Precio entero -->
        <ion-item>
          <ion-label position="stacked">Precio (CLP)</ion-label>
          <ion-input type="number" inputmode="numeric" formControlName="precio"></ion-input>
        </ion-item>
        <ion-note color="danger" *ngIf="fc('precio')?.invalid && fc('precio')?.touched">
          Ingrese un entero mayor o igual a 0.
        </ion-note>

        <!-- Ilimitado -->
        <ion-item>
          <ion-label>Stock ilimitado</ion-label>
          <ion-toggle formControlName="ilimitado"></ion-toggle>
        </ion-item>

        <!-- Stock -->
        <ion-item *ngIf="!form.value.ilimitado">
          <ion-label position="stacked">Stock</ion-label>
          <ion-input type="number" inputmode="numeric" formControlName="stock"></ion-input>
        </ion-item>
        <ion-note color="danger" *ngIf="!form.value.ilimitado && fc('stock')?.invalid && fc('stock')?.touched">
          El stock debe ser ≥ 0.
        </ion-note>

        <!-- Imagen -->
        <ion-item>
          <ion-label>Imagen</ion-label>
          <ion-button fill="outline" (click)="selectImage()">
            {{ form.value.imagen ? 'Cambiar' : 'Seleccionar' }} foto
          </ion-button>
        </ion-item>

        <!-- Vista previa -->
        <ion-item *ngIf="form.value.imagen">
          <ion-thumbnail slot="start">
            <img [src]="form.value.imagen" />
          </ion-thumbnail>
          <ion-label>Previsualización</ion-label>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="form.invalid" data-test="btn-guardar-producto">
          {{ producto ? 'Guardar cambios' : 'Crear producto' }}
        </ion-button>
      </form>
    </ion-content>
  `,
})
export class ProductoFormComponent {

  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private toast = inject(ToastController);
  private prodSrv = inject(ProductoService);
  private platform = inject(Platform);
  private catSrv = inject(CategoriaService);

  @Input() producto?: Producto;

  categorias: Array<{id:number; nombre:string}> = [];

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[A-Z][0-9]{3}$/)]],
    nombre: ['', Validators.required],
    categoria_id: [null as number | null, Validators.required],
    precio: [0, [Validators.required, Validators.pattern(/^\d+$/)]], // entero
    ilimitado: [false],
    stock: [0, [Validators.min(0)]],
    imagen: ['']
  }, { validators: this.codigoDistintoDeNombre });

  ngOnInit() {
    // Cargar categorías
    this.catSrv.listar().subscribe(c => this.categorias = c);

    // Editar
    if (this.producto) {
      // si viene ilimitado true, forzamos stock a 0 en el form
      const { ilimitado, stock, ...rest } = this.producto as any;
      this.form.patchValue({
        ...rest,
        ilimitado,
        stock: ilimitado ? 0 : (stock ?? 0)
      });
    }
  }

  fc(name: string) { return this.form.get(name); }

  close() { this.modal.dismiss(); }

  toUpper(ev: any) {
    const v = (ev.target?.value ?? '').toString().toUpperCase();
    this.form.patchValue({ codigo: v }, { emitEvent: false });
  }

  /** Código y nombre no pueden ser iguales (ignorando mayúsculas/minúsculas) */
  private codigoDistintoDeNombre(group: AbstractControl): ValidationErrors | null {
    const codigo = (group.get('codigo')?.value ?? '').toString().trim().toLowerCase();
    const nombre = (group.get('nombre')?.value ?? '').toString().trim().toLowerCase();
    return codigo && nombre && codigo === nombre ? { codigoNombreIguales: true } : null;
  }

  /** Abre cámara o file picker según la plataforma */
  async selectImage() {
    if (this.platform.is('hybrid')) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
        });
        this.form.patchValue({ imagen: image.dataUrl });
      } catch (err) {
        console.warn('No se seleccionó imagen', err);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const dataUrl = await this.fileToDataUrl(file);
        this.form.patchValue({ imagen: dataUrl });
      };
      input.click();
    }
  }

  /** Convierte File a DataURL */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /** Crear / Editar */
  async save() {
    const { codigo, nombre, precio, stock, ilimitado, imagen, categoria_id } = this.form.value as any;
  
    const payload = {
      codigo,
      nombre,
      precio: Number(precio),
      ilimitado: !!ilimitado,
      stock: ilimitado ? 0 : Number(stock ?? 0),
      imagen,
      categoria_id: Number(categoria_id)
    };
  
    if (this.producto) {
      this.prodSrv.actualizar(this.producto.id, payload);
    } else {
      this.prodSrv.crear(payload);
    }
  
    const t = await this.toast.create({ message: 'Guardado', duration: 1200 });
    await t.present();
    this.modal.dismiss(true);
  }
}