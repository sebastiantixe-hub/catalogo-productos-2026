import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'catalog',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'product/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/product-edit/product-edit.component').then(m => m.ProductEditComponent)
  },
  { path: '**', redirectTo: '/catalog' }
];
