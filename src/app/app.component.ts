import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})

export class AppComponent {
  isSidebarOpen: boolean = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}

