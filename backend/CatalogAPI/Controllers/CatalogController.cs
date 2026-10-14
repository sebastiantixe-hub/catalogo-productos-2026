using CatalogAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CatalogAPI.Controllers;

[ApiController]
[Route("api/catalog")]
[Authorize]
public class CatalogController : ControllerBase
{
    private readonly CatalogImportService _importService;

    public CatalogController(CatalogImportService importService)
    {
        _importService = importService;
    }

    // POST /api/catalog/import - Importar catálogo desde FakeStore API
    [HttpPost("import")]
    public async Task<IActionResult> Import()
    {
        var result = await _importService.ImportarAsync();

        if (result.Error != null)
            return StatusCode(502, result);

        return Ok(result);
    }
}
