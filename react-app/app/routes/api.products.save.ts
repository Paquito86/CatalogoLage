import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/api.products.save";

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const form = await request.formData();
  const id = Number(form.get("Id"));
  if (isNaN(id)) return new Response("Id inválido", { status: 400 });

  const p = await prisma.product.findUnique({ where: { Id: id } });
  if (!p) return new Response("Not found", { status: 404 });

  const priceStr = String(form.get("Price") || "");
  const alcStr = String(form.get("AlcoholPercent") || "");
  const grapeId = form.get("GrapeTypeId") ? Number(form.get("GrapeTypeId")) : null;

  // Parse price with comma/dot tolerance
  let price: number | null = null;
  if (priceStr) {
    const normalized = priceStr.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) price = parsed;
  }

  let alcoholPercent: number | null = null;
  if (alcStr) {
    const normalized = alcStr.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) alcoholPercent = parsed;
  }

  await prisma.product.update({
    where: { Id: id },
    data: {
      Name: String(form.get("Name") || ""),
      CategoryId: Number(form.get("CategoryId")) || p.CategoryId,
      Winery: String(form.get("Winery") || ""),
      Manufacturer: String(form.get("Manufacturer") || ""),
      GrapeTypeId: grapeId || null,
      Price: price,
      AlcoholPercent: alcoholPercent,
      Size: String(form.get("Size") || ""),
      Origin: String(form.get("Origin") || ""),
      ImageUrl: String(form.get("ImageUrl") || ""),
      Description: String(form.get("Description") || ""),
    },
  });

  return { success: true };
}
