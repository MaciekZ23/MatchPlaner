import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField } from './models/form-field';
import { CommonModule } from '@angular/common';
import { SimpleChanges } from '@angular/core';

declare const bootstrap: any;

@Component({
  selector: 'app-dynamic-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() fields: FormField[] = [];
  @Input() formTitle: string = '';
  @Input() isOpen: boolean = false;
  @Output() formSubmitted = new EventEmitter<FormField[]>();
  @Output() close = new EventEmitter<void>();

  NumMin: number = Number.MIN_SAFE_INTEGER; // Minimalna wartość dla pól liczbowych
  NumMax: number = Number.MAX_SAFE_INTEGER; // Maksymalna wartość dla pól liczbowych

  windowWidth: number = window.innerWidth; // Szerokość okna przeglądarki

  form!: FormGroup;
  idModal: string =
    'formModal' + this.formTitle.length + '' + Math.floor(Math.random() * 1000); // Unikalny identyfikator dla modala

  ngOnInit() {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      if (!this.form) {
        this.buildForm();
      } else {
        this.syncFormWithFields();
      }
    }

    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.syncFormWithFields();
      this.openForm();
    }
  }

  // Budowanie formularza na podstawie tablicy pól
  private buildForm() {
    const controls: Record<string, FormControl> = {};
    for (const f of this.fields) {
      controls[f.name] = new FormControl(
        { value: this.coerceValue(f), disabled: !!f.disabled },
        this.getValidators(f)
      );
    }
    this.form = new FormGroup(controls);
  }

  private syncFormWithFields() {
    if (!this.form) {
      return;
    }

    for (const f of this.fields) {
      const ctrl = this.form.get(f.name) as FormControl | null;
      const val = this.coerceValue(f);
      const validators = this.getValidators(f);

      if (!ctrl) {
        this.form.addControl(
          f.name,
          new FormControl({ value: val, disabled: !!f.disabled }, validators)
        );
      } else {
        ctrl.setValidators(validators);
        ctrl.updateValueAndValidity({ emitEvent: false });
      }
    }

    Object.keys(this.form.controls).forEach((name) => {
      if (!this.fields.some((f) => f.name === name)) {
        this.form.removeControl(name);
      }
    });

    const values = this.fields.reduce<Record<string, any>>((acc, f) => {
      acc[f.name] = this.coerceValue(f);
      return acc;
    }, {});
    this.form.patchValue(values, { emitEvent: false });
  }

  private getValidators(field: FormField) {
    const v = field.required ? [Validators.required] : [];
    if (field.type === 'email') v.push(Validators.email);
    if (field.type === 'number') {
      if (field.min != null) v.push(Validators.min(field.min));
      if (field.max != null) v.push(Validators.max(field.max));
    }
    return v;
  }

  private coerceValue(field: FormField) {
    if (
      field.type === 'datetime' &&
      field.value &&
      !isNaN(Date.parse(field.value))
    ) {
      return new Date(field.value).toISOString().slice(0, 16);
    }
    if (field.type === 'number') {
      // number albo null (puste pole) – NIE string
      if (field.value === '' || field.value == null) return null;
      const n = Number(field.value);
      return Number.isFinite(n) ? n : null;
    }
    if (field.type === 'select') {
      // wartości opcji masz jako stringi ('GK','DEF',...), więc zwracaj string
      return field.value ?? '';
    }
    // text itp.
    return field.value ?? '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const updatedFields = this.fields.map((field) => ({
        ...field,
        value: this.form.get(field.name)?.value,
      }));

      this.formSubmitted.emit(updatedFields);

      this.resetForm();
      this.closeForm();
    }
  }

  onClose(): void {
    this.resetForm();
    this.closeForm();
  }

  private resetForm(): void {
    const resetValues: any = {};
    this.fields.forEach((field) => {
      resetValues[field.name] = field.type === 'checkbox' ? false : '';
    });
    this.form.reset(resetValues);
  }

  private openForm(): void {
    const modalElement = document.getElementById(this.idModal);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false,
      });
      modal.show();
    }
  }

  private closeForm(): void {
    const modalElement = document.getElementById(this.idModal);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
    this.close.emit();
  }

  calcTotalSpan(field: FormField): string {
    let totalSpan = field.totalSpan || 12; // Domyślnie 12 kolumn
    if (totalSpan < 1 || totalSpan > 12) {
      totalSpan = 12;
    } // Ograniczenie do 1-12 kolumn
    return `col-${totalSpan}`;
  }

  calcActualSpan(field: FormField): string {
    const actualSpan = field.actualSpan || 12; // Domyślnie 12 kolumn
    if (actualSpan < 1 || actualSpan > 12) {
      return 'col-12';
    } // Ograniczenie do 1-12 kolumn
    return `col-${actualSpan}`;
  }
}
