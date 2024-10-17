import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dropboxlist.component').then(m => m.DropboxComponent),
    data: {
      title: $localize`Dropbox`
    }
  }
];

