import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-match-card',
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss'
})
export class MatchCardComponent {
  @Input() match: any;
  @Output() openDetails = new EventEmitter<void>();

  onClick() {
    this.openDetails.emit();
  }
}
