export interface Team {
  id: number;
  name: string;
  logo?: string;
  groupId?: string | null;
  players: Player[];
}

export interface Player {
  name: string;
  position: string;
  shirtNumber?: number;
  healthStatus: 'Zdrowy' | 'Kontuzjowany';
}
