import { redirect } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdminMutation } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.delete-row";

export async function action({ request, params }: Route.ActionArgs) {
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  await requireAdminMutation(request, form);
  const y = Math.max(0, Number(form.get("y")) || 0);

  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";

  if (catalogType === "wines") {
    // Unassign products in this row
    await prisma.product.updateMany({
      where: { MatrixY: y, Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } },
      data: { MatrixX: null, MatrixY: null },
    });
    await prisma.catalogTitleRow.deleteMany({ where: { MatrixY: y } });
    await prisma.catalogEmptyCell.deleteMany({ where: { Y: y } });
    // Shift everything below up
    const productsBelow = await prisma.product.findMany({
      where: { MatrixY: { gt: y }, Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } },
    });
    for (const p of productsBelow) {
      await prisma.product.update({ where: { Id: p.Id }, data: { MatrixY: (p.MatrixY ?? 0) - 1 } });
    }
    const titlesBelow = await prisma.catalogTitleRow.findMany({ where: { MatrixY: { gt: y } } });
    for (const t of titlesBelow) {
      await prisma.catalogTitleRow.update({ where: { Id: t.Id }, data: { MatrixY: t.MatrixY - 1 } });
    }
    const emptiesBelow = await prisma.catalogEmptyCell.findMany({ where: { Y: { gt: y } } });
    for (const e of emptiesBelow) {
      await prisma.catalogEmptyCell.update({ where: { Id: e.Id }, data: { Y: e.Y - 1 } });
    }
  } else if (catalogType === "spirits") {
    await prisma.product.updateMany({
      where: { MatrixYSpirits: y, Category: { SortOrder: 2 } },
      data: { MatrixXSpirits: null, MatrixYSpirits: null },
    });
    await prisma.catalogSpiritsTitleRow.deleteMany({ where: { MatrixY: y } });
    await prisma.catalogSpiritsEmptyCell.deleteMany({ where: { Y: y } });
    const productsBelow = await prisma.product.findMany({
      where: { MatrixYSpirits: { gt: y }, Category: { SortOrder: 2 } },
    });
    for (const p of productsBelow) {
      await prisma.product.update({ where: { Id: p.Id }, data: { MatrixYSpirits: (p.MatrixYSpirits ?? 0) - 1 } });
    }
    const titlesBelow = await prisma.catalogSpiritsTitleRow.findMany({ where: { MatrixY: { gt: y } } });
    for (const t of titlesBelow) {
      await prisma.catalogSpiritsTitleRow.update({ where: { Id: t.Id }, data: { MatrixY: t.MatrixY - 1 } });
    }
    const emptiesBelow = await prisma.catalogSpiritsEmptyCell.findMany({ where: { Y: { gt: y } } });
    for (const e of emptiesBelow) {
      await prisma.catalogSpiritsEmptyCell.update({ where: { Id: e.Id }, data: { Y: e.Y - 1 } });
    }
  } else {
    await prisma.product.updateMany({
      where: { MatrixYCafe: y, Category: { SortOrder: 3 } },
      data: { MatrixXCafe: null, MatrixYCafe: null },
    });
    await prisma.catalogCafeTitleRow.deleteMany({ where: { MatrixY: y } });
    await prisma.catalogCafeEmptyCell.deleteMany({ where: { Y: y } });
    const productsBelow = await prisma.product.findMany({
      where: { MatrixYCafe: { gt: y }, Category: { SortOrder: 3 } },
    });
    for (const p of productsBelow) {
      await prisma.product.update({ where: { Id: p.Id }, data: { MatrixYCafe: (p.MatrixYCafe ?? 0) - 1 } });
    }
    const titlesBelow = await prisma.catalogCafeTitleRow.findMany({ where: { MatrixY: { gt: y } } });
    for (const t of titlesBelow) {
      await prisma.catalogCafeTitleRow.update({ where: { Id: t.Id }, data: { MatrixY: t.MatrixY - 1 } });
    }
    const emptiesBelow = await prisma.catalogCafeEmptyCell.findMany({ where: { Y: { gt: y } } });
    for (const e of emptiesBelow) {
      await prisma.catalogCafeEmptyCell.update({ where: { Id: e.Id }, data: { Y: e.Y - 1 } });
    }
  }

  return redirect(`${catalogPath}?AdminMode=true`);
}
