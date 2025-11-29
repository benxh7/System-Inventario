import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../services/producto.service';
import { CategoriaService } from '../services/categoria.service';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  totalProductos$: Observable<number> = of(0);
  totalCategorias$: Observable<number> = of(0);

  constructor(
    private prodSrv: ProductoService,
    private catSrv: CategoriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.totalProductos$ = this.prodSrv.listar().pipe(map(list => list.length));
    this.totalCategorias$ = this.catSrv.listar().pipe(map(list => list.length));
  }

  irProductos() {
    this.router.navigate(['/productos']);
  }
  irCategorias() {
    this.router.navigate(['/categorias']);
  }
  irHistorial() { 
    this.router.navigate(['/historial']);
  }
}