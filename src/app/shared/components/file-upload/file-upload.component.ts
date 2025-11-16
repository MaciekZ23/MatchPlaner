import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsFileUpload } from './misc/strings-file-upload';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  standalone: true,
})
export class FileUploadComponent implements OnChanges {
  moduleStrings = stringsFileUpload;

  @Input() label = '';
  @Input() buttonText?: string;
  @Output() fileSelected = new EventEmitter<File>();
  @Input() resetTrigger: any;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  previewUrl?: string;

  get textToDisplay(): string {
    return this.buttonText ?? this.moduleStrings.buttonText;
  }

  /** Reaguje na każdą zmianę wartości resetTrigger */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger']) {
      this.clear();
    }
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

  clear() {
    this.previewUrl = undefined;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
