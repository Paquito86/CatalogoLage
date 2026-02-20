import { prisma } from "~/lib/db.server";
import { requireAdminMutation } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.delete-title";

export async function action({ request, params }: Route.ActionArgs) {
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  await requireAdminMutation(request, form);
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id <= 0) return new Response("Id inválido", { status: 400 });

  if (catalogType === "wines") {
    await prisma.catalogTitleRow.delete({ where: { Id: id } }).catch(() => {});
  } else if (catalogType === "spirits") {
    await prisma.catalogSpiritsTitleRow.delete({ where: { Id: id } }).catch(() => {});
  } else if (catalogType === "cafe") {
    await prisma.catalogCafeTitleRow.delete({ where: { Id: id } }).catch(() => {});
  } else {
    await prisma.catalogAguaCervezaTitleRow.delete({ where: { Id: id } }).catch(() => {});
  }

  return { success: true };
}
