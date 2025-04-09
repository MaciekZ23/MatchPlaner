import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TopScorerService {
    constructor() { }

    //Funkcja do obliczania klasyfikacji kanadyjskiej
    calculateCanadianPoints(player: any): number {
        return player.goals + player.assists;
    }

    // Funkcja do sortowania zawodnikow po liczbie goli
    sortByGoals(topScorers: any[]): any[] {
        return topScorers.sort((a, b) => b.goals - a.goals);
    }

    getTopScorers(): Observable<any[]> {
        const topScorers = [
            { name: 'Adam Pacholski', team: 'Transport Michalski', goals: 12, assists: 2, },
            { name: 'Dawid Kuschek', team: 'AKP Magros Konin', goals: 9, assists: 3 },
            { name: 'Patryk Janicki', team: 'Stajnia Kuniccy', goals: 9, assists: 5 },
            { name: 'Jarosław Gorgolewski', team: 'Tradycja Sarbicko', goals: 8, assists: 1 },
            { name: 'Kacper Kubiak', team: 'RKN Konin', goals: 8, assists: 3 },
            { name: 'Tobiasz Grześkiewicz', team: 'DP Meble', goals: 6, assists: 1 },
            { name: 'Stanisław Mikołajczyk', team: 'Stajnia Kuniccy', goals: 5, assists: 5 },
            { name: 'Szymon Matuszak', team: 'Transport Michalski', goals: 5, assists: 4 },
            { name: 'Łukasz Pakulski', team: 'MKS Żychlin', goals: 5, assists: 3 },
            { name: 'Miłosz Oblizajek', team: 'Stajnia Kuniccy', goals: 4, assists: 1, },
            { name: 'Michał Nowak', team: 'Stajnia Kuniccy', goals: 7, assists: 2 },
            { name: 'Maciej Kowalski', team: 'AKP Magros Konin', goals: 5, assists: 3 },
            { name: 'Paweł Zawisza', team: 'DP Meble', goals: 6, assists: 0 },
            { name: 'Krystian Zieliński', team: 'RKN Konin', goals: 4, assists: 5 },
            { name: 'Janusz Majewski', team: 'Transport Michalski', goals: 13, assists: 6 }
        ];

        const sortedTopScorers = this.sortByGoals(topScorers);

        const topScorersWithPoints = sortedTopScorers.map(player => ({
            ...player,
            points: this.calculateCanadianPoints(player)
        }));

        return of(topScorersWithPoints);
    }
}