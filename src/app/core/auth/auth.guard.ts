import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) {}

  /**
   * Sprawdzanie, czy użytkownik jest zalogowany
   * - jeśli tak to wpuszczamy dalej
   * - jeśli nie to wylogowywanie i przekierowanie na `/login`
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    this.auth.logout();
    this.router.navigate(['/login']);
    return false;
  }
}
