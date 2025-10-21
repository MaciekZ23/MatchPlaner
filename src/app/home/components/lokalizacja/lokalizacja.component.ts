import {
  Component,
  ChangeDetectionStrategy,
  inject,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LokalizacjaService } from '../../services/lokalizacja.service';
import { stringsLokalizacja } from '../../misc';
import { distinctUntilChanged, map, tap } from 'rxjs';

@Component({
  selector: 'app-lokalizacja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lokalizacja.component.html',
  styleUrls: ['./lokalizacja.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LokalizacjaComponent implements AfterViewInit, OnDestroy {
  moduleStrings = stringsLokalizacja;
  isLocationOpen = false;

  private service = inject(LokalizacjaService);
  private cdr = inject(ChangeDetectorRef);

  imgError = false;

  name$ = this.service.name$;
  address$ = this.service.address$;
  imageUrl$ = this.service.imageUrl$.pipe(
    map((u) => (u ?? '').trim()),
    distinctUntilChanged(),
    tap(() => {
      this.imgError = false;
      this.cdr.markForCheck();
    })
  );
  imageAlt$ = this.service.imageAlt$;

  @ViewChild('locToggleBtn', { static: false })
  locToggleBtn!: ElementRef<HTMLElement>;
  private tt: any | null = null;

  ngAfterViewInit(): void {
    const bs = (window as any)?.bootstrap;
    const el = this.locToggleBtn?.nativeElement;
    if (bs?.Tooltip && el) {
      this.tt =
        bs.Tooltip.getInstance?.(el) ??
        new bs.Tooltip(el, { placement: 'top' });
    }
  }

  ngOnDestroy(): void {
    this.tt?.dispose?.();
    this.tt = null;
  }

  toggleLocation(): void {
    this.isLocationOpen = !this.isLocationOpen;
    const bs = (window as any)?.bootstrap;
    const el = this.locToggleBtn?.nativeElement;
    if (!bs?.Tooltip || !el) return;

    el.setAttribute(
      'data-bs-title',
      this.isLocationOpen ? 'Zwiń sekcję' : 'Rozwiń sekcję'
    );

    const inst = this.tt ?? bs.Tooltip.getInstance?.(el);
    if (inst?.setContent) {
      inst.setContent({
        '.tooltip-inner': el.getAttribute('data-bs-title') || '',
      });
    } else {
      inst?.dispose?.();
      this.tt = new bs.Tooltip(el, { placement: 'top' });
    }
  }

  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
  }

  onImgLoad() {
    this.imgError = false;
    this.cdr.markForCheck();
  }

  onImgError() {
    this.imgError = true;
    this.cdr.markForCheck();
  }
}
