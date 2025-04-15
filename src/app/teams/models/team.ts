export interface Team {
    id: number;
    name: string;
    logo?: string;
    players: Player[];
}

export interface Player {
    name: string;
    position: string;
    shirtNumber: number;
    healthStatus: 'Zdrowy' | 'Kontuzjowany';
}

