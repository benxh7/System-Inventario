import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Registro } from '../models/registro.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private apiUrl = `${environment.apiUrl}/registros`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Registro[]> {
    return this.http.get<Registro[]>(this.apiUrl);
  }

  obtener(id: number) {
    return this.http.get<Registro>(`${this.apiUrl}/${id}`);
  }

  crear(payload: Registro) {
    return this.http.post<Registro>(this.apiUrl, payload);
  }
}
