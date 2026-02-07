import { prisma } from "~/lib/db.server";

export async function loader() {
  const categories = await prisma.category.findMany({
    orderBy: { Name: "asc" },
    select: { Id: true, Name: true },
  });
  return categories.map((c) => ({ id: c.Id, name: c.Name }));
}
