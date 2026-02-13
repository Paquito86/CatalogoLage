import { prisma } from "~/lib/db.server";
import { requireAdminMutation } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.place-unassigned";

export async function action({ request, params }: Route.ActionArgs) {
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  await requireAdminMutation(request, form);
  const productId = Number(form.get("productId"));
  const x = Number(form.get("x"));
  const y = Number(form.get("y"));

  if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(x) || x < 0 || !Number.isInteger(y) || y < 0) {
    return new Response("Parámetros inválidos", { status: 400 });
  }

  if (catalogType === "wines") {
    const occupied = await prisma.product.findFirst({
      where: { MatrixX: x, MatrixY: y, Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } },
    });
    if (occupied) return new Response("La celda ya está ocupada", { status: 400 });
    await prisma.catalogEmptyCell.deleteMany({ where: { X: x, Y: y } });
    await prisma.product.update({ where: { Id: productId }, data: { MatrixX: x, MatrixY: y } });
  } else if (catalogType === "spirits") {
    const occupied = await prisma.product.findFirst({
      where: { MatrixXSpirits: x, MatrixYSpirits: y, Category: { SortOrder: 2 } },
    });
    if (occupied) return new Response("La celda ya está ocupada", { status: 400 });
    await prisma.catalogSpiritsEmptyCell.deleteMany({ where: { X: x, Y: y } });
    await prisma.product.update({ where: { Id: productId }, data: { MatrixXSpirits: x, MatrixYSpirits: y } });
  } else {
    const occupied = await prisma.product.findFirst({
      where: { MatrixXCafe: x, MatrixYCafe: y, Category: { SortOrder: 3 } },
    });
    if (occupied) return new Response("La celda ya está ocupada", { status: 400 });
    await prisma.catalogCafeEmptyCell.deleteMany({ where: { X: x, Y: y } });
    await prisma.product.update({ where: { Id: productId }, data: { MatrixXCafe: x, MatrixYCafe: y } });
  }

  return { success: true };
}
