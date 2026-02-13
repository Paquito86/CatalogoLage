import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/api.lookups.grapes";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const grapes = await prisma.grapeType.findMany({
    orderBy: { Name: "asc" },
    select: { Id: true, Name: true },
  });
  return grapes.map((g) => ({ id: g.Id, name: g.Name }));
}
