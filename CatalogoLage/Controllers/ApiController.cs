using CatalogoLage.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace CatalogoLage.Controllers;

[ApiController]
[Route("api")]
public class ApiController : ControllerBase
{
 private readonly ApplicationDbContext _ctx;
 public ApiController(ApplicationDbContext ctx) { _ctx = ctx; }

 [HttpGet("lookups/categories")]
 public async Task<IActionResult> GetCategories()
 {
 var list = await _ctx.Categories.OrderBy(c=>c.Name).Select(c=> new { id=c.Id, name=c.Name }).ToListAsync();
 return Ok(list);
 }

 [HttpGet("lookups/grapes")]
 public async Task<IActionResult> GetGrapes()
 {
 var list = await _ctx.GrapeTypes.OrderBy(g=>g.Name).Select(g=> new { id=g.Id, name=g.Name }).ToListAsync();
 return Ok(list);
 }

 [HttpGet("products/{id:int}")]
 public async Task<IActionResult> GetProduct(int id)
 {
 var p = await _ctx.Products.FirstOrDefaultAsync(x=>x.Id==id);
 if(p==null) return NotFound();
 return Ok(new {
 id = p.Id,
 name = p.Name,
 categoryId = p.CategoryId,
 winery = p.Winery,
 manufacturer = p.Manufacturer,
 grapeTypeId = p.GrapeTypeId,
 price = p.Price,
 alcoholPercent = p.AlcoholPercent,
 size = p.Size,
 origin = p.Origin,
 imageUrl = p.ImageUrl,
 description = p.Description
 });
 }

 [Authorize(Roles="Admin")]
 [ValidateAntiForgeryToken]
 [HttpPost("products/save")]
 public async Task<IActionResult> SaveProduct()
 {
 var form = HttpContext.Request.Form;
 if(!int.TryParse(form["Id"], out var id)) return BadRequest("Id inválido");
 var p = await _ctx.Products.FirstOrDefaultAsync(x=>x.Id==id);
 if(p==null) return NotFound();

 p.Name = form["Name"].ToString();
 if(int.TryParse(form["CategoryId"], out var cid)) p.CategoryId = cid; // CategoryId es no-nullable
 p.Winery = form["Winery"].ToString();
 p.Manufacturer = form["Manufacturer"].ToString();
 if(int.TryParse(form["GrapeTypeId"], out var gid)) p.GrapeTypeId = gid; else p.GrapeTypeId=null;

 // Helpers de parseo tolerante a , y .
 static bool TryParseDecimal(string s, out decimal value)
 {
 return decimal.TryParse(s, NumberStyles.Any, CultureInfo.CurrentCulture, out value) ||
 decimal.TryParse(s, NumberStyles.Any, CultureInfo.GetCultureInfo("es-ES"), out value) ||
 decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out value);
 }
 static bool TryParseDouble(string s, out double value)
 {
 return double.TryParse(s, NumberStyles.Any, CultureInfo.CurrentCulture, out value) ||
 double.TryParse(s, NumberStyles.Any, CultureInfo.GetCultureInfo("es-ES"), out value) ||
 double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out value);
 }

 if(TryParseDecimal(form["Price"], out var price)) p.Price = price; else p.Price=null;
 if(TryParseDouble(form["AlcoholPercent"], out var alc)) p.AlcoholPercent = alc; else p.AlcoholPercent=null;

 p.Size = form["Size"].ToString();
 p.Origin = form["Origin"].ToString();
 p.ImageUrl = form["ImageUrl"].ToString();
 p.Description = form["Description"].ToString();

 await _ctx.SaveChangesAsync();
 return Ok(new { success=true });
 }
}
