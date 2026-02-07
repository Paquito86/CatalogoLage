import { Link, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/grape-types";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const grapeTypes = await prisma.grapeType.findMany({
    include: { _count: { select: { Products: true } } },
    orderBy: { Name: "asc" },
  });

  return { grapeTypes };
}

export default function AdminGrapeTypes() {
  const { grapeTypes } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="mb-4">Tipos de Uva</h1>

      <div className="mb-3">
        <Link to="/admin/grape-types/create" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Crear Tipo de Uva
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grapeTypes.map((gt: {
              Id: number;
              Name: string;
              Description: string | null;
              _count: { Products: number };
            }) => (
              <tr key={gt.Id}>
                <td>{gt.Name}</td>
                <td>{gt.Description || "—"}</td>
                <td>{gt._count.Products}</td>
                <td>
                  <Link
                    to={`/admin/grape-types/${gt.Id}/edit`}
                    className="btn btn-sm btn-outline-secondary me-1"
                  >
                    Editar
                  </Link>
                  <Link
                    to={`/admin/grape-types/${gt.Id}/delete`}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Eliminar
                  </Link>
                </td>
              </tr>
            ))}
            {grapeTypes.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No hay tipos de uva.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
