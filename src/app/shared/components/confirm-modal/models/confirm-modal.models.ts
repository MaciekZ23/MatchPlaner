import { ConfirmModalSize, ConfirmVariant } from '../types';

export interface ConfirmModalLabels {
  confirm?: string;
  cancel?: string;
  closeAria?: string;
}

export interface ConfirmModalOptions {
  title?: string;
  message?: string;
  labels?: ConfirmModalLabels;
  size?: ConfirmModalSize;
  confirmVariant?: ConfirmVariant;
}
