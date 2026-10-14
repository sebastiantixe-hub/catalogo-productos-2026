import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Categoria, ImportResult, ProductoDetail, ProductoList, ProductoUpdateRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly BASE = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<ProductoList[]>(`${this.BASE}/products`);
  }

  getProduct(id: number) {
    return this.http.get<ProductoDetail>(`${this.BASE}/products/${id}`);
  }

  updateProduct(id: number, data: ProductoUpdateRequest) {
    return this.http.put<{ message: string }>(`${this.BASE}/products/${id}`, data);
  }

  getCategories() {
    return this.http.get<Categoria[]>(`${this.BASE}/categories`);
  }

  importCatalog() {
    return this.http.post<ImportResult>(`${this.BASE}/catalog/import`, {});
  }
}
