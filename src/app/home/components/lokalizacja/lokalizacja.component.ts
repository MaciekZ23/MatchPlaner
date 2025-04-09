import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lokalizacja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lokalizacja.component.html',
  styleUrls: ['./lokalizacja.component.scss']
})

export class LokalizacjaComponent {
  isLocationOpen = false;

  toggleLocation(): void {
    this.isLocationOpen = !this.isLocationOpen;
  }
}
