import { redirect } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdminMutation } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.insert-row";

const MATRIX_COLUMNS = 3;

export async function action({ request, params }: Route.ActionArgs) {
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  await requireAdminMutation(request, form);
  const y = Math.max(0, Number(form.get("y")) || 0);

  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";

  if (catalogType === "wines") {
    const newRowY = y + 1;
    // Shift products, titles, empty cells down
    const productsToShift = await prisma.product.findMany({
      where: { MatrixY: { gte: newRowY }, Category: { OR: [{ SortOrder: null }, { SortOrder: 1 }] } },
    });
    for (const p of productsToShift) {
      await prisma.product.update({ where: { Id: p.Id }, data: { MatrixY: (p.MatrixY ?? 0) + 1 } });
    }
    const titlesToShift = await prisma.catalogTitleRow.findMany({ where: { MatrixY: { gte: newRowY } } });
    for (const t of titlesToShift) {
      await prisma.catalogTitleRow.update({ where: { Id: t.Id }, data: { MatrixY: t.MatrixY + 1 } });
    }
    const emptiesToShift = await prisma.catalogEmptyCell.findMany({ where: { Y: { gte: newRowY } } });
    for (const e of emptiesToShift) {
      await prisma.catalogEmptyCell.update({ where: { Id: e.Id }, data: { Y: e.Y + 1 } });
    }
    // Create empty cells for new row
    for (let x = 0; x < MATRIX_COLUMNS; x++) {
      const exists = await prisma.catalogEmptyCell.findFirst({ where: { X: x, Y: newRowY } });
      if (!exists) await prisma.catalogEmptyCell.create({ data: { X: x, Y: newRowY } });
    }
  } else if (catalogType === "spirits") {
    const newRowY = y + 1;
    const productsToShift = await prisma.product.findMany({
      where: { MatrixYSpirits: { gte: newRowY }, Category: { SortOrder: 2 } },
    });
    for (const p of productsToShift) {
      await prisma.product.update({ where: { Id: p.Id }, data: { MatrixYSpirits: (p.MatrixYSpirits ?? 0) + 1 } });
    }
    const titlesToShift = await prisma.catalogSpiritsTitleRow.findMany({ where: { MatrixY: { gte: newRowY } } });
    for (const t of titlesToShift) {
      await prisma.catalogSpiritsTitleRow.update({ where: { Id: t.Id }, data: { MatrixY: t.MatrixY + 1 } });
    }
    const emptiesToShift = await prisma.catalogSpiritsEmptyCell.findMany({ where: { Y: { gte: newRowY } } });
    for (const e of emptiesToShift) {
      await prisma.catalogSpiritsEmptyCell.update({ where: { Id: e.Id }, data: { Y: e.Y + 1 } });
    }
    for (let x = 0; x < MATRIX_COLUMNS; x++) {
      const exists = await prisma.catalogSpiritsEmptyCell.findFirst({ where: { X: x, Y: newRowY } });
      if (!exists) await prisma.catalogSpiritsEmptyCell.create({ data: { X: x, Y: newRowY } });
    }
  } else {
    const newRowY = y + 1;
    const productsToShift = await prisma.product.findMany({
      where: { MatrixYCafe: { gte: newRowY }, Category: { SortOrder: 3 } },
    });
    for (const p of productsToShift) {
      await prisma.product.update({ where: { Id: p.Id }, data: { MatrixYCafe: (p.MatrixYCafe ?? 0) + 1 } });
    }
    const titlesToShift = await prisma.catalogCafeTitleRow.findMany({ where: { MatrixY: { gte: newRowY } } });
    for (const t of titlesToShift) {
      await prisma.catalogCafeTitleRow.update({ where: { Id: t.Id }, data: { MatrixY: t.MatrixY + 1 } });
    }
    const emptiesToShift = await prisma.catalogCafeEmptyCell.findMany({ where: { Y: { gte: newRowY } } });
    for (const e of emptiesToShift) {
      await prisma.catalogCafeEmptyCell.update({ where: { Id: e.Id }, data: { Y: e.Y + 1 } });
    }
    for (let x = 0; x < MATRIX_COLUMNS; x++) {
      const exists = await prisma.catalogCafeEmptyCell.findFirst({ where: { X: x, Y: newRowY } });
      if (!exists) await prisma.catalogCafeEmptyCell.create({ data: { X: x, Y: newRowY } });
    }
  }

  return redirect(`${catalogPath}?AdminMode=true`);
}
