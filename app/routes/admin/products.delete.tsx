import { Form, Link, redirect, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/products.delete";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);
  const product = await prisma.product.findUnique({
    where: { Id: id },
    include: { Category: true },
  });
  if (!product) throw new Response("Producto no encontrado", { status: 404 });

  return { product };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);
  await prisma.product.delete({ where: { Id: id } });

  return redirect("/admin/products");
}

export default function ProductDelete() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="mb-4">Eliminar Producto</h1>

      <div className="alert alert-warning">
        <h5>¿Está seguro que desea eliminar este producto?</h5>
        <p className="mb-0">
          <strong>{product.Name}</strong> — {product.Category.Name}
        </p>
      </div>

      <Form method="post">
        <button type="submit" className="btn btn-danger me-2">Eliminar</button>
        <Link to="/admin/products" className="btn btn-secondary">Cancelar</Link>
      </Form>
    </div>
  );
}
