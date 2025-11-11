import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, map, take, tap } from 'rxjs';
import { Team } from '../models/team';
import { TeamService } from './team.service';

@Injectable({ providedIn: 'root' })
export class TeamResolver implements Resolve<Team | null> {
  private teamService = inject(TeamService);
  private router = inject(Router);

  /**
   * Resolver ładuje dane konkretnej drużyny przed aktywacją routingu
   * Jeśli parametr id nie jest liczbą lub drużyna nie istnieje to redirect na /teams.
   */
  resolve(route: ActivatedRouteSnapshot): Observable<Team | null> {
    const id = Number(route.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.router.navigate(['/teams']);
      return of(null);
    }

    return this.teamService.getTeamById$(id).pipe(
      take(1),
      tap((team) => {
        if (!team) this.router.navigate(['/teams']);
      }),
      map((team) => team ?? null)
    );
  }
}
