import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LokalizacjaComponent } from './components/lokalizacja.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LokalizacjaComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {}
