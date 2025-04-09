import { Injectable } from "@angular/core";
import { TeamStats } from "../models/team-table.model";

@Injectable({
    providedIn: 'root'
})

export class TeamTableService {
    getTable(): TeamStats[] {
        return [
            { id: 1, name: 'Stajnia Kuniccy', rm: 7, w: 7, r: 0, p: 0, pkt: 20, bz: 29, bs: 7, diff: 22, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s" },
            { id: 2, name: 'DP Meble', rm: 7, w: 5, r: 1, p: 1, pkt: 2, bz: 24, bs: 12, diff: 12, logo: "https://yt3.googleusercontent.com/nnUt-yW5Y9hD7gVz18g8cobi3QIpsht3OBnO5e9trnJRe5nrs212CudWS6AdXNxjdgnimz7Kdw=s900-c-k-c0x00ffffff-no-rj" },
            { id: 3, name: 'Tradycja Sarbicko', rm: 7, w: 5, r: 0, p: 2, pkt: 15, bz: 22, bs: 16, diff: 6, logo: "https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj" },
            { id: 4, name: 'Transport Michalski', rm: 7, w: 3, r: 0, p: 4, pkt: 9, bz: 24, bs: 18, diff: 6, logo: "https://autoline.com.pl/img/dealers/logos/d/0/1575490699151597729.png?1576499575" },
            { id: 5, name: 'OSP Słodków', rm: 7, w: 2, r: 2, p: 3, pkt: 8, bz: 13, bs: 14, diff: -1, logo: "https://www.sokolkleczew.pl/wp-content/themes/sokolkleczew/img/logofb.png" },
            { id: 6, name: 'RKN Konin', rm: 7, w: 2, r: 1, p: 4, pkt: 7, bz: 18, bs: 19, diff: -1, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR98XyRz__qMBiKHDJ9x3Rf795XGy41jYT-uw&s" },
            { id: 7, name: 'AKP Magros Konin', rm: 7, w: 1, r: 2, p: 4, pkt: 5, bz: 19, bs: 37, diff: -18, logo: "https://play-lh.googleusercontent.com/Aqp_wNSGx1JGiuOD5FHk3fa5iQcZ2NzB9hy75N5lBrDm2OrQ_Jnka7__-yXQe1pjHCM" },
            { id: 8, name: 'MKS Żychlin', rm: 7, w: 0, r: 0, p: 7, pkt: 20, bz: 11, bs: 34, diff: -23, logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/ElanaTorun2016.png" },
            { id: 9, name: 'Czerwone Diabły', rm: 7, w: 6, r: 0, p: 1, pkt: 18, bz: 30, bs: 10, diff: 20, logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Herb_Pogo%C5%84.cdr.svg/1200px-Herb_Pogo%C5%84.cdr.svg.png" },
            { id: 10, name: 'FC Łaziki', rm: 7, w: 4, r: 1, p: 2, pkt: 13, bz: 21, bs: 15, diff: 6, logo: undefined },
            { id: 11, name: 'Warta Wilczyn', rm: 7, w: 8, r: 0, p: 4, pkt: 24, bz: 17, bs: 13, diff: 4, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Wisla_P%C5%82ock.png" },
            { id: 12, name: 'Zryw Zalesie', rm: 7, w: 2, r: 3, p: 2, pkt: 9, bz: 14, bs: 14, diff: 0, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4rcV9ZBqCeFvUdlVo0W9bFW64m8g-zc4rPQ&s" },
            { id: 18, name: 'Huragan Golina', rm: 7, w: 2, r: 1, p: 4, pkt: 7, bz: 13, bs: 20, diff: -7, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDO7F1yDmXTTN5k3LMAxI1A-VYe36khoWEdQ&s" },
            { id: 14, name: 'Start Jarocin', rm: 7, w: 1, r: 2, p: 4, pkt: 5, bz: 11, bs: 22, diff: -11, logo: undefined },
            { id: 15, name: 'Górnik Lubin', rm: 7, w: 1, r: 1, p: 5, pkt: 4, bz: 9, bs: 25, diff: -16, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGF1uEzEYNEeZ0qzg_GcllYg2rN29yjBu2Aw&s" },
            { id: 16, name: 'Polonia Skulsk', rm: 7, w: 0, r: 3, p: 4, pkt: 3, bz: 10, bs: 21, diff: -11, logo: "https://lh3.googleusercontent.com/proxy/-xrbTLuaa0frI7b69byY_kq2ourDeU13vg53eG1rW-8M-fcqFDPCdjQpe9sDDx0BM3CdPme69JhhGp1Q8ctIKtT-tPaYfbo0l4E" },
            { id: 17, name: 'Orzeł Czarnków', rm: 7, w: 0, r: 1, p: 6, pkt: 1, bz: 8, bs: 28, diff: -20, logo: undefined },
            { id: 13, name: 'Sokół Dąbie', rm: 7, w: 0, r: 0, p: 7, pkt: 0, bz: 5, bs: 35, diff: -30, logo: "https://sport.travel.pl/wp-content/uploads/2022/07/Real-Madryt-logo-600x700.jpg" }
        ];
    }
}
