import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GoalkeepersCleanSheetsService {
  constructor() {}
  getCleanSheets() {
    return [
        { name: 'Jan Kowalski', team: 'Stajnia Kuniccy', cleanSheets: 10 },
        { name: 'Marek Zieliński', team: 'DP Meble', cleanSheets: 8 },
        { name: 'Adam Nowak', team: 'Tradycja Sarbicko', cleanSheets: 12 },
        { name: 'Piotr Kowalski', team: 'Transport Michalski', cleanSheets: 5 },
        { name: 'Krzysztof Wiśniewski', team: 'RKN Konin', cleanSheets: 9 },
        { name: 'Tomasz Wiśniewski', team: 'AKP Magros Konin', cleanSheets: 7 },
        { name: 'Szymon Zawisza', team: 'MKS Żychlin', cleanSheets: 6 },
        { name: 'Artur Nowak', team: 'Czerwone Diabły', cleanSheets: 10 },
        { name: 'Michał Kozak', team: 'FC Łaziki', cleanSheets: 4 },
        { name: 'Sebastian Górski', team: 'Warta Wilczyn', cleanSheets: 6 },
        { name: 'Jacek Wiśniewski', team: 'Zryw Zalesie', cleanSheets: 3 },
        { name: 'Paweł Ławniczak', team: 'Huragan Golina', cleanSheets: 5 },
        { name: 'Łukasz Piotrowski', team: 'Start Jarocin', cleanSheets: 2 },
        { name: 'Maciej Góralski', team: 'Górnik Lubin', cleanSheets: 7 },
        { name: 'Michał Puszka', team: 'Polonia Skulsk', cleanSheets: 1 },
        { name: 'Dariusz Gajos', team: 'Orzeł Czarnków', cleanSheets: 0 },
        { name: 'Marcin Duda', team: 'Sokół Dąbie', cleanSheets: 0 }
    ];
}
}
