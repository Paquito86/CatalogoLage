import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.vaciar-celda";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  const productId = Number(form.get("productId"));
  const x = Number(form.get("x"));
  const y = Number(form.get("y"));

  if (catalogType === "wines") {
    await prisma.product.update({ where: { Id: productId }, data: { MatrixX: null, MatrixY: null } });
    const exists = await prisma.catalogEmptyCell.findFirst({ where: { X: x, Y: y } });
    if (!exists) await prisma.catalogEmptyCell.create({ data: { X: x, Y: y } });
  } else if (catalogType === "spirits") {
    await prisma.product.update({ where: { Id: productId }, data: { MatrixXSpirits: null, MatrixYSpirits: null } });
    const exists = await prisma.catalogSpiritsEmptyCell.findFirst({ where: { X: x, Y: y } });
    if (!exists) await prisma.catalogSpiritsEmptyCell.create({ data: { X: x, Y: y } });
  } else {
    await prisma.product.update({ where: { Id: productId }, data: { MatrixXCafe: null, MatrixYCafe: null } });
    const exists = await prisma.catalogCafeEmptyCell.findFirst({ where: { X: x, Y: y } });
    if (!exists) await prisma.catalogCafeEmptyCell.create({ data: { X: x, Y: y } });
  }

  return { success: true };
}
