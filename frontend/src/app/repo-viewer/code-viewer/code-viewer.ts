import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';

import { FileContent } from '../../type';

@Component({
  selector: 'app-repo-viewer-code-viewer',
  standalone: true,
  imports: [CommonModule, Button, Message, ProgressSpinner],
  templateUrl: './code-viewer.html',
  styleUrl: './code-viewer.css',
})
export class RepoViewerCodeViewer {
  @Input() breadcrumbs: string[] = [];
  @Input() selectedFile: FileContent | null = null;
  @Input() fileContent = '';
  @Input() loadingFile = false;
  @Input() error: string | null = null;

  // passing functions to avoid re-implementing in child
  @Input() getFileIconClassFn!: (filename: string) => string;
  @Input() formatFileSizeFn!: (bytes: number) => string;

  @Output() copy = new EventEmitter<string>();
  @Output() download = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
}
