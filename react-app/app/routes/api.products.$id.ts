import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/api.products.$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const id = Number(params.id);
  if (isNaN(id)) return new Response("Id inválido", { status: 400 });

  const p = await prisma.product.findUnique({ where: { Id: id } });
  if (!p) return new Response("Not found", { status: 404 });

  return {
    id: p.Id,
    name: p.Name,
    categoryId: p.CategoryId,
    winery: p.Winery,
    manufacturer: p.Manufacturer,
    grapeTypeId: p.GrapeTypeId,
    price: p.Price ? Number(p.Price) : null,
    alcoholPercent: p.AlcoholPercent,
    size: p.Size,
    origin: p.Origin,
    imageUrl: p.ImageUrl,
    description: p.Description,
  };
}
