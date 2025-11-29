import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { ToastController, Platform } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';

import { filter, map } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { LoadingService } from './shared/loading.service';
import { CategoriaService } from './services/categoria.service';
import { ProductoService } from './services/producto.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnDestroy {
  // overlay
  loaderState$ = this.loader.state$;

  // contadores para mostrar badges en el menú (opcional)
  totalCategorias$ = this.catSrv.listar().pipe(map(arr => arr.length));
  totalProductos$  = this.prodSrv.listar().pipe(map(arr => arr.length));

  private netHandler?: PluginListenerHandle;

  constructor(
    private router: Router,
    private toast: ToastController,
    private platform: Platform,
    public auth: AuthService,
    public loader: LoadingService,
    private catSrv: CategoriaService,
    private prodSrv: ProductoService
  ) {
    // 1) Cerrar telón al iniciar navegación
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => this.loader.show());

    // 2) Abrir telón al finalizar/cancelar navegación
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError))
      .subscribe(() => this.loader.open());

    // 3) Aviso cuando no hay Internet
    this.platform.ready().then(async () => {
      this.netHandler = await Network.addListener('networkStatusChange', async (s) => {
        if (!s.connected) {
          (await this.toast.create({
            message: 'Sin conexión a Internet',
            duration: 3000,
            color: 'warning',
          })).present();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.netHandler?.remove();
  }
}
