// Models for the application

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface ProductoList {
  id: number;
  externalId: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  categoriaId: number;
  imagenUrl: string;
}

export interface ProductoDetail {
  id: number;
  externalId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number;
  categoria: string;
  imagenUrl: string;
}

export interface ProductoUpdateRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number;
}

export interface ImportResult {
  importados: number;
  omitidos: number;
  error?: string;
}
