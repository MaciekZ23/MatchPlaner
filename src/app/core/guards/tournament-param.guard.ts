import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TournamentStore } from '../services/tournament-store.service';
import { HttpTournamentApi } from '../api/http-tournament.api';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TournamentParamGuard implements CanActivate {
  private store = inject(TournamentStore);
  private api = inject(HttpTournamentApi);
  private router = inject(Router);

  /**
   * Weryfikowanie parametru `tid` w URL
   * - jeśli brak `tid` → przekierowanie na listę turniejów
   * - jeśli turniej jest już wybrany w store → wpuszczenie
   * - jeśli turniej nie jest wybrany → pobieranie turnieju z API,
   *   ustawianie turnieju w store i wpuszczenie
   */
  canActivate(route: ActivatedRouteSnapshot) {
    const tid = route.paramMap.get('tid');
    if (!tid) return this.router.createUrlTree(['/tournaments']);

    // Turniej już wybrany to pozwalamy wejść
    if (this.store.getSelectedIdSync() === tid) {
      return true;
    }

    // Próba pobrania turnieju i ustawienia go w store
    return this.api.getTournament(tid).pipe(
      map(() => {
        this.store.setTournament(tid);
        return true;
      }),
      catchError(() => of(this.router.createUrlTree(['/tournaments'])))
    );
  }
}
