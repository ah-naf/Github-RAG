import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';

import { FileContent } from '../../type';
import { getLanguageFromFile } from '../../utils';

import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

// Common languages
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markup';   
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-docker';   
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-repo-viewer-code-viewer',
  standalone: true,
  imports: [CommonModule, Button, Message, ProgressSpinner, Tooltip],
  templateUrl: './code-viewer.html',
  styleUrl: './code-viewer.css',
})
export class RepoViewerCodeViewer implements AfterViewInit, OnChanges {
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

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    Prism.highlightAllUnder(this.el.nativeElement);
  }

  ngOnChanges() {
    Prism.highlightAllUnder(this.el.nativeElement);
  }

  getFileLanguage(filename: string | null | undefined): string {
    if (!filename) return 'plaintext';
    return getLanguageFromFile(filename);
  }
}
