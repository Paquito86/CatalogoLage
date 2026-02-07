import { redirect } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { CatalogType } from "~/lib/catalog.server";
import type { Route } from "./+types/api.catalog.delete-title";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  const catalogType = params.catalogType as CatalogType;
  const form = await request.formData();
  const id = Number(form.get("id"));

  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";

  if (catalogType === "wines") {
    await prisma.catalogTitleRow.delete({ where: { Id: id } }).catch(() => {});
  } else if (catalogType === "spirits") {
    await prisma.catalogSpiritsTitleRow.delete({ where: { Id: id } }).catch(() => {});
  } else {
    await prisma.catalogCafeTitleRow.delete({ where: { Id: id } }).catch(() => {});
  }

  return redirect(`${catalogPath}?AdminMode=true`);
}
