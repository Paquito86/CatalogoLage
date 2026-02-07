import { redirect } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.update-position";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  const productId = Number(form.get("productId"));
  const x = Number(form.get("x"));
  const y = Number(form.get("y"));

  const product = await prisma.product.findUnique({ where: { Id: productId }, include: { Category: true } });
  if (!product) return new Response("Not found", { status: 404 });

  if (catalogType === "wines") {
    // Swap with existing product if any
    const existing = await prisma.product.findFirst({
      where: { MatrixX: x, MatrixY: y, Id: { not: productId }, Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } },
    });
    if (existing) {
      await prisma.product.update({ where: { Id: existing.Id }, data: { MatrixX: product.MatrixX, MatrixY: product.MatrixY } });
    }
    // Remove empty cell if exists
    await prisma.catalogEmptyCell.deleteMany({ where: { X: x, Y: y } });
    await prisma.product.update({ where: { Id: productId }, data: { MatrixX: x, MatrixY: y } });
  } else if (catalogType === "spirits") {
    const existing = await prisma.product.findFirst({
      where: { MatrixXSpirits: x, MatrixYSpirits: y, Id: { not: productId }, Category: { SortOrder: 2 } },
    });
    if (existing) {
      await prisma.product.update({ where: { Id: existing.Id }, data: { MatrixXSpirits: product.MatrixXSpirits, MatrixYSpirits: product.MatrixYSpirits } });
    }
    await prisma.catalogSpiritsEmptyCell.deleteMany({ where: { X: x, Y: y } });
    await prisma.product.update({ where: { Id: productId }, data: { MatrixXSpirits: x, MatrixYSpirits: y } });
  } else {
    const existing = await prisma.product.findFirst({
      where: { MatrixXCafe: x, MatrixYCafe: y, Id: { not: productId }, Category: { SortOrder: 3 } },
    });
    if (existing) {
      await prisma.product.update({ where: { Id: existing.Id }, data: { MatrixXCafe: product.MatrixXCafe, MatrixYCafe: product.MatrixYCafe } });
    }
    await prisma.catalogCafeEmptyCell.deleteMany({ where: { X: x, Y: y } });
    await prisma.product.update({ where: { Id: productId }, data: { MatrixXCafe: x, MatrixYCafe: y } });
  }

  return { success: true };
}
