using CatalogAPI.Data;
using CatalogAPI.DTOs;
using CatalogAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogAPI.Services;

public class CatalogImportService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _http;
    private readonly ILogger<CatalogImportService> _logger;
    private const string FakeStoreBaseUrl = "https://fakestoreapi.com";

    public CatalogImportService(AppDbContext db, IHttpClientFactory httpClientFactory, ILogger<CatalogImportService> logger)
    {
        _db = db;
        _http = httpClientFactory.CreateClient("FakeStore");
        _logger = logger;
    }

    public async Task<ImportResultDto> ImportarAsync()
    {
        try
        {
            // 1. Obtener categorías de la API externa
            var categoriasApi = await _http.GetFromJsonAsync<List<string>>($"{FakeStoreBaseUrl}/products/categories");
            if (categoriasApi == null || categoriasApi.Count == 0)
                return new ImportResultDto(0, 0, "La API externa no devolvió categorías.");

            // 2. Guardar categorías nuevas (reutilizar existentes)
            var categoriasMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var nombre in categoriasApi)
            {
                var existing = await _db.Categorias.FirstOrDefaultAsync(c => c.Nombre == nombre);
                if (existing == null)
                {
                    var nueva = new Categoria { Nombre = nombre };
                    _db.Categorias.Add(nueva);
                    await _db.SaveChangesAsync();
                    categoriasMap[nombre] = nueva.Id;
                }
                else
                {
                    categoriasMap[nombre] = existing.Id;
                }
            }

            // 3. Obtener productos de la API externa
            var productosApi = await _http.GetFromJsonAsync<List<FakeStoreProduct>>($"{FakeStoreBaseUrl}/products");
            if (productosApi == null || productosApi.Count == 0)
                return new ImportResultDto(0, 0, "La API externa no devolvió productos.");

            int importados = 0;
            int omitidos = 0;

            // 4. Insertar productos nuevos (omitir si ya existe ExternalId)
            foreach (var p in productosApi)
            {
                bool existe = await _db.Productos.AnyAsync(x => x.ExternalId == p.Id);
                if (existe)
                {
                    omitidos++;
                    continue;
                }

                if (!categoriasMap.TryGetValue(p.Category, out int catId))
                {
                    _logger.LogWarning("Categoría '{Cat}' del producto {Id} no encontrada localmente. Omitiendo.", p.Category, p.Id);
                    omitidos++;
                    continue;
                }

                var producto = new Producto
                {
                    ExternalId = p.Id,
                    Nombre = p.Title,
                    Descripcion = p.Description,
                    Precio = p.Price,
                    Stock = 0,
                    CategoriaId = catId,
                    ImagenUrl = p.Image
                };

                _db.Productos.Add(producto);
                importados++;
            }

            await _db.SaveChangesAsync();
            return new ImportResultDto(importados, omitidos);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error al comunicarse con FakeStore API");
            return new ImportResultDto(0, 0, $"Error de conexión con la API externa: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado durante la importación");
            return new ImportResultDto(0, 0, $"Error inesperado: {ex.Message}");
        }
    }
}
