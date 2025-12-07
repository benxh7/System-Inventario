import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioRegistro, UsuarioRespuesta } from '../models/usuario.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Metodo para registrar un nuevo usuario.
   * Este metodo recibe un objeto de tipo UsuarioRegistro
   * @param usuario 
   * @returns 
   */
  registrar(usuario: UsuarioRegistro): Observable<UsuarioRegistro> {
    return this.http.post<UsuarioRegistro>(
      `${this.apiUrl}/register`, usuario
    );
  }

  /**
   * Metodo para iniciar sesión.
   * Este metodo recibe un objeto con el correo y la contraseña del usuario.
   * @param credenciales 
   * @returns 
   */
  login(credenciales: { correo: string; contrasena: string; }) {
    return this.http.post<UsuarioRespuesta>(
      `${this.apiUrl}/login`,
      credenciales
    ).pipe(
      tap(res => {
        // Guardar token
        localStorage.setItem('token', res.token);
  
        // Guardar expiración, por ejemplo 30 minutos desde ahora
        const exp = new Date();
        exp.setMinutes(exp.getMinutes() + 30);
        localStorage.setItem('token_expiration', exp.toISOString());
      })
    );
  }

  /**
   * Metodo para guardar el usuario en las preferencias del dispositivo.
   * Este metodo recibe un objeto de tipo UsuarioRespuesta.
   * @param usuario 
   */
  async guardarUsuario(usuario: UsuarioRespuesta) {
    await Preferences.set({ key: 'usuario', value: JSON.stringify(usuario) });
  }

  /**
   * Metodo para obtener el usuario guardado en las preferencias del dispositivo.
   * Este metodo devuelve un objeto de tipo UsuarioRespuesta o null si no hay usuario guardado.
   * @returns 
   */
  async obtenerUsuario(): Promise<UsuarioRespuesta | null> {
    const { value } = await Preferences.get({ key: 'usuario' });
    return value ? JSON.parse(value) : null;
  }

  /**
   * Este ultimo metodo se encarga de cerrar la sesión del usuario.
   * Elimina el usuario guardado en las preferencias del dispositivo
   */
  async logout(): Promise<void> {
    await Preferences.remove({ key: 'usuario' }); // si sigues usando esto para datos del usuario
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiration');
    this.router.navigate(['/login']);
  }

}
