import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { AuthService } from '../../services/auth.service';
import { Categoria, ProductoDetail, ProductoUpdateRequest } from '../../models/models';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.css'
})
export class ProductEditComponent implements OnInit {
  product: ProductoDetail | null = null;
  categories: Categoria[] = [];
  loading = true;
  saving = false;
  error = '';
  success = '';

  // Form fields
  nombre = '';
  descripcion = '';
  precio = 0;
  stock = 0;
  categoriaId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalog: CatalogService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  loadData(id: number) {
    this.loading = true;
    // Load product and categories in parallel
    this.catalog.getProduct(id).subscribe({
      next: (p) => {
        this.product = p;
        this.nombre = p.nombre;
        this.descripcion = p.descripcion;
        this.precio = p.precio;
        this.stock = p.stock;
        this.categoriaId = p.categoriaId;

        this.catalog.getCategories().subscribe({
          next: (cats) => {
            this.categories = cats;
            this.loading = false;
          },
          error: () => {
            this.error = 'Error al cargar las categorías.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Producto no encontrado.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.error = '';
    this.success = '';

    // Frontend validation (backend also validates)
    if (!this.nombre?.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }
    if (this.precio < 0) {
      this.error = 'El precio debe ser mayor o igual a 0.';
      return;
    }
    if (!Number.isInteger(this.stock) || this.stock < 0) {
      this.error = 'El stock debe ser un número entero mayor o igual a 0.';
      return;
    }
    if (!this.categoriaId) {
      this.error = 'Seleccione una categoría.';
      return;
    }

    if (!this.product) return;

    this.saving = true;
    const request: ProductoUpdateRequest = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      categoriaId: this.categoriaId
    };

    this.catalog.updateProduct(this.product.id, request).subscribe({
      next: (res) => {
        this.saving = false;
        this.success = res.message || 'Producto actualizado correctamente.';
        // Update local product state
        if (this.product) {
          this.product.nombre = this.nombre.trim();
          this.product.descripcion = this.descripcion;
          this.product.precio = this.precio;
          this.product.stock = this.stock;
          this.product.categoriaId = this.categoriaId;
          const cat = this.categories.find(c => c.id === this.categoriaId);
          if (cat) this.product.categoria = cat.nombre;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Error al guardar el producto.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/catalog']);
  }

  logout() {
    this.auth.logout();
  }
}
