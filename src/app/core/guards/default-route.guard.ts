import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TournamentStore } from '../services/tournament-store.service';

@Injectable({ providedIn: 'root' })
export class DefaultRouteGuard implements CanActivate {
  private router = inject(Router);
  private store = inject(TournamentStore);

  canActivate(): UrlTree {
    const tid = this.store.getSelectedIdSync();
    return tid
      ? this.router.createUrlTree(['/', tid, 'home'])
      : this.router.createUrlTree(['/tournaments']);
  }
}
