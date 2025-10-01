import { Routes } from '@angular/router';
import { App } from './app';
import { RepoViewer } from './repo-viewer/repo-viewer';
import { Home } from './home/home';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'repo', component: RepoViewer}
];
