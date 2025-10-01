import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Chip } from 'primeng/chip';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';

import { GitHubBranch, GitHubRepo } from '../../type';
import { GithubService } from '../../services/github-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-repo-viewer-topbar',
  standalone: true,
  imports: [CommonModule, Chip, Button, Tooltip, Select, FormsModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class RepoViewerTopbar {
  @Input() repoData: GitHubRepo | null = null;

  @Input() branches: GitHubBranch[] = [];
  @Input() selectedBranch = '';
  @Input() loadingBranches = false;

  @Input() formatDateFn!: (d: string) => string;
  @Input() githubService!: GithubService;

  @Output() branchChange = new EventEmitter<string>();
  @Output() clearCredentials = new EventEmitter<void>();

  onBranchChange(value: string) {
    this.branchChange.emit(value);
  }
}
