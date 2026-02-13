import { Form, Link, redirect, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/categories.delete";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);
  const category = await prisma.category.findUnique({
    where: { Id: id },
    include: { _count: { select: { Products: true } } },
  });
  if (!category) throw new Response("Categoría no encontrada", { status: 404 });

  return { category };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);

  // Cascade: delete products in this category first
  await prisma.product.deleteMany({ where: { CategoryId: id } });
  await prisma.category.delete({ where: { Id: id } });

  return redirect("/admin/categories");
}

export default function CategoryDelete() {
  const { category } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="mb-4">Eliminar Categoría</h1>

      <div className="alert alert-warning">
        <h5>¿Está seguro que desea eliminar esta categoría?</h5>
        <p><strong>{category.Name}</strong></p>
        {category._count.Products > 0 && (
          <p className="text-danger mb-0">
            <strong>Advertencia:</strong> Se eliminarán también {category._count.Products} producto(s) asociado(s).
          </p>
        )}
      </div>

      <Form method="post">
        <button type="submit" className="btn btn-danger me-2">Eliminar</button>
        <Link to="/admin/categories" className="btn btn-secondary">Cancelar</Link>
      </Form>
    </div>
  );
}
