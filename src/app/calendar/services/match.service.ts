import { Injectable } from '@angular/core';
import { CalendarDay } from '../models/calendar-day.model';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  constructor() {}

  getMockData(): CalendarDay[] {
    return [
      {
        date: 'Niedziela, 19 stycznia 2025',
        matches: [
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 1,
            group: 'A',
            details: [
              {
                player: 'Tobiasz Grześkiewicz',
                time: '19',
                score: '2 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Norbert Szymankiewicz',
                time: '7',
                score: '1 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Kacper Kubiak',
                time: '11',
                score: '0 - 1',
                scoringTeam: 'B',
              },
            ],
          },
          {
            teamA: 'AKP Magros Konin',
            teamB: 'Tradycja Sarbicko',
            scoreA: 2,
            scoreB: 7,
            group: 'A',
            details: [],
          },
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 1,
            group: 'A',
            details: [
              {
                player: 'Tobiasz Grześkiewicz',
                time: '19',
                score: '2 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Norbert Szymankiewicz',
                time: '7',
                score: '1 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Kacper Kubiak',
                time: '11',
                score: '0 - 1',
                scoringTeam: 'B',
              },
            ],
          },
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 2,
            logoA:
              'https://sport.travel.pl/wp-content/uploads/2022/07/Real-Madryt-logo-600x700.jpg',
            logoB:
              'https://sport.travel.pl/wp-content/uploads/2022/07/Real-Madryt-logo-600x700.jpg',
            group: 'A',
            details: [
              {
                player: 'Tobiasz Grześkiewicz',
                time: '19',
                score: '2 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Norbert Szymankiewicz',
                time: '7',
                score: '1 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Kacper Kubiak',
                time: '11',
                score: '0 - 1',
                scoringTeam: 'B',
              },
            ],
          },
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 1,
            group: 'A',
            details: [
              {
                player: 'Tobiasz Grześkiewicz',
                time: '19',
                score: '2 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Norbert Szymankiewicz',
                time: '7',
                score: '1 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Kacper Kubiak',
                time: '11',
                score: '0 - 1',
                scoringTeam: 'B',
              },
            ],
          },
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 1,
            group: 'A',
            details: [
              {
                player: 'Tobiasz Grześkiewicz',
                time: '19',
                score: '2 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Norbert Szymankiewicz',
                time: '7',
                score: '1 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Kacper Kubiak',
                time: '11',
                score: '0 - 1',
                scoringTeam: 'B',
              },
            ],
          },
          {
            teamA: 'DP Meble',
            teamB: 'RKN Konin',
            scoreA: 2,
            scoreB: 1,
            group: 'A',
            details: [
              {
                player: 'Tobiasz Grześkiewicz',
                time: '19',
                score: '2 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Norbert Szymankiewicz',
                time: '7',
                score: '1 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Kacper Kubiak',
                time: '11',
                score: '0 - 1',
                scoringTeam: 'B',
              },
            ],
          },
        ],
      },

      {
        date: 'Piątek, 24 stycznia 2025',
        matches: [
          {
            teamA: 'Orły Gniezno',
            teamB: 'Wilki Kalisz',
            scoreA: 2,
            scoreB: 2,
            group: 'A',
            details: [
              {
                player: 'Łukasz Nowak',
                time: '9',
                score: '2 - 0',
                scoringTeam: 'A',
              },
              {
                player: 'Adam Wiśniewski',
                time: '15',
                score: '2 - 1',
                scoringTeam: 'B',
              },
              {
                player: 'Kamil Zieliński',
                time: '22',
                score: '3 - 1',
                scoringTeam: 'A',
              },
              {
                player: 'Tomasz Lis',
                time: '28',
                score: '3 - 2',
                scoringTeam: 'B',
              },
            ],
          },
        ],
      },
      {
        date: 'Sobota, 24 pażdziernika 2025',
        matches: [
          {
            teamA: 'Orły Gniezno',
            teamB: 'Wilki Kalisz',
            scoreA: 3,
            scoreB: 1,
            logoA:
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5X9Ni2yvuJk46KrCeZwMDzl-RYtqcfI9ogw&s',
            logoB:
              'https://upload.wikimedia.org/wikipedia/en/e/eb/KKS_1925_Kalisz_new_crest.png',
            group: 'B',
            details: [
              {
                player: 'Michał Kowalski',
                time: '5',
                score: '1 - 0',
                scoringTeam: 'A',
              },
              {
                player: 'Łukasz Nowak',
                time: '14',
                score: '2 - 0',
                scoringTeam: 'A',
              },
              {
                player: 'Kamil Zieliński',
                time: '21',
                score: '3 - 0',
                scoringTeam: 'A',
              },
              {
                player: 'Adam Wiśniewski',
                time: '27',
                score: '3 - 1',
                scoringTeam: 'B',
              },
            ],
          },
        ],
      },
    ];
  }
}
