namespace CatalogAPI.DTOs;

// Auth DTOs
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Email);

// Category DTOs
public record CategoriaDto(int Id, string Nombre);

// Product DTOs
public record ProductoListDto(
    int Id,
    int ExternalId,
    string Nombre,
    decimal Precio,
    int Stock,
    string Categoria,
    int CategoriaId,
    string ImagenUrl
);

public record ProductoDetailDto(
    int Id,
    int ExternalId,
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Stock,
    int CategoriaId,
    string Categoria,
    string ImagenUrl
);

public record ProductoUpdateRequest(
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Stock,
    int CategoriaId
);

// Catalog import DTO
public record ImportResultDto(int Importados, int Omitidos, string? Error = null);
