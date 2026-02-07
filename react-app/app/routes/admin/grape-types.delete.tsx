import { Form, Link, redirect, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/grape-types.delete";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);
  const grapeType = await prisma.grapeType.findUnique({
    where: { Id: id },
    include: { _count: { select: { Products: true } } },
  });
  if (!grapeType) throw new Response("Tipo de uva no encontrado", { status: 404 });

  return { grapeType };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);

  // Set GrapeTypeId to null on associated products before deleting
  await prisma.product.updateMany({
    where: { GrapeTypeId: id },
    data: { GrapeTypeId: null },
  });
  await prisma.grapeType.delete({ where: { Id: id } });

  return redirect("/admin/grape-types");
}

export default function GrapeTypeDelete() {
  const { grapeType } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="mb-4">Eliminar Tipo de Uva</h1>

      <div className="alert alert-warning">
        <h5>¿Está seguro que desea eliminar este tipo de uva?</h5>
        <p><strong>{grapeType.Name}</strong></p>
        {grapeType._count.Products > 0 && (
          <p className="text-muted mb-0">
            {grapeType._count.Products} producto(s) asociado(s) perderán su tipo de uva.
          </p>
        )}
      </div>

      <Form method="post">
        <button type="submit" className="btn btn-danger me-2">Eliminar</button>
        <Link to="/admin/grape-types" className="btn btn-secondary">Cancelar</Link>
      </Form>
    </div>
  );
}
