import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
  @Input() isOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  isMobile() {
    return window.innerWidth < 768;
  }

  ngOnInit() {
    if (this.isMobile()) {
      setTimeout(() => {
        this.isOpen = false;
        this.onToggleSidebar();
      }, 900);
    }

    const navigationLink = document.querySelector('.nav');
    if (navigationLink) {
      navigationLink.addEventListener('click', () => {
        if (this.isMobile()) {
          this.isOpen = !this.isOpen;
          this.onToggleSidebar();
        }
      });
    }
  }
}
