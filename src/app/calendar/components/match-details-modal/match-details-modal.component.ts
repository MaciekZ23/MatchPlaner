import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../models/match.model';
import { stringsMatchDetails } from '../../misc';

declare const bootstrap: any;

@Component({
  selector: 'app-match-details-modal',
  imports: [CommonModule],
  templateUrl: './match-details-modal.component.html',
  styleUrl: './match-details-modal.component.scss',
  standalone: true,
})
export class MatchDetailsModalComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() match: Match | null = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalRef', { static: true })
  modalRef!: ElementRef<HTMLDivElement>;

  moduleStrings = stringsMatchDetails;
  private modalInstance: any;

  ngAfterViewInit(): void {
    this.modalInstance = bootstrap.Modal.getOrCreateInstance(
      this.modalRef.nativeElement,
      {
        backdrop: 'static',
        keyboard: false,
        focus: true,
      }
    );

    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.close.emit();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.modalInstance) {
      return;
    }
    if (changes['match']) {
      if (this.match) {
        this.modalInstance.show();
      } else {
        this.modalInstance.hide();
      }
    }
  }

  ngOnDestroy(): void {
    try {
      this.modalInstance?.dispose?.();
    } catch {}
  }

  onRequestClose(): void {
    this.modalInstance?.hide();
  }

  onClose() {
    this.close.emit();
  }

  get teamAScorers() {
    return this.match?.details.filter((d) => d.scoringTeam === 'A') ?? [];
  }

  get teamBScorers() {
    return this.match?.details.filter((d) => d.scoringTeam === 'B') ?? [];
  }
}
