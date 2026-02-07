import { redirect } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.delete-last-empty-rows";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  const count = Math.max(0, Number(form.get("count")) || 0);

  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";

  if (count <= 0) return redirect(`${catalogPath}?AdminMode=true`);

  if (catalogType === "wines") {
    let deleted = 0;
    const maxY = Math.max(
      (await prisma.product.aggregate({ where: { Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } }, _max: { MatrixY: true } }))._max.MatrixY ?? -1,
      (await prisma.catalogTitleRow.aggregate({ _max: { MatrixY: true } }))._max.MatrixY ?? -1,
      (await prisma.catalogEmptyCell.aggregate({ _max: { Y: true } }))._max.Y ?? -1,
    );
    let y = maxY;
    while (deleted < count && y >= 0) {
      const hasProduct = await prisma.product.findFirst({ where: { MatrixY: y, Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } } });
      const hasTitle = await prisma.catalogTitleRow.findFirst({ where: { MatrixY: y } });
      if (hasProduct || hasTitle) break;
      const empties = await prisma.catalogEmptyCell.findMany({ where: { Y: y } });
      if (empties.length === 0) { y--; continue; }
      await prisma.catalogEmptyCell.deleteMany({ where: { Y: y } });
      deleted++; y--;
    }
  } else if (catalogType === "spirits") {
    let deleted = 0;
    const maxY = Math.max(
      (await prisma.product.aggregate({ where: { Category: { SortOrder: 2 } }, _max: { MatrixYSpirits: true } }))._max.MatrixYSpirits ?? -1,
      (await prisma.catalogSpiritsTitleRow.aggregate({ _max: { MatrixY: true } }))._max.MatrixY ?? -1,
      (await prisma.catalogSpiritsEmptyCell.aggregate({ _max: { Y: true } }))._max.Y ?? -1,
    );
    let y = maxY;
    while (deleted < count && y >= 0) {
      const hasProduct = await prisma.product.findFirst({ where: { MatrixYSpirits: y, Category: { SortOrder: 2 } } });
      const hasTitle = await prisma.catalogSpiritsTitleRow.findFirst({ where: { MatrixY: y } });
      if (hasProduct || hasTitle) break;
      const empties = await prisma.catalogSpiritsEmptyCell.findMany({ where: { Y: y } });
      if (empties.length === 0) { y--; continue; }
      await prisma.catalogSpiritsEmptyCell.deleteMany({ where: { Y: y } });
      deleted++; y--;
    }
  } else {
    let deleted = 0;
    const maxY = Math.max(
      (await prisma.product.aggregate({ where: { Category: { SortOrder: 3 } }, _max: { MatrixYCafe: true } }))._max.MatrixYCafe ?? -1,
      (await prisma.catalogCafeTitleRow.aggregate({ _max: { MatrixY: true } }))._max.MatrixY ?? -1,
      (await prisma.catalogCafeEmptyCell.aggregate({ _max: { Y: true } }))._max.Y ?? -1,
    );
    let y = maxY;
    while (deleted < count && y >= 0) {
      const hasProduct = await prisma.product.findFirst({ where: { MatrixYCafe: y, Category: { SortOrder: 3 } } });
      const hasTitle = await prisma.catalogCafeTitleRow.findFirst({ where: { MatrixY: y } });
      if (hasProduct || hasTitle) break;
      const empties = await prisma.catalogCafeEmptyCell.findMany({ where: { Y: y } });
      if (empties.length === 0) { y--; continue; }
      await prisma.catalogCafeEmptyCell.deleteMany({ where: { Y: y } });
      deleted++; y--;
    }
  }

  return redirect(`${catalogPath}?AdminMode=true`);
}
