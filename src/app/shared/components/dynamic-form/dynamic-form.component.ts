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
    if (changes['isOpen'] && this.isOpen) {
      this.openForm();
    }
  }

  // Budowanie formularza na podstawie tablicy pól
  private buildForm() {
    const formControls: { [key: string]: FormControl } = {};

    this.fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      if (field.type === 'number' && (field.min || field.max)) {
        validators.push(Validators.min(field.min || Number.MIN_SAFE_INTEGER));
        validators.push(Validators.max(field.max || Number.MAX_SAFE_INTEGER));
      }

      if (field.type === 'datetime') {
        // if field.value is 2025-04-23T19:55:00.600Z format convert to 2025-04-23T19:55
        if (field.value && !isNaN(Date.parse(field.value))) {
          const date = new Date(field.value);
          const dateString = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
          field.value = dateString;
        }
      }

      formControls[field.name] = new FormControl(
        { value: field.value || '', disabled: field.disabled || false },
        validators
      );
    });

    this.form = new FormGroup(formControls);
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
