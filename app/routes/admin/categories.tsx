import { Link, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/categories";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const categories = await prisma.category.findMany({
    include: { _count: { select: { Products: true } }, Catalog: true },
    orderBy: [{ Catalog: { Name: "asc" } }, { SortOrder: "asc" }, { Name: "asc" }],
  });

  return { categories };
}

export default function AdminCategories() {
  const { categories } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="mb-4">Categorías</h1>

      <div className="mb-3">
        <Link to="/admin/categories/create" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Crear Categoría
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Catálogo</th>
              <th>Orden</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: {
              Id: number;
              Name: string;
              SortOrder: number | null;
              Catalog: { Id: number; Name: string } | null;
              _count: { Products: number };
            }) => (
              <tr key={cat.Id}>
                <td>{cat.Name}</td>
                <td>{cat.Catalog?.Name ?? <span className="text-muted">Sin catálogo</span>}</td>
                <td>{cat.SortOrder ?? "—"}</td>
                <td>{cat._count.Products}</td>
                <td>
                  <Link
                    to={`/admin/categories/${cat.Id}/edit`}
                    className="btn btn-sm btn-outline-secondary me-1"
                  >
                    Editar
                  </Link>
                  <Link
                    to={`/admin/categories/${cat.Id}/delete`}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Eliminar
                  </Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No hay categorías.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
