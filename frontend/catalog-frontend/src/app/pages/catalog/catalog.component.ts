import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CatalogService } from '../../services/catalog.service';
import { ProductoList, ImportResult } from '../../models/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  products: ProductoList[] = [];
  loading = false;
  importing = false;
  error = '';
  successMessage = '';
  importResult: ImportResult | null = null;
  userEmail = '';

  constructor(
    private catalog: CatalogService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userEmail = this.auth.getEmail() || '';
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.catalog.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos. Verifique que el backend esté activo.';
        this.loading = false;
      }
    });
  }

  importCatalog() {
    this.importing = true;
    this.importResult = null;
    this.error = '';
    this.successMessage = '';

    this.catalog.importCatalog().subscribe({
      next: (result) => {
        this.importing = false;
        this.importResult = result;
        if (!result.error) {
          this.successMessage = `✓ Importación completada: ${result.importados} importados, ${result.omitidos} omitidos.`;
          this.loadProducts();
        } else {
          this.error = result.error;
        }
      },
      error: (err) => {
        this.importing = false;
        this.error = err.error?.error || 'Error al importar el catálogo.';
      }
    });
  }

  editProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  logout() {
    this.auth.logout();
  }

  clearMessages() {
    this.successMessage = '';
    this.error = '';
    this.importResult = null;
  }
}
