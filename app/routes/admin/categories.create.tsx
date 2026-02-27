import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/categories.create";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const catalogs = await prisma.catalog.findMany({ orderBy: { Name: "asc" } });
  return { catalogs };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const catalogIdStr = String(formData.get("CatalogId") || "");
  if (!catalogIdStr) {
    return { error: "Debes seleccionar un catálogo." };
  }
  const sortOrderStr = String(formData.get("SortOrder") || "");

  await prisma.category.create({
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null,
      CatalogId: parseInt(catalogIdStr, 10),
      SortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : null,
    },
  });

  return redirect("/admin/categories");
}

export default function CategoryCreate() {
  const { catalogs } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1 className="mb-4">Crear Categoría</h1>

      {actionData?.error && (
        <div className="alert alert-danger">{actionData.error}</div>
      )}

      <Form method="post">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="Name" className="form-label">Nombre *</label>
              <input type="text" id="Name" name="Name" className="form-control" required />
            </div>

            <div className="mb-3">
              <label htmlFor="Description" className="form-label">Descripción</label>
              <textarea id="Description" name="Description" className="form-control" rows={3}></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="CatalogId" className="form-label">Catálogo *</label>
              <select id="CatalogId" name="CatalogId" className="form-select" required>
                <option value="">-- Selecciona un catálogo --</option>
                {catalogs.map((c) => (
                  <option key={c.Id} value={c.Id}>{c.Name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="SortOrder" className="form-label">Orden de visualización</label>
              <input type="number" id="SortOrder" name="SortOrder" className="form-control" placeholder="(opcional)" />
              <div className="form-text">Número para ordenar la categoría dentro de su catálogo.</div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-primary me-2">Crear</button>
          <Link to="/admin/categories" className="btn btn-secondary">Cancelar</Link>
        </div>
      </Form>
    </div>
  );
}
