import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './authguard/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadChildren: () => import('./paginas/auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./paginas/auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'productos',
    loadChildren: () => import('./paginas/productos/productos.module').then( m => m.ProductosPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'categorias',
    loadChildren: () => import('./paginas/categorias/categorias.module').then( m => m.CategoriasPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'historial',
    loadChildren: () => import('./paginas/historial/historial.module').then( m => m.HistorialPageModule),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadChildren: () => import('./paginas/error404/error404.module').then( m => m.Error404PageModule)
  },
  {
    path: 'categorias',
    loadChildren: () => import('./paginas/categorias/categorias.module').then( m => m.CategoriasPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./paginas/historial/historial.module').then( m => m.HistorialPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
