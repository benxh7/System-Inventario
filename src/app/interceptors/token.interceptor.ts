import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(Preferences.get({ key: 'usuario' })).pipe(
      switchMap(({ value }) => {
        const stored = value ? JSON.parse(value) : null;
        const token = stored?.token;
        const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` }}) : req;
        return next.handle(authReq);
      })
    );
  }
}