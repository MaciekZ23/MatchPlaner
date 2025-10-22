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
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // const token = sessionStorage.getItem('at');
    // if (token) {
    //   return true;
    // }
    // this.router.navigate(['/login']);
    // return false;

    if (this.auth.isLoggedIn()) return true;
    this.auth.logout();
    this.router.navigate(['/login']);
    return false;
  }
}
