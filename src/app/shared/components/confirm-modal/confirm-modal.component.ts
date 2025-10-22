import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalLabels, ConfirmModalOptions } from './models';
import { ConfirmModalSize, ConfirmVariant } from './types';
import { stringsConfirmModal } from './misc';

declare const bootstrap: any;
let uid = 0;

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modalRef', { static: true })
  modalRef!: ElementRef<HTMLDivElement>;

  @Input() idPrefix = `confirm-modal-${++uid}`;
  @Input() title?: string;
  @Input() message?: string;
  @Input() labels: ConfirmModalLabels = {};
  @Input() size: ConfirmModalSize = 'md';
  @Input() confirmVariant: ConfirmVariant = 'primary';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  currentTitle = '';
  currentMessage = '';
  currentLabels: Required<ConfirmModalLabels> = {
    confirm: '',
    cancel: '',
    closeAria: '',
  };
  currentSize: ConfirmModalSize = 'md';
  currentVariant: ConfirmVariant = 'primary';

  private modalInstance: any;
  private pendingResolve?: (value: boolean) => void;
  private wasAction = false;

  ngAfterViewInit(): void {
    this.modalInstance = bootstrap.Modal.getOrCreateInstance(
      this.modalRef.nativeElement,
      { backdrop: 'static', keyboard: false, focus: true }
    );

    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      if (!this.wasAction && this.pendingResolve) {
        this.pendingResolve(false);
        this.pendingResolve = undefined;
      }
      this.wasAction = false;
      this.closed.emit();
    });
    this.applyOptions();
  }

  ngOnDestroy(): void {
    try {
      this.modalInstance?.dispose?.();
    } catch {
      if (this.pendingResolve) {
        this.pendingResolve(false);
        this.pendingResolve = undefined;
      }
    }
  }

  open(opts?: ConfirmModalOptions): Promise<boolean> {
    this.applyOptions(opts);
    this.cdr.detectChanges();
    this.wasAction = false;
    this.modalInstance?.show();

    return new Promise<boolean>((resolve) => {
      this.pendingResolve = resolve;
    });
  }

  confirm(): void {
    this.wasAction = true;
    this.confirmed.emit();
    if (this.pendingResolve) {
      this.pendingResolve(true);
      this.pendingResolve = undefined;
    }
    this.modalInstance?.hide();
  }

  cancel(): void {
    this.wasAction = true;
    this.cancelled.emit();
    if (this.pendingResolve) {
      this.pendingResolve(false);
      this.pendingResolve = undefined;
    }
    this.modalInstance?.hide();
  }

  close(): void {
    this.cancel();
  }

  private applyOptions(opts?: ConfirmModalOptions): void {
    const s = stringsConfirmModal;
    this.currentTitle = opts?.title ?? this.title ?? s.title;
    this.currentMessage = opts?.message ?? this.message ?? s.message;
    this.currentLabels = {
      confirm: opts?.labels?.confirm ?? this.labels.confirm ?? s.confirm,
      cancel: opts?.labels?.cancel ?? this.labels.cancel ?? s.cancel,
      closeAria:
        opts?.labels?.closeAria ?? this.labels.closeAria ?? s.closeAria,
    };
    this.currentSize = opts?.size ?? this.size ?? 'md';
    this.currentVariant =
      opts?.confirmVariant ?? this.confirmVariant ?? 'primary';
  }
}
