import { Form, Link, redirect, useActionData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/categories.create";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const sortOrderStr = String(formData.get("SortOrder") || "");

  await prisma.category.create({
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null,
      SortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : null,
    },
  });

  return redirect("/admin/categories");
}

export default function CategoryCreate() {
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
              <label htmlFor="SortOrder" className="form-label">Orden</label>
              <select id="SortOrder" name="SortOrder" className="form-select">
                <option value="">Sin orden</option>
                <option value="1">1 — Vinos</option>
                <option value="2">2 — Destilados</option>
                <option value="3">3 — Café</option>
              </select>
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
