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
        date: 'Sobota, 3 stycznia 2026',
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
            scoreB: 2,
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
        ],
      },

      {
        date: 'Sobota, 10 stycznia 2026',
        matches: [
          {
            teamA: 'Orły Gniezno',
            teamB: 'Wilki Kalisz',
            scoreA: 3,
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
        date: 'Sobota, 17 stycznia 2026',
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

      {
        date: 'Sobota, 24 stycznia 2026',
        matches: [
          {
            teamA: 'Stal Pleszew',
            teamB: 'KKS Kalisz',
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
      {
        date: 'Sobota, 31 styczeń 2026',
        matches: [],
      },
      {
        date: 'Piątek, 6 luty 2026',
        matches: [],
      },
      {
        date: 'Sobota, 14 luty 2026',
        matches: [
          {
            teamA: 'Mocni Mogilno',
            teamB: 'Pogoń Nowe Skalmierzyce',
            scoreA: 1,
            scoreB: 2,
            logoA:
              'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
            logoB:
              'https://lh3.googleusercontent.com/proxy/-xrbTLuaa0frI7b69byY_kq2ourDeU13vg53eG1rW-8M-fcqFDPCdjQpe9sDDx0BM3CdPme69JhhGp1Q8ctIKtT-tPaYfbo0l4E',
            group: 'D',
            details: [
              {
                player: 'Łukasz Nowak',
                time: '9',
                score: '1 - 0',
                scoringTeam: 'A',
              },
              {
                player: 'Adam Wiśniewski',
                time: '15',
                score: '1 - 1',
                scoringTeam: 'B',
              },
              {
                player: 'Tomasz Lis',
                time: '49',
                score: '1 - 2',
                scoringTeam: 'B',
              },
            ],
          },
        ],
      },
    ];
  }
}
