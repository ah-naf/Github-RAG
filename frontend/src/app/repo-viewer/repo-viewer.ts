import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TreeNode, MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Chip } from 'primeng/chip';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { Tree } from 'primeng/tree';
import { Toast } from 'primeng/toast';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';

import { FileContent, GitHubBranch, GitHubRepo, GitHubTreeItem } from '../type';
import { GithubService } from '../services/github-service';

interface TreeNodeData extends TreeNode {
  data?: {
    path: string;
    type: 'blob' | 'tree';
    sha: string;
  };
}

@Component({
  selector: 'app-repo-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // PrimeNG (v20, standalone components)
    Tree,
    Button,
    Card,
    Chip,
    Divider,
    ProgressSpinner,
    Tooltip,
    Badge,
    Avatar,
    Skeleton,
    Toast,
    Message,
    Select
  ],
  providers: [MessageService],
  templateUrl: './repo-viewer.html',
  styleUrl: './repo-viewer.css',
})
export class RepoViewer implements OnInit {
  repoData: GitHubRepo | null = null;
  branches: GitHubBranch[] = [];
  selectedBranch: string = '';
  fileTree: TreeNode[] = [];
  selectedFile: FileContent | null = null;
  fileContent: string = '';
  loading = {
    repo: true,
    branches: true,
    tree: true,
    file: false,
  };
  expandedNodes: Record<string, boolean> = {};
  breadcrumbs: string[] = [];
  error: string | null = null;

  constructor(
    public githubService: GithubService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRepository();
  }

  loadRepository(): void {
    const repoInfo = this.githubService.getRepoInfo();

    if (!repoInfo) {
      this.router.navigate(['/']);
      return;
    }

    this.loading.repo = true;
    this.githubService.getRepository(repoInfo.username, repoInfo.repoName).subscribe({
      next: (data) => {
        this.repoData = data ?? null;
        this.selectedBranch = data?.default_branch ?? '';
        this.loading.repo = false;
        this.loadBranches();
        this.loadFileTree();
      },
      error: (err) => {
        this.loading.repo = false;
        this.error = 'Failed to load repository.';
        this.toastError('Repository', 'Failed to load repository');
        console.error('Error fetching repository:', err);
      },
    });
  }

  loadBranches(): void {
    const repoInfo = this.githubService.getRepoInfo();
    if (!repoInfo) return;

    this.loading.branches = true;
    this.githubService.getBranches(repoInfo.username, repoInfo.repoName).subscribe({
      next: (data) => {
        this.branches = data ?? [];
        this.loading.branches = false;
      },
      error: (err) => {
        console.error('Error fetching branches:', err);
        this.loading.branches = false;
        this.toastError('Branches', 'Failed to load branches');
      },
    });
  }

  loadFileTree(): void {
    const repoInfo = this.githubService.getRepoInfo();
    if (!repoInfo) return;

    this.loading.tree = true;
    this.githubService
      .getRepoTree(repoInfo.username, repoInfo.repoName, this.selectedBranch)
      .subscribe({
        next: (items) => {
          this.fileTree = this.buildTreeNodes(items ?? []);
          this.loading.tree = false;
        },
        error: (err) => {
          console.error('Error fetching file tree:', err);
          this.loading.tree = false;
          this.toastError('File Tree', 'Failed to load file tree');
        },
      });
  }

