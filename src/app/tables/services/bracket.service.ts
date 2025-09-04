import { Injectable } from '@angular/core';
import { BehaviorSubject, map, of } from 'rxjs';
import { BracketMatch } from '../models';

@Injectable({ providedIn: 'root' })
export class BracketService {
  private matches$$ = new BehaviorSubject<BracketMatch[]>([]);
  matches$ = this.matches$$.asObservable();

  getMatches$(stageId: string) {
    return this.matches$.pipe(
      map((ms) => ms.filter((m) => m.stageId === stageId))
    );
  }

  setMatches(matches: BracketMatch[]) {
    this.matches$$.next(matches);
  }

  promoteWinner(childId: string, winner: 'HOME' | 'AWAY') {
    const ms = this.matches$$.getValue().map((m) => ({ ...m }));
    const child = ms.find((m) => m.id === childId);
    if (!child || !child.parentMatchId) {
      return;
    }

    const winnerTeamRef = winner === 'HOME' ? child.home.ref : child.away.ref;
    const parent = ms.find((m) => m.id === child.parentMatchId);
    if (!parent) {
      return;
    }

    const slot =
      parent.home.type === 'WINNER' && parent.home.ref === childId
        ? 'home'
        : parent.away.type === 'WINNER' && parent.away.ref === childId
        ? 'away'
        : null;

    if (!slot) {
      return;
    }
    parent[slot] = { type: 'TEAM', ref: winnerTeamRef };
    this.matches$$.next(ms);
  }
}
