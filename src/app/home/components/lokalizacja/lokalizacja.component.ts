import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { stringsLokalizacja } from '../../misc';
import { TournamentStore } from '../../../core/services/tournament-store.service';

@Component({
  selector: 'app-lokalizacja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lokalizacja.component.html',
  styleUrls: ['./lokalizacja.component.scss'],
})
export class LokalizacjaComponent {
  moduleStrings = stringsLokalizacja;
  isLocationOpen = false;

  toggleLocation(): void {
    this.isLocationOpen = !this.isLocationOpen;
  }

  private readonly store = inject(TournamentStore);

  name$ = this.store.tournament$.pipe(
    map((t) => t.venue ?? this.moduleStrings.name)
  );
  address$ = this.store.tournament$.pipe(
    map((t) => t.venueAddress ?? this.moduleStrings.address)
  );
  imageUrl$ = this.store.tournament$.pipe(map((t) => t.venueImageUrl ?? ''));
  imageAlt$ = this.store.tournament$.pipe(
    map((t) => t.venue ?? this.moduleStrings.imageAlt)
  );
}
