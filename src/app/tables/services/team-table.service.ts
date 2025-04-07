import { Injectable } from "@angular/core";
import { TeamStats } from "../models/team-table.model";


@Injectable({
    providedIn: 'root'
})

export class TeamTableService {
    getTable(): TeamStats[] {
        return [
            { id: 1, name: 'Stajnia Kuniccy', rm: 7, w: 7, r: 0, p: 0, pkt: 21, bz: 29, bs: 7, diff: 22 },
            { id: 2, name: 'DP Meble', rm: 7, w: 5, r: 1, p: 1, pkt: 16, bz: 24, bs: 12, diff: 12 },
            { id: 3, name: 'Tradycja Sarbicko', rm: 7, w: 5, r: 0, p: 2, pkt: 15, bz: 22, bs: 16, diff: 6 },
            { id: 4, name: 'Transport Michalski', rm: 7, w: 3, r: 0, p: 4, pkt: 9, bz: 24, bs: 18, diff: 6 },
            { id: 5, name: 'OSP Słodków', rm: 7, w: 2, r: 2, p: 3, pkt: 8, bz: 13, bs: 14, diff: -1 },
            { id: 6, name: 'RKN Konin', rm: 7, w: 2, r: 1, p: 4, pkt: 7, bz: 18, bs: 19, diff: -1 },
            { id: 7, name: 'AKP Magros Konin', rm: 7, w: 1, r: 2, p: 4, pkt: 5, bz: 19, bs: 37, diff: -18 },
            { id: 8, name: 'MKS Żychlin', rm: 7, w: 0, r: 0, p: 7, pkt: 0, bz: 11, bs: 34, diff: -23 },
            { id: 9, name: 'Czerwone Diabły', rm: 7, w: 6, r: 0, p: 1, pkt: 18, bz: 30, bs: 10, diff: 20 },
            { id: 10, name: 'FC Łaziki', rm: 7, w: 4, r: 1, p: 2, pkt: 13, bz: 21, bs: 15, diff: 6 },
            { id: 11, name: 'Warta Wilczyn', rm: 7, w: 3, r: 2, p: 2, pkt: 11, bz: 17, bs: 13, diff: 4 },
            { id: 12, name: 'Zryw Zalesie', rm: 7, w: 2, r: 3, p: 2, pkt: 9, bz: 14, bs: 14, diff: 0 },
            { id: 13, name: 'Huragan Golina', rm: 7, w: 2, r: 1, p: 4, pkt: 7, bz: 13, bs: 20, diff: -7 },
            { id: 14, name: 'Start Jarocin', rm: 7, w: 1, r: 2, p: 4, pkt: 5, bz: 11, bs: 22, diff: -11 },
            { id: 15, name: 'Górnik Lubin', rm: 7, w: 1, r: 1, p: 5, pkt: 4, bz: 9, bs: 25, diff: -16 },
            { id: 16, name: 'Polonia Skulsk', rm: 7, w: 0, r: 3, p: 4, pkt: 3, bz: 10, bs: 21, diff: -11 },
            { id: 17, name: 'Orzeł Czarnków', rm: 7, w: 0, r: 1, p: 6, pkt: 1, bz: 8, bs: 28, diff: -20 },
            { id: 18, name: 'Sokół Dąbie', rm: 7, w: 0, r: 0, p: 7, pkt: 0, bz: 5, bs: 35, diff: -30 }
        ];
    }
}
