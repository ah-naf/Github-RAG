import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TreeNode } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'app-repo-viewer-sidebar-files',
  standalone: true,
  imports: [CommonModule, ProgressSpinner, Tree],
  templateUrl: './sidebar-files.html',
  styleUrl: './sidebar-files.css',
})
export class RepoViewerSidebarFiles {
  @Input() fileTree: TreeNode[] = [];
  @Input() loadingTree = false;
  @Input() fileCount = 0;

  @Output() nodeSelect = new EventEmitter<string>(); // path

  onNodeSelect(event: any) {
    const path = event?.node?.data?.path;
    if (path) this.nodeSelect.emit(path);
  }
}
