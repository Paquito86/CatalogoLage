import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { ProductWithRelations } from "~/lib/catalog.server";

type CategoryOption = { Id: number; Name: string };
type GrapeTypeOption = { Id: number; Name: string };

interface ProductEditModalProps {
  product: ProductWithRelations | null;
  categories: CategoryOption[];
  grapeTypes: GrapeTypeOption[];
  csrfToken: string | null;
  onClose: () => void;
}

export default function ProductEditModal({
  product,
  categories,
  grapeTypes,
  csrfToken,
  onClose,
}: ProductEditModalProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setIsOpen(true);
      setHasSubmitted(false);
    } else {
      setIsOpen(false);
    }
  }, [product]);

  useEffect(() => {
    if (hasSubmitted && fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
      onClose();
    }
  }, [hasSubmitted, fetcher.state, fetcher.data, onClose]);

  if (!product || !isOpen) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Producto: {product.Name}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <fetcher.Form method="post" action="/api/products/save" onSubmit={() => setHasSubmitted(true)}>
              <div className="modal-body">
                <input type="hidden" name="_csrf" value={csrfToken ?? ""} />
                <input type="hidden" name="Id" value={product.Id} />
                <div className="row g-3">
                  <div className="col-md-8">
                    <label htmlFor="Name" className="form-label">Nombre</label>
                    <input type="text" className="form-control" id="Name" name="Name" defaultValue={product.Name} required />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="CategoryId" className="form-label">Categoría</label>
                    <select className="form-select" id="CategoryId" name="CategoryId" defaultValue={product.CategoryId ?? ""}>
                      <option value="">-- Seleccionar --</option>
                      {categories.map((c) => (
                        <option key={c.Id} value={c.Id}>{c.Name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="Winery" className="form-label">Bodega</label>
                    <input type="text" className="form-control" id="Winery" name="Winery" defaultValue={product.Winery ?? ""} />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="Manufacturer" className="form-label">Fabricante</label>
                    <input type="text" className="form-control" id="Manufacturer" name="Manufacturer" defaultValue={product.Manufacturer ?? ""} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="Price" className="form-label">Precio</label>
                    <input type="text" className="form-control" id="Price" name="Price" defaultValue={product.Price != null ? String(product.Price) : ""} placeholder="0.00" />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="AlcoholPercent" className="form-label">% Alcohol</label>
                    <input type="text" className="form-control" id="AlcoholPercent" name="AlcoholPercent" defaultValue={product.AlcoholPercent != null ? product.AlcoholPercent : ""} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="Size" className="form-label">Tamaño</label>
                    <input type="text" className="form-control" id="Size" name="Size" defaultValue={product.Size ?? ""} />
                  </div>
                   <div className="col-md-6">
                    <label htmlFor="GrapeTypeId" className="form-label">Tipo de Uva</label>
                    <select className="form-select" id="GrapeTypeId" name="GrapeTypeId" defaultValue={product.GrapeTypeId ?? ""}>
                      <option value="">-- Seleccionar --</option>
                      {grapeTypes.map((g) => (
                        <option key={g.Id} value={g.Id}>{g.Name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="Origin" className="form-label">Origen</label>
                    <input type="text" className="form-control" id="Origin" name="Origin" defaultValue={product.Origin ?? ""} />
                  </div>
                   <div className="col-12">
                    <label htmlFor="ImageUrl" className="form-label">URL de Imagen</label>
                    <input type="text" className="form-control" id="ImageUrl" name="ImageUrl" defaultValue={product.ImageUrl ?? ""} />
                  </div>
                  <div className="col-12">
                    <label htmlFor="Description" className="form-label">Descripción</label>
                     <textarea className="form-control" id="Description" name="Description" rows={3} defaultValue={product.Description ?? ""}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </>
  );
}
