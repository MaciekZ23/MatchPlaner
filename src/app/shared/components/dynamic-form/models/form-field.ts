export interface BaseFormField {
  name: string;
  label: string;
  type: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  displayLabel?: boolean;
  totalSpan?: number;
  actualSpan?: number;
}

export interface TextFormField extends BaseFormField {
  type: 'text';
}

export interface EmailFormField extends BaseFormField {
  type: 'email';
}

export interface NumberFormField extends BaseFormField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface DateFormField extends BaseFormField {
  type: 'date';
  min?: string; // Format YYYY-MM-DD
  max?: string;
}

export interface CheckboxFormField extends BaseFormField {
  type: 'checkbox';
  checked?: boolean;
}

export interface TextareaFormField extends BaseFormField {
  type: 'textarea';
  rows?: number;
}

export interface SelectFormField extends BaseFormField {
  type: 'select';
  multiple?: boolean;
  options: { value: any; label: string }[];
}

export interface TimeFormField extends BaseFormField {
  type: 'time';
  min?: string; // Format HH:mm
  max?: string;
}

export interface DateTimeFormField extends BaseFormField {
  type: 'datetime';
  min?: string; // Format YYYY-MM-DDTHH:mm:ss.sssZ
  max?: string;
}

export type SelectOption = { label: string; value: string };

export interface RepeaterFormField extends BaseFormField {
  type: 'repeater';
  itemLabel?: string;
  min?: number;
  max?: number;
  addLabel?: string;
  removeLabel?: string;
  fields: FormField[];
  value?: Record<string, any>[];
  optionsByIndex?: Record<number, Record<string, SelectOption[]>>;
}

export interface HiddenFormField extends BaseFormField {
  type: 'hidden';
}

export interface FileFormField extends BaseFormField {
  type: 'file';
  buttonText?: string;
}

export type FormField =
  | TextFormField
  | EmailFormField
  | NumberFormField
  | DateFormField
  | CheckboxFormField
  | TextareaFormField
  | SelectFormField
  | TimeFormField
  | DateTimeFormField
  | RepeaterFormField
  | HiddenFormField
  | FileFormField;
