import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsFileUpload } from './misc/strings-file-upload';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  standalone: true,
})
export class FileUploadComponent {
  moduleStrings = stringsFileUpload;

  @Input() label = '';
  @Input() buttonText?: string;
  @Output() fileSelected = new EventEmitter<File>();

  previewUrl?: string;

  get textToDisplay(): string {
    return this.buttonText ?? this.moduleStrings.buttonText;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.fileSelected.emit(file);
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }
}
