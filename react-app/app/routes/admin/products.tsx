import { Form, Link, useLoaderData, useActionData, useSearchParams } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/products";
import { useState, useRef, useEffect } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const categoryFilterId = url.searchParams.get("CategoryFilterId") || "";

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { Name: { contains: q } },
      { Manufacturer: { contains: q } },
      { Winery: { contains: q } },
    ];
  }

  if (categoryFilterId) {
    where.CategoryId = parseInt(categoryFilterId, 10);
  }

  const products = await prisma.product.findMany({
    where,
    include: { Category: true },
    orderBy: { Name: "asc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: [{ SortOrder: "asc" }, { Name: "asc" }],
  });

  return { products, categories, q, categoryFilterId };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "BulkChangeCategory") {
    const selectedIds = formData.getAll("selectedProducts").map((id) => parseInt(String(id), 10));
    const newCategoryId = parseInt(String(formData.get("newCategoryId")), 10);

    if (selectedIds.length > 0 && newCategoryId) {
      await prisma.product.updateMany({
        where: { Id: { in: selectedIds } },
        data: { CategoryId: newCategoryId },
      });
    }

    return { success: true, message: `${selectedIds.length} producto(s) actualizados.` };
  }

  if (intent === "BulkAssignMaker") {
    const selectedIds = formData.getAll("selectedProducts").map((id) => parseInt(String(id), 10));
    const makerType = String(formData.get("makerType"));
    const makerValue = String(formData.get("makerValue") || "");

    if (selectedIds.length > 0 && makerValue) {
      const data: Record<string, string> = {};
      if (makerType === "Winery") {
        data.Winery = makerValue;
      } else {
        data.Manufacturer = makerValue;
      }

      await prisma.product.updateMany({
        where: { Id: { in: selectedIds } },
        data,
      });
    }

    return { success: true, message: `${selectedIds.length} producto(s) actualizados.` };
  }

  return { success: false, message: "Acción no reconocida." };
}

export default function AdminProducts() {
  const { products, categories, q, categoryFilterId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMakerModal, setShowMakerModal] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < products.length;
    }
  }, [selectedIds, products.length]);

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? products.map((p: { Id: number }) => p.Id) : []);
  }

  function handleSelectOne(id: number, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }

  return (
    <div>
      <h1 className="mb-4">Productos</h1>

      {actionData?.message && (
        <div className={`alert ${actionData.success ? "alert-success" : "alert-danger"}`}>
          {actionData.message}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/admin/products/create" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Crear Producto
        </Link>
      </div>

      {/* Search and Filter */}
      <Form method="get" className="row g-2 mb-3">
        <div className="col-auto">
          <input
            type="text"
            name="q"
            className="form-control"
            placeholder="Buscar..."
            defaultValue={q}
          />
        </div>
        <div className="col-auto">
          <select
            name="CategoryFilterId"
            className="form-select"
            defaultValue={categoryFilterId}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat: { Id: number; Name: string }) => (
              <option key={cat.Id} value={cat.Id}>
                {cat.Name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-outline-secondary">
            Filtrar
          </button>
        </div>
        {(q || categoryFilterId) && (
          <div className="col-auto">
            <Link to="/admin/products" className="btn btn-outline-danger">
              Limpiar
            </Link>
          </div>
        )}
      </Form>

      {/* Bulk Actions */}
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm me-2"
          disabled={selectedIds.length === 0}
          onClick={() => setShowCategoryModal(true)}
        >
          Cambiar Categoría ({selectedIds.length})
        </button>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          disabled={selectedIds.length === 0}
          onClick={() => setShowMakerModal(true)}
        >
          Asignar Fabricante/Bodega ({selectedIds.length})
        </button>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Nombre</th>
              <th>Fabricante / Bodega</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: {
              Id: number;
              Name: string;
              Manufacturer: string | null;
              Winery: string | null;
              Category: { Name: string };
              Price: unknown;
            }) => (
              <tr key={product.Id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.Id)}
                    onChange={(e) => handleSelectOne(product.Id, e.target.checked)}
                  />
                </td>
                <td>{product.Name}</td>
                <td>{product.Manufacturer || product.Winery || "—"}</td>
                <td>{product.Category.Name}</td>
                <td>{product.Price != null ? `$${product.Price}` : "—"}</td>
                <td>
                  <Link
                    to={`/admin/products/${product.Id}/edit`}
                    className="btn btn-sm btn-outline-secondary me-1"
                  >
                    Editar
                  </Link>
                  <Link
                    to={`/admin/products/${product.Id}/delete`}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Eliminar
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-muted">Total: {products.length} producto(s)</p>

      {/* Bulk Change Category Modal */}
      {showCategoryModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <Form method="post" onSubmit={() => setShowCategoryModal(false)}>
                <input type="hidden" name="intent" value="BulkChangeCategory" />
                {selectedIds.map((id) => (
                  <input key={id} type="hidden" name="selectedProducts" value={id} />
                ))}
                <div className="modal-header">
                  <h5 className="modal-title">Cambiar Categoría</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>{selectedIds.length} producto(s) seleccionado(s)</p>
                  <div className="mb-3">
                    <label htmlFor="newCategoryId" className="form-label">Nueva Categoría</label>
                    <select name="newCategoryId" id="newCategoryId" className="form-select" required>
                      <option value="">Seleccionar...</option>
                      {categories.map((cat: { Id: number; Name: string }) => (
                        <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">Aplicar</button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Maker Modal */}
      {showMakerModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <Form method="post" onSubmit={() => setShowMakerModal(false)}>
                <input type="hidden" name="intent" value="BulkAssignMaker" />
                {selectedIds.map((id) => (
                  <input key={id} type="hidden" name="selectedProducts" value={id} />
                ))}
                <div className="modal-header">
                  <h5 className="modal-title">Asignar Fabricante / Bodega</h5>
                  <button type="button" className="btn-close" onClick={() => setShowMakerModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>{selectedIds.length} producto(s) seleccionado(s)</p>
                  <div className="mb-3">
                    <label htmlFor="makerType" className="form-label">Tipo</label>
                    <select name="makerType" id="makerType" className="form-select" required>
                      <option value="Winery">Bodega</option>
                      <option value="Manufacturer">Fabricante</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="makerValue" className="form-label">Valor</label>
                    <input
                      type="text"
                      name="makerValue"
                      id="makerValue"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMakerModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">Aplicar</button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
