import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Categoria { id: number; nombre: string; }

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private api = `${environment.apiUrl}/categorias`;
  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> { 
    return this.http.get<Categoria[]>(this.api); 
  }

  crear(nombre: string) { 
    return this.http.post<Categoria>(this.api, { nombre }); 
  }

  actualizar(id: number, nombre: string) {
    return this.http.put<Categoria>(`${this.api}/${id}`, { nombre });
  }

  eliminar(id: number, opts?: { reassign?: boolean }) {
    const params: any = {};
    if (opts?.reassign) params.reassign = true;
    return this.http.delete<void>(`${this.api}/${id}`, { params });
  }
}