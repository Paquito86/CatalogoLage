import { redirect } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.create-title";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  const text = String(form.get("text") || "").trim();
  const y = Math.max(0, Number(form.get("y")) || 0);
  let level = Number(form.get("level")) || 2;
  if (level !== 1 && level !== 2) level = 2;

  if (!text) return new Response("El título es obligatorio", { status: 400 });

  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";

  if (catalogType === "wines") {
    const exists = await prisma.catalogTitleRow.findFirst({ where: { MatrixY: y } });
    if (exists) return new Response("Ya existe un título en esa fila", { status: 400 });
    await prisma.catalogTitleRow.create({ data: { Text: text, MatrixY: y, Level: level } });
  } else if (catalogType === "spirits") {
    const exists = await prisma.catalogSpiritsTitleRow.findFirst({ where: { MatrixY: y } });
    if (exists) return new Response("Ya existe un título en esa fila", { status: 400 });
    await prisma.catalogSpiritsTitleRow.create({ data: { Text: text, MatrixY: y, Level: level } });
  } else {
    const exists = await prisma.catalogCafeTitleRow.findFirst({ where: { MatrixY: y } });
    if (exists) return new Response("Ya existe un título en esa fila", { status: 400 });
    await prisma.catalogCafeTitleRow.create({ data: { Text: text, MatrixY: y, Level: level } });
  }

  return redirect(`${catalogPath}?AdminMode=true`);
}
