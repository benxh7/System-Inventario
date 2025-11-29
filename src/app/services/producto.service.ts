import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, merge, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;           // entero
  categoria_id: number;
  stock: number;            // si ilimitado=true lo podemos mostrar como 0 o ∞ en UI
  ilimitado: boolean;
  imagen?: string;
}

export interface ProductoUpsert {
  codigo: string;
  nombre: string;
  precio: number;
  categoria_id: number;
  ilimitado: boolean;
  stock?: number;
  imagen?: string;
}

export interface StockHistoryRow {
  id: number;
  producto_id: number;
  delta: number;
  motivo?: string | null;
  fecha: string; // ISO
  usuario_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;
  private reload$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  /** Listado con filtros opcionales (q, categoria_id, paginación) */
  listar(opts?: { q?: string; categoria_id?: number; page?: number; size?: number }): Observable<Producto[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.categoria_id) params = params.set('categoria_id', opts.categoria_id);
    if (opts?.page) params = params.set('page', opts.page);
    if (opts?.size) params = params.set('size', opts.size);

    const req$ = this.http.get<Producto[]>(this.apiUrl, { params });

    return merge(
      req$,
      this.reload$.pipe(switchMap(() => this.http.get<Producto[]>(this.apiUrl, { params })))
    );
  }

  crear(p: ProductoUpsert): void {
    this.http.post<Producto>(this.apiUrl, p).subscribe(() => this.recargar());
  }

  actualizar(id: number, cambios: ProductoUpsert): void {
    this.http.put<Producto>(`${this.apiUrl}/${id}`, cambios).subscribe(() => this.recargar());
  }

  eliminar(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => this.recargar());
  }

  /** Ajuste de stock (positivo o negativo) */
  ajustarStock(producto_id: number, delta: number, motivo?: string) {
    return this.http.post<{ ok: true }>(`${environment.apiUrl}/stock/adjust`, {
      producto_id, delta, motivo
    });
  }

  /** Historial por producto */
  historial(producto_id: number) {
    return this.http.get<StockHistoryRow[]>(`${environment.apiUrl}/productos/${producto_id}/historial`);
  }

  private recargar(): void {
    this.reload$.next();
  }
}