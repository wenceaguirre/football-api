import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  // públicas
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./core/auth/register/register').then(m => m.Register) }, 

  // privadas
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'players', loadComponent: () => import('./features/players/player-list/player-list').then(m => m.PlayerList) },
      { path: 'players/new', loadComponent: () => import('./features/players/player-form/player-form').then(m => m.PlayerForm) },
      { path: 'players/:id', loadComponent: () => import('./features/players/player-form/player-form').then(m => m.PlayerForm) },
      { path: 'players/**', loadComponent: () => import('./notfound/not-found').then(m => m.NotFound) },
    ]
  },

  
  { path: '**', loadComponent: () => import('./notfound/not-found').then(m => m.NotFound) },
];
