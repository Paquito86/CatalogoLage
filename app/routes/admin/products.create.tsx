import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/products.create";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const categories = await prisma.category.findMany({
    orderBy: [{ SortOrder: "asc" }, { Name: "asc" }],
  });
  const grapeTypes = await prisma.grapeType.findMany({
    orderBy: { Name: "asc" },
  });

  return { categories, grapeTypes };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const categoryId = parseInt(String(formData.get("CategoryId")), 10);
  if (!categoryId) {
    return { error: "La categoría es obligatoria." };
  }

  const priceStr = String(formData.get("Price") || "");
  const alcoholStr = String(formData.get("AlcoholPercent") || "");
  const grapeTypeIdStr = String(formData.get("GrapeTypeId") || "");

  let price: number | null = null;
  if (priceStr) {
    const parsed = parseFloat(priceStr.replace(",", "."));
    if (!isNaN(parsed)) price = parsed;
  }

  let alcoholPercent: number | null = null;
  if (alcoholStr) {
    const parsed = parseFloat(alcoholStr.replace(",", "."));
    if (!isNaN(parsed)) alcoholPercent = parsed;
  }

  await prisma.product.create({
    data: {
      Name: name,
      Manufacturer: String(formData.get("Manufacturer") || "") || null,
      Winery: String(formData.get("Winery") || "") || null,
      Price: price,
      Description: String(formData.get("Description") || "") || null,
      ImageUrl: String(formData.get("ImageUrl") || "") || null,
      Size: String(formData.get("Size") || "") || null,
      AlcoholPercent: alcoholPercent,
      Origin: String(formData.get("Origin") || "") || null,
      CategoryId: categoryId,
      GrapeTypeId: grapeTypeIdStr ? parseInt(grapeTypeIdStr, 10) : null,
    },
  });

  return redirect("/admin/products");
}

export default function ProductCreate() {
  const { categories, grapeTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1 className="mb-4">Crear Producto</h1>

      {actionData?.error && (
        <div className="alert alert-danger">{actionData.error}</div>
      )}

      <Form method="post">
        <div className="row">
          <div className="col-md-8">
            <div className="mb-3">
              <label htmlFor="Name" className="form-label">Nombre *</label>
              <input type="text" id="Name" name="Name" className="form-control" required />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="Manufacturer" className="form-label">Fabricante</label>
                <input type="text" id="Manufacturer" name="Manufacturer" className="form-control" />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="Winery" className="form-label">Bodega</label>
                <input type="text" id="Winery" name="Winery" className="form-control" />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="Price" className="form-label">Precio</label>
                <input type="number" id="Price" name="Price" className="form-control" step="0.01" min="0" />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="Size" className="form-label">Tamaño</label>
                <input type="text" id="Size" name="Size" className="form-control" />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="AlcoholPercent" className="form-label">% Alcohol</label>
                <input type="number" id="AlcoholPercent" name="AlcoholPercent" className="form-control" step="0.1" min="0" />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="Origin" className="form-label">Origen</label>
              <input type="text" id="Origin" name="Origin" className="form-control" />
            </div>

            <div className="mb-3">
              <label htmlFor="Description" className="form-label">Descripción</label>
              <textarea id="Description" name="Description" className="form-control" rows={3}></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="ImageUrl" className="form-label">URL de Imagen</label>
              <input type="url" id="ImageUrl" name="ImageUrl" className="form-control" />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="CategoryId" className="form-label">Categoría *</label>
                <select id="CategoryId" name="CategoryId" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  {categories.map((cat: { Id: number; Name: string }) => (
                    <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="GrapeTypeId" className="form-label">Tipo de Uva</label>
                <select id="GrapeTypeId" name="GrapeTypeId" className="form-select">
                  <option value="">Ninguno</option>
                  {grapeTypes.map((gt: { Id: number; Name: string }) => (
                    <option key={gt.Id} value={gt.Id}>{gt.Name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-primary me-2">Crear</button>
          <Link to="/admin/products" className="btn btn-secondary">Cancelar</Link>
        </div>
      </Form>
    </div>
  );
}
