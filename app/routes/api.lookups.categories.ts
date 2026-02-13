import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/api.lookups.categories";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const categories = await prisma.category.findMany({
    orderBy: { Name: "asc" },
    select: { Id: true, Name: true },
  });
  return categories.map((c) => ({ id: c.Id, name: c.Name }));
}
