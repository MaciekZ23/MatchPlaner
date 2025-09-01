import { HealthStatus, Position } from '../../../core/types';

export function positionPl(pos: Position): string {
  switch (pos) {
    case 'GK':
      return 'Bramkarz';
    case 'DEF':
      return 'Obrońca';
    case 'MID':
      return 'Pomocnik';
    case 'FWD':
      return 'Napastnik';
    default:
      return 'Nieznana pozycja';
  }
}

export function healthPl(h: HealthStatus): 'Zdrowy' | 'Kontuzjowany' {
  return h === 'HEALTHY' ? 'Zdrowy' : 'Kontuzjowany';
}
