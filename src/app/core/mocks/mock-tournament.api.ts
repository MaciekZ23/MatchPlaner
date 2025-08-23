import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ITournamentApi } from '../api/tournament.api';
import { Tournament, Team, Player, Match } from '../models';
import { MatchStatus } from '../types';

@Injectable()
export class MockTournamentApi implements ITournamentApi {
  private readonly STAGE_GRP = 'STAGE-GRP-1';
  private tournament: Tournament = {
    id: 't1',
    name: 'Liga halowa Toruń 2026 test',
    mode: 'LEAGUE',
    description:
      'Halowa Liga Piłki Nożnej Toruń to coroczne wydarzenie sportowe, które gromadzi drużyny z całego regionu. Edycja 2026 zapowiada się wyjątkowo emocjonująco – ponad 20 zespołów, setki kibiców i pasja, która napędza każdą akcję na boisku.',
    additionalInfo:
      'Wyniki, strzelcy bramek oraz szczegóły meczów będą uzupełniane na bieżąco po zakończeniu każdego meczu. Do zobaczenia na hali sportowej!',
    season: 'Edycja 2025',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    venue: 'Arena Toruń',
    venueAddress: 'ul. Józefa Bema 73/89, 87-100 Toruń',
    venueImageUrl: 'assets/MIEJSCA/ARENA-TORUN.jpg',
    groups: [
      {
        id: 'A',
        name: 'Grupa A',
        teamIds: [
          'T1',
          'T2',
          'T3',
          'T4',
          'T5',
          'T6',
          'T7',
          'T8',
          'T9',
          'T10',
          'T11',
          'T12',
          'T13',
          'T14',
          'T15',
          'T16',
          'T17',
          'T18',
        ],
      },
    ],
    stages: [
      { id: this.STAGE_GRP, name: 'Faza grupowa', kind: 'GROUP', order: 1 },
    ],
  };

  constructor() {
    this.tournament.groups = [
      {
        id: 'A',
        name: 'Grupa A',
        teamIds: [
          'T1',
          'T2',
          'T3',
          'T4',
          'T5',
          'T6',
          'T7',
          'T8',
          'T9',
          'T10',
          'T11',
          'T12',
          'T13',
          'T14',
          'T15',
          'T16',
          'T17',
          'T18',
        ],
      },
    ];
  }

  private teams: Team[] = [
    {
      id: 'T1',
      name: 'Lech Poznań',
      logo: 'assets/LOGA/LECH-POZNAN-LOGO.jpg',
      playerIds: ['P1', 'P2', 'P3'],
    },
    {
      id: 'T2',
      name: 'Motor Lublin',
      logo: 'assets/LOGA/MOTOR-LUBLIN-LOGO.jpg',
      playerIds: ['P4', 'P5', 'P6'],
    },
    {
      id: 'T3',
      name: 'Arka Gdynia',
      logo: 'assets/LOGA/ARKA-GDYNIA-LOGO.jpg',
      playerIds: ['P7', 'P8'],
    },
    {
      id: 'T4',
      name: 'Widzew Łódź',
      logo: 'assets/LOGA/WIDZEW-LODZ-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T5',
      name: 'Pogoń Szczecin',
      logo: 'assets/LOGA/POGON-SZCZECIN-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T6',
      name: 'Wisła Płock',
      logo: 'assets/LOGA/WISLA-PLOCK-LOGO.png',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T7',
      name: 'Jagiellonia Białystok',
      logo: 'assets/LOGA/JAGIELONIA-BIALYSTOK-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T8',
      name: 'Korona Kielce',
      logo: 'assets/LOGA/KORONA-KIELCE-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T9',
      name: 'Raków Częstochowa',
      logo: 'assets/LOGA/RAKOW-CZESTOCHOWA-LOGO.png',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T10',
      name: 'Piast Gliwice',
      logo: 'assets/LOGA/PIAST-GLIWICE-LOGO.png',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T11',
      name: 'Radomiak Radom',
      logo: 'assets/LOGA/RADOMIAK-RADOM-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T12',
      name: 'Cracovia',
      logo: 'assets/LOGA/CRACOVIA-LOGO.png',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T13',
      name: 'GKS Katowice',
      logo: 'assets/LOGA/GKS-KATOWICE-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T14',
      name: 'KGHM Zagłębie Lubin',
      logo: 'assets/LOGA/ZAGLEBIE-LUBIN-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T15',
      name: 'Bruk-Bet Termalica Nieciecza',
      logo: 'assets/LOGA/TERMALICA-NIECIECZA-LOGO.png',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T16',
      name: 'Górnik Zabrze',
      logo: 'assets/LOGA/GORNIK-ZABRZE-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T17',
      name: 'Lechia Gdańsk',
      logo: 'assets/LOGA/LECHIA-GDANSK-LOGO.png',
      playerIds: ['P9', 'P10'],
    },
    {
      id: 'T18',
      name: 'Legia Warszawa',
      logo: 'assets/LOGA/LEGIA-WARSZAWA-LOGO.jpg',
      playerIds: ['P9', 'P10'],
    },
  ];

