import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, catchError, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  constructor(private router: Router, private auth: AuthService) {}

  /**
   * Przechwytywanie requestów HTTP i dodawanie tokenu `Authorization` Bearer
   * - jeśli request zwróci 401 i mamy refresh token to odświeżanie tokenu i ponowne wysłanie requestu
   * - jeśli brak refresh tokenu lub odświeżanie się nie uda to wylogowywanie i przekierowanie na `/login`
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('at');
    let authReq = req;
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // odświeżanie tokenu tylko 1 raz
        if (error.status === 401 && !authReq.headers.has('X-Refresh-Attempt')) {
          const refreshToken = sessionStorage.getItem('rt');
          if (refreshToken && !this.isRefreshing) {
            this.isRefreshing = true;
            return this.auth.refreshAccessToken().pipe(
              switchMap(({ accessToken }) => {
                this.isRefreshing = false;
                if (accessToken) {
                  const retry = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${accessToken}`,
                      'X-Refresh-Attempt': '1',
                    },
                  });
                  return next.handle(retry);
                }
                this.handleLogout();
                return throwError(() => error);
              }),
              catchError((err) => {
                this.isRefreshing = false;
                this.handleLogout();
                return throwError(() => err);
              })
            );
          }
          this.handleLogout();
        } else if (error.status === 403) {
          console.warn('Brak uprawnień do wykonania tej operacji');
        }
        return throwError(() => error);
      })
    );
  }

  /** Czyszczenie sesji oraz przekierowywanie na stronę logowania */
  private handleLogout() {
    sessionStorage.removeItem('at');
    sessionStorage.removeItem('rt');
    sessionStorage.removeItem('avatar');
    this.router.navigate(['/login']);
  }
}
