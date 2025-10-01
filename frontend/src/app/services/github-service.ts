import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileContent, GitHubBranch, GitHubRepo, GitHubTreeItem, RepoForm } from '../type';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private baseUrl = 'https://api.github.com';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const repoInfo = this.getRepoInfo();
    if (repoInfo?.accessToken) {
      return new HttpHeaders({
        'Authorization': `token ${repoInfo.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      });
    }
    return new HttpHeaders({
      'Accept': 'application/vnd.github.v3+json'
    });
  }

  getRepoInfo(): RepoForm | null {
    const info = localStorage.getItem('repoInfo');
    return info ? JSON.parse(info) : null;
  }

  clearRepoInfo(): void {
    localStorage.removeItem('repoInfo')
  }

  getRepository(username: string, repoName: string): Observable<GitHubRepo> {
    return this.http.get<GitHubRepo>(
      `${this.baseUrl}/repos/${username}/${repoName}`,
      { headers: this.getHeaders() }
    );
  }

  getBranches(username: string, repoName: string): Observable<GitHubBranch[]> {
    return this.http.get<GitHubBranch[]>(
      `${this.baseUrl}/repos/${username}/${repoName}/branches`,
      { headers: this.getHeaders() }
    );
  }

  getRepoTree(username: string, repoName: string, branch: string = 'main', recursive: boolean = true): Observable<GitHubTreeItem[]> {
    const url = `${this.baseUrl}/repos/${username}/${repoName}/git/trees/${branch}${recursive ? '?recursive=1' : ''}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(response => response.tree || []),
      catchError(() => of([]))
    );
  }

  getFileContent(username: string, repoName: string, path: string, branch: string = 'main'): Observable<FileContent> {
    return this.http.get<FileContent>(
      `${this.baseUrl}/repos/${username}/${repoName}/contents/${path}?ref=${branch}`,
      { headers: this.getHeaders() }
    );
  }

  decodeBase64Content(content: string): string {
    try {
      return atob(content.replace(/\n/g, ''));
    } catch (e) {
      console.error('Error decoding base64:', e);
      return '';
    }
  }

  getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'Python': '#3572A5',
      'Java': '#b07219',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'SCSS': '#c6538c',
      'Vue': '#41b883',
      'React': '#61dafb',
      'Angular': '#dd0031',
      'C++': '#f34b7d',
      'C#': '#178600',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Swift': '#FA7343',
      'Kotlin': '#A97BFF'
    };
    return colors[language] || '#8b949e';
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'ts': 'pi-code',
      'js': 'pi-code',
      'jsx': 'pi-code',
      'tsx': 'pi-code',
      'html': 'pi-code',
      'css': 'pi-code',
      'scss': 'pi-code',
      'sass': 'pi-code',
      'json': 'pi-code',
      'xml': 'pi-code',
      'py': 'pi-code',
      'java': 'pi-code',
      'c': 'pi-code',
      'cpp': 'pi-code',
      'cs': 'pi-code',
      'go': 'pi-code',
      'rs': 'pi-code',
      'php': 'pi-code',
      'rb': 'pi-code',
      'swift': 'pi-code',
      'kt': 'pi-code',
      'md': 'pi-file',
      'txt': 'pi-file',
      'pdf': 'pi-file-pdf',
      'doc': 'pi-file-word',
      'docx': 'pi-file-word',
      'xls': 'pi-file-excel',
      'xlsx': 'pi-file-excel',
      'png': 'pi-image',
      'jpg': 'pi-image',
      'jpeg': 'pi-image',
      'gif': 'pi-image',
      'svg': 'pi-image',
      'zip': 'pi-file-archive',
      'rar': 'pi-file-archive',
      '7z': 'pi-file-archive',
      'tar': 'pi-file-archive',
      'gz': 'pi-file-archive'
    };
    return `pi ${iconMap[ext || ''] || 'pi-file'}`;
  }
}
