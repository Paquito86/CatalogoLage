import { prisma } from "~/lib/db.server";
import { requireAdminMutation } from "~/lib/auth.server";
import type { Route } from "./+types/api.products.save";

function sanitizeText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseOptionalDecimal(value: FormDataEntryValue | null, min: number, max: number) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const normalized = raw.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Response("Valor numérico inválido", { status: 400 });
  }
  return parsed;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  await requireAdminMutation(request, form);
  const id = Number(form.get("Id"));
  if (isNaN(id)) return new Response("Id inválido", { status: 400 });

  const p = await prisma.product.findUnique({ where: { Id: id } });
  if (!p) return new Response("Not found", { status: 404 });

  const name = sanitizeText(form.get("Name"), 250);
  if (!name) return new Response("Nombre inválido", { status: 400 });

  const categoryIdRaw = Number(form.get("CategoryId"));
  const categoryId = Number.isInteger(categoryIdRaw) && categoryIdRaw > 0 ? categoryIdRaw : p.CategoryId;

  const grapeIdRaw = Number(form.get("GrapeTypeId"));
  const grapeId = Number.isInteger(grapeIdRaw) && grapeIdRaw > 0 ? grapeIdRaw : null;

  const price = parseOptionalDecimal(form.get("Price"), 0, 1000000);
  const alcoholPercent = parseOptionalDecimal(form.get("AlcoholPercent"), 0, 100);

  await prisma.product.update({
    where: { Id: id },
    data: {
      Name: name,
      CategoryId: categoryId,
      Winery: sanitizeText(form.get("Winery"), 200),
      Manufacturer: sanitizeText(form.get("Manufacturer"), 200),
      GrapeTypeId: grapeId || null,
      Price: price,
      AlcoholPercent: alcoholPercent,
      Size: sanitizeText(form.get("Size"), 120),
      Origin: sanitizeText(form.get("Origin"), 200),
      ImageUrl: sanitizeText(form.get("ImageUrl"), 1024),
      Description: sanitizeText(form.get("Description"), 2000),
    },
  });

  return { success: true };
}
