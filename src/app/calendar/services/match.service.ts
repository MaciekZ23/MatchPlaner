import { Injectable } from '@angular/core';
import { CalendarDay } from '../models/calendar-day.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor() { }

  getMockData(): CalendarDay[] {
    return [
      {
        date: 'Niedziela 19 stycznia 2025',
        matches: [
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 1,
            group: 'A',
            details: [
              { player: 'Tobiasz Grześkiewicz', time: '19', score: '2 - 1', scoringTeam: 'A' },
              { player: 'Norbert Szymankiewicz', time: '7', score: '1 - 1', scoringTeam: 'A' },
              { player: 'Kacper Kubiak', time: '11', score: '0 - 1', scoringTeam: 'B' }
            ]
          },
          {
            teamA: 'AKP Magros Konin',
            teamB: 'Tradycja Sarbicko',
            scoreA: 2,
            scoreB: 7,
            group: 'A',
            details: []
          }
        ]
      },
      {
        date: 'Piątek 24 stycznia 2025',
        matches: []
      }
    ];
  }
}