  private players: Player[] = [
    {
      id: 'P1',
      teamId: 'T1',
      name: 'Tobiasz Grześkiewicz',
      position: 'FWD',
      shirtNumber: 9,
      healthStatus: 'HEALTHY',
    },
    {
      id: 'P2',
      teamId: 'T1',
      name: 'Norbert Szymankiewicz',
      position: 'MID',
      shirtNumber: 7,
      healthStatus: 'HEALTHY',
    },
    {
      id: 'P3',
      teamId: 'T1',
      name: 'Jan Kowalski',
      position: 'DEF',
      shirtNumber: 4,
      healthStatus: 'HEALTHY',
    },

    {
      id: 'P4',
      teamId: 'T2',
      name: 'Kacper Kubiak',
      position: 'FWD',
      shirtNumber: 11,
      healthStatus: 'HEALTHY',
    },
    {
      id: 'P5',
      teamId: 'T2',
      name: 'Michał Nowak',
      position: 'MID',
      shirtNumber: 8,
      healthStatus: 'HEALTHY',
    },
    {
      id: 'P6',
      teamId: 'T2',
      name: 'Bartosz Zieliński',
      position: 'GK',
      shirtNumber: 1,
      healthStatus: 'HEALTHY',
    },

    {
      id: 'P7',
      teamId: 'T3',
      name: 'Adam Wiśniewski',
      position: 'MID',
      shirtNumber: 10,
      healthStatus: 'HEALTHY',
    },
    {
      id: 'P8',
      teamId: 'T3',
      name: 'Piotr Lewandowski',
      position: 'DEF',
      shirtNumber: 3,
      healthStatus: 'INJURED',
    },

    {
      id: 'P9',
      teamId: 'T4',
      name: 'Kamil Tomaszewski',
      position: 'FWD',
      shirtNumber: 7,
      healthStatus: 'HEALTHY',
    },
    {
      id: 'P10',
      teamId: 'T4',
      name: 'Marcin Król',
      position: 'GK',
      shirtNumber: 12,
      healthStatus: 'HEALTHY',
    },
  ];

  private matches: Match[] = [
    {
      id: 'M1',
      stageId: this.STAGE_GRP,
      groupId: 'A',
      round: 1,
      date: '2025-08-01T18:00:00Z',
      status: 'FINISHED' as MatchStatus,
      homeTeamId: 'T1',
      awayTeamId: 'T2',
      score: { home: 2, away: 1 },
      events: [
        { minute: 12, type: 'GOAL', playerId: 'P1', teamId: 'T1' },
        { minute: 34, type: 'GOAL', playerId: 'P4', teamId: 'T2' },
        { minute: 58, type: 'GOAL', playerId: 'P2', teamId: 'T1' },
      ],
    },
    {
      id: 'M2',
      stageId: this.STAGE_GRP,
      groupId: 'A',
      round: 1,
      date: '2025-08-01T19:00:00Z',
      status: 'FINISHED' as MatchStatus,
      homeTeamId: 'T3',
      awayTeamId: 'T4',
      score: { home: 0, away: 0 },
      events: [],
    },
    {
      id: 'M3',
      stageId: this.STAGE_GRP,
      groupId: 'A',
      round: 2,
      date: '2025-08-08T18:00:00Z',
      status: 'SCHEDULED' as MatchStatus,
      homeTeamId: 'T1',
      awayTeamId: 'T3',
      events: [],
    },
    {
      id: 'M4',
      stageId: this.STAGE_GRP,
      groupId: 'A',
      round: 2,
      date: '2025-08-08T19:00:00Z',
      status: 'SCHEDULED' as MatchStatus,
      homeTeamId: 'T2',
      awayTeamId: 'T4',
      events: [],
    },
  ];

  getTournament() {
    return of(this.tournament);
  }

  getTeams() {
    return of(this.teams);
  }

  getPlayers() {
    return of(this.players);
  }

  getMatches(stageId: string) {
    return of(this.matches.filter((m) => m.stageId === stageId));
  }
}
