import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Users'
    },
    children: [
      {
        path: '',
        redirectTo: 'userlist',
        pathMatch: 'full'
      },
      {
        path: 'userlist',
        loadComponent: () => import('./userlist/userlist.component').then(m => m.UsersComponent),
        data: {
          title: 'User List'
        }
      }
    ]
  }
];
