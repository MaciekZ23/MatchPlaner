import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LokalizacjaService } from '../../services/lokalizacja.service';
import { stringsLokalizacja } from '../../misc';

@Component({
  selector: 'app-lokalizacja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lokalizacja.component.html',
  styleUrls: ['./lokalizacja.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LokalizacjaComponent {
  moduleStrings = stringsLokalizacja;
  isLocationOpen = false;

  private service = inject(LokalizacjaService);

  name$ = this.service.name$;
  address$ = this.service.address$;
  imageUrl$ = this.service.imageUrl$;
  imageAlt$ = this.service.imageAlt$;

  toggleLocation(): void {
    this.isLocationOpen = !this.isLocationOpen;
  }
}
