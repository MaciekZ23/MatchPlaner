import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormField,
  RepeaterFormField,
  SelectFormField,
} from './models/form-field';
import { CommonModule } from '@angular/common';
import { SimpleChanges } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';

declare const bootstrap: any;

@Component({
  selector: 'app-dynamic-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fields: FormField[] = [];
  @Input() formTitle: string = '';
  @Input() isOpen: boolean = false;
  @Output() formSubmitted = new EventEmitter<FormField[]>();
  @Output() close = new EventEmitter<void>();
  @Output() valueChanges = new EventEmitter<Record<string, any>>();

  private valueSub?: any;

  NumMin: number = Number.MIN_SAFE_INTEGER; // Minimalna wartość dla pól liczbowych
  NumMax: number = Number.MAX_SAFE_INTEGER; // Maksymalna wartość dla pól liczbowych

  windowWidth: number = window.innerWidth; // Szerokość okna przeglądarki

  form!: FormGroup;
  idModal: string =
    'formModal' + this.formTitle.length + '' + Math.floor(Math.random() * 1000); // Unikalny identyfikator dla modala

  ngOnInit() {
    this.buildForm();
    this.wireValueChanges();
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
      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.syncFormWithFields();
      this.openForm();
    }
  }

  ngOnDestroy(): void {
    if (this.valueSub) {
      this.valueSub.unsubscribe();
    }
  }

  private wireValueChanges(): void {
    if (!this.form) {
      return;
    }
    if (this.valueSub) {
      this.valueSub.unsubscribe();
    }
    this.valueSub = this.form.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((v) => this.valueChanges.emit(v));
  }

  // Budowanie formularza na podstawie tablicy pól
  private buildForm() {
    const controls: Record<string, AbstractControl> = {};
    for (const f of this.fields) {
      if (f.type === 'repeater') {
        controls[f.name] = this.buildRepeaterControl(f as RepeaterFormField);
      } else {
        controls[f.name] = new FormControl(
          { value: this.coerceValue(f), disabled: !!f.disabled },
          this.getValidators(f)
        );
      }
    }
    this.form = new FormGroup(controls);
    this.wireValueChanges();
  }

  private syncFormWithFields() {
    if (!this.form) return;

    for (const f of this.fields) {
      const existing = this.form.get(f.name);

      if (f.type === 'repeater') {
        const rep = f as RepeaterFormField;
        if (!existing) {
          this.form.addControl(f.name, this.buildRepeaterControl(rep));
        } else if (existing instanceof FormArray) {
          this.syncRepeaterArray(existing, rep);
        } else {
          this.form.removeControl(f.name);
          this.form.addControl(f.name, this.buildRepeaterControl(rep));
        }
        continue;
      }

      const val = this.coerceValue(f);
      const validators = this.getValidators(f);

      if (!existing) {
        this.form.addControl(
          f.name,
          new FormControl({ value: val, disabled: !!f.disabled }, validators)
        );
      } else {
        const ctrl = existing as FormControl;
        ctrl.setValidators(validators);

        // tylko enable/disable
        const shouldBeDisabled = !!f.disabled;
        if (shouldBeDisabled && !ctrl.disabled)
          ctrl.disable({ emitEvent: false });
        else if (!shouldBeDisabled && ctrl.disabled)
          ctrl.enable({ emitEvent: false });

        ctrl.updateValueAndValidity({ emitEvent: false });

        const next = val;
        const same = JSON.stringify(ctrl.value) === JSON.stringify(next);
        const isEmpty =
          ctrl.value === '' ||
          ctrl.value === null ||
          (Array.isArray(ctrl.value) && ctrl.value.length === 0);

        if (!same || isEmpty) {
          ctrl.setValue(next, { emitEvent: false });
        }
      }
    }

    // usuń kontrolki których nie ma
    Object.keys(this.form.controls).forEach((name) => {
      if (!this.fields.some((f) => f.name === name)) {
        this.form.removeControl(name);
      }
    });
  }

  /** ================== REPEATER HELPERS ================== */

  private buildRepeaterControl(f: RepeaterFormField): FormArray {
    const arr = new FormArray<FormGroup>([]);
    const items = Array.isArray(f.value) ? f.value : [];
    for (const item of items) {
      arr.push(this.buildInnerGroup(f, item));
    }
    return arr;
  }

  private syncRepeaterArray(ctrl: FormArray, f: RepeaterFormField) {
    while (ctrl.length) ctrl.removeAt(0);
    const items = Array.isArray(f.value) ? f.value : [];
    for (const item of items) {
      ctrl.push(this.buildInnerGroup(f, item));
    }
  }

  private buildInnerGroup(
    rep: RepeaterFormField,
    values: Record<string, any>
  ): FormGroup {
    const inner: Record<string, FormControl> = {};
    for (const innerField of rep.fields) {
      if (innerField.type === 'repeater') {
        // (rzadkie) zagnieżdżony repeater – można dodać jeśli potrzebujesz
        throw new Error('Nested repeater is not supported in this component.');
      }
      const withValue = {
        ...innerField,
        value: values?.[innerField.name],
      } as FormField;
      inner[innerField.name] = new FormControl(
        { value: this.coerceValue(withValue), disabled: !!innerField.disabled },
        this.getValidators(innerField)
      );
    }
    return new FormGroup(inner);
  }

  addRepeaterItem(fieldName: string) {
    const f = this.fields.find((x) => x.name === fieldName) as
      | RepeaterFormField
      | undefined;
    if (!f) return;

    const fa = this.form.get(fieldName) as FormArray | null;
    if (!fa) return;

    if (typeof f.max === 'number' && fa.length >= f.max) return;

    // domyślne puste wartości wg definicji pól
    const blank: Record<string, any> = {};
    for (const inner of f.fields) {
      if (inner.type === 'checkbox') blank[inner.name] = false;
      else if (inner.type === 'number') blank[inner.name] = null;
      else if (inner.type === 'select' && (inner as SelectFormField).multiple)
        blank[inner.name] = [];
      else blank[inner.name] = '';
    }

    fa.push(this.buildInnerGroup(f, blank));
  }

  removeRepeaterItem(fieldName: string, index: number) {
    const fa = this.form.get(fieldName) as FormArray | null;
    if (!fa) return;
    if (index < 0 || index >= fa.length) return;

    const f = this.fields.find((x) => x.name === fieldName) as
      | RepeaterFormField
      | undefined;
    if (f && typeof f.min === 'number' && fa.length <= f.min) return;

    fa.removeAt(index);
  }

  /** ================== UTILS ================== */

  private getValidators(field: FormField) {
    const v = field.required ? [Validators.required] : [];
    if (field.type === 'email') {
      v.push(Validators.email);
    }
    if (field.type === 'number') {
      if (field.min != null) v.push(Validators.min(field.min));
      if (field.max != null) v.push(Validators.max(field.max));
    }
    // dla 'repeater' można dodać minLength/maxLength na poziomie FormArray – pominę dla prostoty
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
      if (field.value === '' || field.value == null) return null;
      const n = Number(field.value);
      return Number.isFinite(n) ? n : null;
    }
    if (field.type === 'select') {
      const mult = (field as SelectFormField).multiple;
      if (mult) {
        const v = field.value;
        if (Array.isArray(v)) return v;
        return v != null && v !== '' ? [v] : [];
      }
      return field.value ?? '';
    }
    if (field.type === 'checkbox') {
      return !!field.value;
    }
    if (field.type === 'repeater') {
      return Array.isArray(field.value) ? field.value : [];
    }
    // text/textarea/date/time/email/hidden
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
    } else {
      // zaznacz niepoprawne pola
      this.form.markAllAsTouched();
    }
  }

  onClose(): void {
    this.resetForm();
    this.closeForm();
  }

  private resetForm(): void {
    const resetValues: any = {};
    this.fields.forEach((field) => {
      if (field.type === 'checkbox') resetValues[field.name] = false;
      else if (field.type === 'number') resetValues[field.name] = null;
      else if (field.type === 'select' && (field as SelectFormField).multiple)
        resetValues[field.name] = [];
      else if (field.type === 'repeater') resetValues[field.name] = [];
      else resetValues[field.name] = '';
    });
    this.form.reset(resetValues);
    // wyczyść FormArray dla repeaterów
    for (const f of this.fields) {
      if (f.type === 'repeater') {
        const fa = this.form.get(f.name) as FormArray | null;
        if (fa) while (fa.length) fa.removeAt(0);
      }
    }
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
    let totalSpan = field.totalSpan ?? 12;
    if (totalSpan < 1 || totalSpan > 12) totalSpan = 12;
    return `col-${totalSpan}`;
  }

  calcActualSpan(field: FormField): string {
    const actualSpan = field.actualSpan ?? 12;
    if (actualSpan < 1 || actualSpan > 12) return 'col-12';
    return `col-${actualSpan}`;
  }

  // Shorthands do template
  asRepeater(f: FormField) {
    return f as RepeaterFormField;
  }
  isRepeater(f: FormField): f is RepeaterFormField {
    return f.type === 'repeater';
  }
  getFormArray(name: string) {
    return this.form.get(name) as FormArray;
  }

  trackField = (index: number, f: FormField) => f?.name ?? index;
}