  private buildTreeNodes(items: GitHubTreeItem[]): TreeNode[] {
    const tree: { [key: string]: TreeNode } = {};
    const rootNodes: TreeNode[] = [];

    (items ?? []).sort((a, b) => {
      if (a.type === 'tree' && b.type === 'blob') return -1;
      if (a.type === 'blob' && b.type === 'tree') return 1;
      return (a.path || '').localeCompare(b.path || '');
    });

    (items ?? []).forEach((item) => {
      const path = item?.path ?? '';
      const parts = path.split('/').filter(Boolean);
      const isFile = item?.type === 'blob';

      if (parts.length <= 1) {
        const node: TreeNodeData = {
          label: parts[0] ?? '',
          icon: isFile ? this.getFileIconClass(parts[0] ?? '') : 'pi pi-folder',
          data: {
            path: path,
            type: (item?.type as 'blob' | 'tree') ?? 'blob',
            sha: item?.sha ?? '',
          },
          children: isFile ? undefined : [],
          leaf: isFile,
          styleClass: isFile ? 'file-node' : 'folder-node',
        };
        tree[path] = node;
        rootNodes.push(node);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const label = parts[parts.length - 1] ?? '';

        const node: TreeNodeData = {
          label,
          icon: isFile ? this.getFileIconClass(label) : 'pi pi-folder',
          data: {
            path: path,
            type: (item?.type as 'blob' | 'tree') ?? 'blob',
            sha: item?.sha ?? '',
          },
          children: isFile ? undefined : [],
          leaf: isFile,
          styleClass: isFile ? 'file-node' : 'folder-node',
        };

        tree[path] = node;

        if (tree[parentPath]) {
          if (!tree[parentPath].children) {
            tree[parentPath].children = [];
          }
          tree[parentPath].children!.push(node);
        }
      }
    });

    return rootNodes;
  }

  getFileIconClass(filename: string): string {
    return this.githubService.getFileIcon(filename ?? '');
  }

  onNodeSelect(event: any): void {
    const node = (event?.node as TreeNodeData) ?? null;
    if (node?.data?.type === 'blob' && node?.data?.path) {
      this.loadFileContent(node.data.path);
      this.updateBreadcrumbs(node.data.path);
    }
  }

  loadFileContent(path: string): void {
    const repoInfo = this.githubService.getRepoInfo();
    if (!repoInfo) return;

    this.loading.file = true;
    this.githubService
      .getFileContent(repoInfo.username, repoInfo.repoName, path, this.selectedBranch)
      .subscribe({
        next: (file) => {
          this.selectedFile = file ?? null;
          const encoding = file?.encoding ?? '';
          const content = file?.content ?? '';
          if (encoding === 'base64') {
            this.fileContent = this.githubService.decodeBase64Content(content);
          } else {
            this.fileContent = content;
          }
          this.loading.file = false;
          this.toastInfo('File Loaded', this.selectedFile?.name ?? 'File');
        },
        error: (err) => {
          console.error('Error fetching file content:', err);
          this.loading.file = false;
          this.fileContent = 'Error loading file content';
          this.toastError('File', 'Failed to load file content');
        },
      });
  }

  updateBreadcrumbs(path: string): void {
    this.breadcrumbs = (path ?? '').split('/').filter(Boolean);
  }

  onBranchChange(): void {
    this.selectedFile = null;
    this.fileContent = '';
    this.breadcrumbs = [];
    this.loadFileTree();
    this.toastInfo('Branch Changed', this.selectedBranch || '—');
  }

  clearCredentials(): void {
    this.githubService.clearRepoInfo();
    this.toastInfo('Signed out', 'Credentials cleared');
    this.router.navigate(['/']);
  }

  getLanguageFromFile(filename: string): string {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      ts: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      tsx: 'typescript',
      html: 'xml',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
      sql: 'sql',
      sh: 'bash',
      bash: 'bash',
    };
    return langMap[ext || ''] || 'plaintext';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text ?? '')
      .then(() => {
        this.toastInfo('Copied', 'Content copied to clipboard');
      })
      .catch(() => {
        this.toastError('Clipboard', 'Failed to copy content');
      });
  }

  downloadFile(): void {
    if (this.selectedFile) {
      const blob = new Blob([this.fileContent ?? ''], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.selectedFile?.name ?? 'file.txt';
      a.click();
      window.URL.revokeObjectURL(url);
      this.toastInfo('Download', 'File downloaded');
    }
  }

  // Toast helpers
  private toastInfo(summary: string, detail: string): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 2000 });
  }
  private toastError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 3000 });
  }
}
