import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-repo-viewer',
  imports: [],
  templateUrl: './repo-viewer.html',
  styleUrl: './repo-viewer.css',
})
export class RepoViewer implements OnInit {
  repoData: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log("Repo Viewer Loaded");
    const repoInfo = localStorage.getItem('repoInfo');
    if (repoInfo) {
      const { username, repoName, accessToken } = JSON.parse(repoInfo);

      const headers = new HttpHeaders({
        Authorization: `token ${accessToken}`,
      });

      this.http.get(`https://api.github.com/repos/${username}/${repoName}`, { headers }).subscribe({
        next: (data) => {
          this.repoData = data
          console.log('Repo data:', this.repoData);
        },
        error: (err) => console.error('Error fetching repo:', err),
      });
    }
  }
}
