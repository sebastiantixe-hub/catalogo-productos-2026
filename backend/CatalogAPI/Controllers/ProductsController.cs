using CatalogAPI.Data;
using CatalogAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogAPI.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/products - Listar todos
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var productos = await _db.Productos
            .Include(p => p.Categoria)
            .OrderBy(p => p.Nombre)
            .Select(p => new ProductoListDto(
                p.Id,
                p.ExternalId,
                p.Nombre,
                p.Precio,
                p.Stock,
                p.Categoria.Nombre,
                p.CategoriaId,
                p.ImagenUrl
            ))
            .ToListAsync();

        return Ok(productos);
    }

    // GET /api/products/{id} - Obtener uno por id local
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _db.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null)
            return NotFound(new { message = $"Producto con id {id} no encontrado." });

        return Ok(new ProductoDetailDto(
            p.Id,
            p.ExternalId,
            p.Nombre,
            p.Descripcion,
            p.Precio,
            p.Stock,
            p.CategoriaId,
            p.Categoria.Nombre,
            p.ImagenUrl
        ));
    }

    // PUT /api/products/{id} - Editar producto
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductoUpdateRequest request)
    {
        // Validaciones de backend
        var nombreLimpio = request.Nombre?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(nombreLimpio))
            return BadRequest(new { message = "El nombre es obligatorio." });

        if (request.Precio < 0)
            return BadRequest(new { message = "El precio debe ser mayor o igual a 0." });

        if (request.Stock < 0)
            return BadRequest(new { message = "El stock debe ser un entero mayor o igual a 0." });

        var categoriaExiste = await _db.Categorias.AnyAsync(c => c.Id == request.CategoriaId);
        if (!categoriaExiste)
            return BadRequest(new { message = "La categoría seleccionada no existe." });

        var producto = await _db.Productos.FindAsync(id);
        if (producto == null)
            return NotFound(new { message = $"Producto con id {id} no encontrado." });

        // Actualizar campos editables (ExternalId no se toca)
        producto.Nombre = nombreLimpio;
        producto.Descripcion = request.Descripcion ?? string.Empty;
        producto.Precio = request.Precio;
        producto.Stock = request.Stock;
        producto.CategoriaId = request.CategoriaId;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Producto actualizado exitosamente." });
    }
}
