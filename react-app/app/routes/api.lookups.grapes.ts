import { prisma } from "~/lib/db.server";

export async function loader() {
  const grapes = await prisma.grapeType.findMany({
    orderBy: { Name: "asc" },
    select: { Id: true, Name: true },
  });
  return grapes.map((g) => ({ id: g.Id, name: g.Name }));
}
