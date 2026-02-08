import { Form, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { CatalogData, CatalogType, ProductWithRelations } from "~/lib/catalog.server";
import ProductEditModal from "./ProductEditModal";

interface CatalogGridProps {
  data: CatalogData;
  catalogType: CatalogType;
  title: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  adminMode: boolean;
  isPrintMode: boolean;
}

function formatPrice(price: number | null | undefined | unknown) {
  if (price == null) return null;
  const num = typeof price === "object" && "toNumber" in (price as any) ? (price as any).toNumber() : Number(price);
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(num);
}

function ProductCard({
  product,
  x,
  y,
  isAdmin,
  isLoggedIn,
  adminMode,
  isPrintMode,
  catalogType,
  onContextMenu,
}: {
  product: ProductWithRelations;
  x: number;
  y: number;
  isAdmin: boolean;
  isLoggedIn: boolean;
  adminMode: boolean;
  isPrintMode: boolean;
  catalogType: CatalogType;
  onContextMenu?: (e: React.MouseEvent, product: ProductWithRelations) => void;
}) {
  const isWine = !!(product.Winery && product.Winery.trim());
  const hasPosition =
    catalogType === "wines"
      ? product.MatrixX != null && product.MatrixY != null
      : catalogType === "spirits"
        ? product.MatrixXSpirits != null && product.MatrixYSpirits != null
        : product.MatrixXCafe != null && product.MatrixYCafe != null;

  return (
    <div
      className={`card product-card h-100 ${adminMode ? "draggable" : ""}`}
      data-product-id={product.Id}
      data-x={x}
      data-y={y}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, product)}
    >
      {adminMode && !isPrintMode && (
        <>
          <div
            className={`drag-area ${hasPosition ? "positioned" : ""}`}
            draggable
            data-product-id={product.Id}
          >
            <div className="drag-handle">
              <i className="bi bi-hand-index-thumb fs-5" />
              <small>Arrastra</small>
            </div>
          </div>
          <div className="position-indicator">{`${x},${y}`}</div>
        </>
      )}
      <div className={`card-horizontal ${adminMode && !isPrintMode ? "non-draggable" : ""}`}>
        <div className="catalog-product-image-box">
          {product.ImageUrl ? (
            <img src={product.ImageUrl} alt={product.Name} draggable={false} />
          ) : !adminMode ? (
            <div className="no-image-placeholder">
              <i className="text-muted">?</i>
              <span className="text-muted small">Sin imagen</span>
            </div>
          ) : (
            <div className="no-image-placeholder">
              <i className="text-muted">?</i>
            </div>
          )}
        </div>
        <div className="card-body">
          <h5 className="card-title">{product.Name}</h5>
          <h6 className="card-subtitle mb-2 text-muted">
            {(isWine ? product.Winery : product.Manufacturer) ?? ""}
          </h6>
          {!adminMode && (
            <>
              {product.Description && <p className="card-text">{product.Description}</p>}
              <ul className="list-unstyled small product-details">
                {product.Size && (
                  <li><strong>Tamaño:</strong> {product.Size}</li>
                )}
                {product.AlcoholPercent != null && (
                  <li><strong>% Alcohol:</strong> {product.AlcoholPercent}%</li>
                )}
                {product.Origin && (
                  <li><strong>Origen:</strong> {product.Origin}</li>
                )}
                {product.GrapeType && (
                  <li><strong>Tipo de uva:</strong> {product.GrapeType.Name}</li>
                )}
                <li><strong>Categoría:</strong> {product.Category?.Name}</li>
              </ul>
            </>
          )}
          {adminMode && !isPrintMode && (
            <ul className="list-unstyled small text-muted mb-1">
              {product.Origin && (
                <li><strong>Origen:</strong> {product.Origin}</li>
              )}
              {product.GrapeType && (
                <li><strong>Tipo de uva:</strong> {product.GrapeType.Name}</li>
              )}
            </ul>
          )}
          {product.Price != null && isLoggedIn && (
            <div className={`product-price text-primary fw-bold ${adminMode ? "" : "fs-5"}`}>
              {formatPrice(product.Price)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogGrid({
  data,
  catalogType,
  title,
  isAdmin,
  isLoggedIn,
  adminMode,
  isPrintMode,
}: CatalogGridProps) {
  const [searchParams] = useSearchParams();
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; product: ProductWithRelations } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, product: ProductWithRelations) => {
    if (isAdmin && !adminMode) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, product });
    }
  };

  const titleRowMap = new Map(data.titleRows.map((t) => [t.MatrixY, t]));
  const emptyCellSet = new Set(data.emptyCells.map((e) => `${e.x},${e.y}`));
  const titleRowsWithProductsSet = new Set(data.titleRowsWithProducts);

  const query = searchParams.get("Query") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const winery = searchParams.get("Winery") || "";
  const origin = searchParams.get("Origin") || "";
  const grapeTypeId = searchParams.get("GrapeTypeId") || "";

  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";

  return (
    <>
      <h1>{title}</h1>

      {isAdmin && !isPrintMode && (
        <div className="mb-3">
          {adminMode ? (
            <a href={`${catalogPath}?${new URLSearchParams(Object.fromEntries([["Query", query], ["categoryId", categoryId], ["Winery", winery], ["Origin", origin], ["GrapeTypeId", grapeTypeId]].filter(([, v]) => v)))}`} className="btn btn-secondary">
              Salir del modo edición
            </a>
          ) : (
            <a href={`${catalogPath}?AdminMode=true&${new URLSearchParams(Object.fromEntries([["Query", query], ["categoryId", categoryId], ["Winery", winery], ["Origin", origin], ["GrapeTypeId", grapeTypeId]].filter(([, v]) => v)))}`} className="btn btn-warning">
              Modo edición de matriz
            </a>
          )}
          <a
            href={`${catalogPath}?Print=true&${new URLSearchParams(Object.fromEntries([["Query", query], ["categoryId", categoryId], ["Winery", winery], ["Origin", origin], ["GrapeTypeId", grapeTypeId]].filter(([, v]) => v)))}`}
            className="btn btn-outline-secondary ms-2"
          >
            Versión para imprimir
          </a>
        </div>
      )}

      {!isPrintMode && (
        <Form method="get" className="mb-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label htmlFor="q" className="form-label">Buscar</label>
              <input
                id="q"
                name="Query"
                defaultValue={query}
                className="form-control"
                placeholder="Nombre, descripción, fabricante o bodega"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="categoryId" className="form-label">Categoría</label>
              <select id="categoryId" name="categoryId" className="form-select" defaultValue={categoryId}>
                <option value="">-- Todas --</option>
                {data.categories.map((c) => (
                  <option key={c.Id} value={c.Id}>{c.Name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-grid">
              <button className="btn btn-primary" type="submit">Filtrar</button>
            </div>
          </div>
          <div className="row g-2 mt-2">
            <div className="col-md-4">
              <label htmlFor="Winery" className="form-label">
                {catalogType === "wines" ? "Bodega" : "Fabricante"}
              </label>
              <select id="Winery" name="Winery" className="form-select" defaultValue={winery}>
                <option value="">-- Todas --</option>
                {data.wineries.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="Origin" className="form-label">
                {catalogType === "wines" ? "Denominación de Origen" : "Origen"}
              </label>
              <select id="Origin" name="Origin" className="form-select" defaultValue={origin}>
                <option value="">-- Todas --</option>
                {data.origins.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="GrapeTypeId" className="form-label">Tipo de uva</label>
              <select id="GrapeTypeId" name="GrapeTypeId" className="form-select" defaultValue={grapeTypeId}>
                <option value="">-- Todas --</option>
                {data.grapeTypes.map((g) => (
                  <option key={g.Id} value={g.Id}>{g.Name}</option>
                ))}
              </select>
            </div>
          </div>
          {adminMode && <input type="hidden" name="AdminMode" value="true" />}
        </Form>
      )}

      <div className={`matrix-container ${isPrintMode ? "no-center" : ""} mb-4`}>
        <div
          className={`matrix-grid ${adminMode ? "admin-mode" : "view-mode"} ${data.isFiltered ? "filtered-mode" : ""}`}
          style={{ gridTemplateColumns: `repeat(${data.matrixColumns}, 1fr)` }}
        >
          {Array.from({ length: data.matrixRows }, (_, y) => {
            const titleRow = titleRowMap.get(y);
            if (titleRow) {
              const showTitle = !data.isFiltered || titleRowsWithProductsSet.has(y);
              return (
                <div
                  key={`title-${y}`}
                  className={`matrix-title-row section-row ${showTitle ? "" : "no-products"}`}
                  data-y={y}
                  data-level={titleRow.Level}
                  style={{ gridColumn: `1 / span ${data.matrixColumns}`, position: "relative" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {!isPrintMode && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary toggle-section"
                          title="Colapsar/expandir sección"
                        >
                          <i className="bi bi-chevron-up" />
                        </button>
                      )}
                      {titleRow.Level === 1 ? (
                        <h3 className="m-0 title-h1">
                          {titleRow.Text}
                          {adminMode && <small className="text-muted ms-2">Fila {titleRow.MatrixY}</small>}
                        </h3>
                      ) : (
                        <h4 className="m-0">
                          {titleRow.Text}
                          {adminMode && <small className="text-muted ms-2">Fila {titleRow.MatrixY}</small>}
                        </h4>
                      )}
                    </div>
                    {adminMode && !isPrintMode && (
                      <div className="d-flex align-items-center gap-2">
                        <TitleEditForm titleRow={titleRow} catalogType={catalogType} />
                        <DeleteTitleButton titleId={titleRow.Id} catalogType={catalogType} />
                      </div>
                    )}
                  </div>
                  {adminMode && !isPrintMode && (
                    <DeleteRowButton y={y} catalogType={catalogType} />
                  )}
                </div>
              );
            }

            return Array.from({ length: data.matrixColumns }, (_, x) => {
              const isEmptyReserved = emptyCellSet.has(`${x},${y}`);
              const product = data.productMatrix[y]?.[x] ?? null;
              const isEmptyCell = product == null;

              return (
                <div
                  key={`cell-${x}-${y}`}
                  className={`matrix-cell ${adminMode ? "editable" : ""} ${
                    isEmptyReserved && adminMode ? "reserved-empty" : ""
                  } ${data.isFiltered && isEmptyCell ? "empty" : ""}`}
                  data-x={x}
                  data-y={y}
                  style={{ position: "relative" }}
                >
                  {x === data.matrixColumns - 1 && adminMode && !isPrintMode && (
                    <DeleteRowButton y={y} catalogType={catalogType} />
                  )}
                  {product ? (
                    <ProductCard
                      product={product}
                      x={x}
                      y={y}
                      isAdmin={isAdmin}
                      isLoggedIn={isLoggedIn}
                      adminMode={adminMode}
                      isPrintMode={isPrintMode}
                      catalogType={catalogType}
                      onContextMenu={handleContextMenu}
                    />
                  ) : adminMode && !isPrintMode ? (
                    isEmptyReserved ? (
                      <div className="empty-cell-indicator reserved">{`${x},${y}`}</div>
                    ) : (
                      <div className="empty-cell-indicator">{`${x},${y}`}</div>
                    )
                  ) : null}
                </div>
              );
            });
          })}
        </div>
      </div>

      {adminMode && !isPrintMode && (
        <AdminControls data={data} catalogType={catalogType} />
      )}

      {adminMode && data.unpositionedProducts.length > 0 && !isPrintMode && (
        <UnpositionedProducts
          products={data.unpositionedProducts}
          catalogType={catalogType}
          matrixColumns={data.matrixColumns}
          isLoggedIn={isLoggedIn}
        />
      )}

      {adminMode && !isPrintMode && (
        <CreateTitleForm catalogType={catalogType} />
      )}

      {/* Client-side drag-drop script */}
      {adminMode && !isPrintMode && (
        <CatalogDragDropScript
          catalogType={catalogType}
          matrixRows={data.matrixRows}
          matrixColumns={data.matrixColumns}
          maxAllowedRows={data.maxAllowedRows}
          reservedRows={data.titleRows.map((t) => t.MatrixY)}
          emptyCells={data.emptyCells}
        />
      )}

      {isAdmin && !isPrintMode && contextMenu && (
        <div
          className="dropdown-menu show"
          style={{
             position: "fixed",
             top: contextMenu.y,
             left: contextMenu.x,
             zIndex: 9999,
          }}
        >
          <button
            className="dropdown-item"
            type="button"
            onClick={() => {
              setEditingProduct(contextMenu.product);
              setContextMenu(null);
            }}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Editar producto
          </button>
        </div>
      )}

      {isAdmin && !adminMode && (
        <ProductEditModal
          product={editingProduct}
          categories={data.categories}
          grapeTypes={data.grapeTypes}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}

function TitleEditForm({
  titleRow,
  catalogType,
}: {
  titleRow: { Id: number; Text: string; MatrixY: number; Level: number };
  catalogType: CatalogType;
}) {
  return (
    <form
      method="post"
      action={`/api/catalog/${catalogType}/update-title`}
      className="row g-1 align-items-end"
    >
      <div className="col-auto">
        <input type="hidden" name="id" value={titleRow.Id} />
        <input
          name="text"
          className="form-control form-control-sm"
          defaultValue={titleRow.Text}
          style={{ maxWidth: "220px" }}
        />
      </div>
      <div className="col-auto">
        <input
          name="y"
          type="number"
          min="0"
          className="form-control form-control-sm"
          defaultValue={titleRow.MatrixY}
          style={{ width: "90px" }}
        />
      </div>
      <div className="col-auto">
        <div className="btn-group" role="group">
          <input type="radio" className="btn-check" name="level" id={`levelH1_${titleRow.Id}`} value="1" defaultChecked={titleRow.Level === 1} />
          <label className="btn btn-outline-secondary btn-sm" htmlFor={`levelH1_${titleRow.Id}`}>h1</label>
          <input type="radio" className="btn-check" name="level" id={`levelH2_${titleRow.Id}`} value="2" defaultChecked={titleRow.Level !== 1} />
          <label className="btn btn-outline-secondary btn-sm" htmlFor={`levelH2_${titleRow.Id}`}>h2</label>
        </div>
      </div>
      <div className="col-auto">
        <button type="submit" className="btn btn-sm btn-outline-success">Guardar</button>
      </div>
    </form>
  );
}

function DeleteTitleButton({ titleId, catalogType }: { titleId: number; catalogType: CatalogType }) {
  return (
    <form
      method="post"
      action={`/api/catalog/${catalogType}/delete-title`}
      onSubmit={(e) => { if (!confirm("¿Eliminar este título?")) e.preventDefault(); }}
    >
      <input type="hidden" name="id" value={titleId} />
      <button type="submit" className="btn btn-sm btn-outline-danger">Eliminar</button>
    </form>
  );
}

function DeleteRowButton({ y, catalogType }: { y: number; catalogType: CatalogType }) {
  return (
    <form method="post" action={`/api/catalog/${catalogType}/delete-row`} className="delete-row-form">
      <input type="hidden" name="y" value={y} />
      <button
        type="submit"
        className="btn btn-sm btn-danger delete-row-btn"
        title="Eliminar fila"
        onClick={(e) => { if (!confirm("¿Eliminar esta fila? Se desplazarán hacia arriba las filas inferiores.")) e.preventDefault(); }}
      >
        ✖
      </button>
    </form>
  );
}

function AdminControls({ data, catalogType }: { data: CatalogData; catalogType: CatalogType }) {
  return (
    <div className="d-flex justify-content-end mb-4 gap-2">
      <form
        method="post"
        action={`/api/catalog/${catalogType}/insert-row`}
        className="d-inline-flex align-items-end gap-2 p-2 border rounded bg-light"
      >
        <div className="d-flex flex-column">
          <label className="form-label mb-0 small">Insertar fila en posición</label>
          <input
            name="y"
            type="number"
            min="0"
            className="form-control form-control-sm"
            defaultValue={data.matrixRows}
            style={{ width: "120px" }}
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-sm btn-outline-primary">Añadir fila</button>
        </div>
      </form>
      <form
        method="post"
        action={`/api/catalog/${catalogType}/delete-last-empty-rows`}
        className="d-inline-flex align-items-end gap-2 p-2 border rounded bg-light"
      >
        <div className="d-flex flex-column">
          <label className="form-label mb-0 small">Borrar últimas filas vacías</label>
          <input
            name="count"
            type="number"
            min="1"
            className="form-control form-control-sm"
            defaultValue={1}
            style={{ width: "120px" }}
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-sm btn-outline-danger">Borrar</button>
        </div>
      </form>
    </div>
  );
}

function UnpositionedProducts({
  products,
  catalogType,
  matrixColumns,
  isLoggedIn,
}: {
  products: ProductWithRelations[];
  catalogType: CatalogType;
  matrixColumns: number;
  isLoggedIn: boolean;
}) {
  return (
    <>
      <h5>Productos sin posición asignada ({products.length}):</h5>
      <div
        className="unpositioned-products mb-4"
        id="unassigned-container"
        style={{ display: "grid", gridTemplateColumns: `repeat(${matrixColumns}, 1fr)`, gap: "15px" }}
      >
        {products.map((p) => {
          const isWine = !!(p.Winery && p.Winery.trim());
          return (
            <div key={p.Id} className="card product-card" data-product-id={p.Id} data-unassigned="true">
              <div className="drag-area" draggable data-product-id={String(p.Id)}>
                <div className="drag-handle">
                  <i className="bi bi-hand-index-thumb fs-5" />
                  <small>Arrastra</small>
                </div>
              </div>
              <div className="card-horizontal non-draggable">
                <div className="catalog-product-image-box small">
                  {p.ImageUrl ? (
                    <img src={p.ImageUrl} alt={p.Name} draggable={false} />
                  ) : (
                    <div className="no-image-placeholder"><i className="text-muted">?</i></div>
                  )}
                </div>
                <div className="card-body">
                  <h6 className="card-title">{p.Name}</h6>
                  <small className="card-subtitle mb-2 text-muted">
                    {(isWine ? p.Winery : p.Manufacturer) ?? ""}
                  </small>
                  <ul className="list-unstyled small text-muted mb-1">
                    {p.Origin && <li><strong>Origen:</strong> {p.Origin}</li>}
                    {p.GrapeType && <li><strong>Tipo de uva:</strong> {p.GrapeType.Name}</li>}
                  </ul>
                  {p.Price != null && isLoggedIn && (
                    <div className="product-price text-primary fw-bold">{formatPrice(p.Price)}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CreateTitleForm({ catalogType }: { catalogType: CatalogType }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h6>Crear título de sección</h6>
        <form
          method="post"
          action={`/api/catalog/${catalogType}/create-title`}
          className="row g-2 align-items-end"
        >
          <div className="col-md-4">
            <label className="form-label">Texto</label>
            <input name="text" className="form-control form-control-sm" required />
          </div>
          <div className="col-md-2">
            <label className="form-label">Fila (Y)</label>
            <input name="y" type="number" min="0" className="form-control form-control-sm" defaultValue="0" />
          </div>
          <div className="col-md-2">
            <label className="form-label">Nivel</label>
            <select name="level" className="form-select form-select-sm" defaultValue="2">
              <option value="1">h1</option>
              <option value="2">h2</option>
            </select>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-sm btn-primary">Crear título</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CatalogDragDropScript({
  catalogType,
  matrixRows,
  matrixColumns,
  maxAllowedRows,
  reservedRows,
  emptyCells,
}: {
  catalogType: CatalogType;
  matrixRows: number;
  matrixColumns: number;
  maxAllowedRows: number;
  reservedRows: number[];
  emptyCells: { x: number; y: number }[];
}) {
  const scriptContent = `
    (function(){
      const catalogType = ${JSON.stringify(catalogType)};
      const matrixRows = ${matrixRows};
      const matrixColumns = ${matrixColumns};
      const allowedRows = ${maxAllowedRows};
      const reservedRows = new Set(${JSON.stringify(reservedRows)});
      const emptyReserved = new Set(${JSON.stringify(emptyCells.map((e) => e.x + ":" + e.y))});

      const dropCells = [...document.querySelectorAll('.matrix-cell.editable')].filter(c =>
        !reservedRows.has(parseInt(c.dataset.y)) && parseInt(c.dataset.y) < allowedRows
      );
      let autoScrollInterval = null;
      const scrollEdgeSize = 60;
      const scrollSpeed = 12;

      // Section collapse
      const sectionRows = [...document.querySelectorAll('.matrix-title-row.section-row')].sort((a,b) => parseInt(a.dataset.y) - parseInt(b.dataset.y));
      const allMatrixCells = [...document.querySelectorAll('.matrix-cell')];
      const storageKey = 'matrix-collapse:' + location.pathname;
      let collapsedSet = new Set();
      try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) collapsedSet = new Set(saved.map(v => parseInt(v,10)).filter(v => !Number.isNaN(v))); } catch {}

      function getSectionRange(row) {
        const yStart = parseInt(row.dataset.y);
        const level = parseInt(row.dataset.level || '2');
        if (level === 1) {
          const nextH1 = sectionRows.find(r => parseInt(r.dataset.y) > yStart && parseInt(r.dataset.level || '2') === 1);
          return { yStart, yEnd: nextH1 ? parseInt(nextH1.dataset.y) - 1 : matrixRows - 1 };
        }
        const idx = sectionRows.indexOf(row);
        const next = idx >= 0 && idx + 1 < sectionRows.length ? sectionRows[idx + 1] : null;
        return { yStart, yEnd: next ? parseInt(next.dataset.y) - 1 : matrixRows - 1 };
      }

      function setSectionCollapsed(row, collapsed) {
        const icon = row.querySelector('.toggle-section i');
        if (icon) { icon.classList.toggle('bi-chevron-up', !collapsed); icon.classList.toggle('bi-chevron-down', collapsed); }
        const { yStart, yEnd } = getSectionRange(row);
        allMatrixCells.forEach(c => {
          const y = parseInt(c.dataset.y);
          if (!Number.isNaN(y) && y > yStart && y <= yEnd) c.classList.toggle('hidden-by-section', collapsed);
        });
        if (parseInt(row.dataset.level || '2') === 1) {
          sectionRows.forEach(sr => {
            const y = parseInt(sr.dataset.y);
            if (y > yStart && y <= yEnd) {
              const icon = sr.querySelector('.toggle-section i');
              if (icon) { icon.classList.toggle('bi-chevron-down', collapsed); icon.classList.toggle('bi-chevron-up', !collapsed); }
              sr.classList.toggle('section-collapsed', collapsed);
            }
          });
        }
      }

      sectionRows.forEach(row => {
        const y = parseInt(row.dataset.y);
        if (collapsedSet.has(y)) { row.classList.add('section-collapsed'); setSectionCollapsed(row, true); }
      });

      document.querySelectorAll('.toggle-section').forEach(btn => {
        btn.addEventListener('click', function() {
          const row = this.closest('.section-row');
          const collapsed = row.classList.toggle('section-collapsed');
          setSectionCollapsed(row, collapsed);
          const y = parseInt(row.dataset.y);
          if (!Number.isNaN(y)) {
            if (collapsed) collapsedSet.add(y); else collapsedSet.delete(y);
            try { localStorage.setItem(storageKey, JSON.stringify([...collapsedSet])); } catch {}
          }
        });
      });

      // Drag & drop
      document.querySelectorAll('.drag-area').forEach(dragArea => {
        const productCard = dragArea.closest('.card');
        const productId = dragArea.dataset.productId || productCard?.dataset.productId;
        if (!productId) return;

        dragArea.addEventListener('dragstart', function(e) {
          e.stopPropagation();
          this.classList.add('dragging');
          productCard?.classList.add('being-dragged');
          e.dataTransfer.setData('text/plain', productId);
          e.dataTransfer.effectAllowed = 'move';
        });
        dragArea.addEventListener('dragend', function() {
          this.classList.remove('dragging');
          productCard?.classList.remove('being-dragged');
          dropCells.forEach(c => c.classList.remove('drag-over'));
          stopAutoScroll();
        });
      });

      dropCells.forEach(cell => {
        cell.addEventListener('dragover', function(e) {
          const y = parseInt(this.dataset.y);
          if (y >= allowedRows) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          this.classList.add('drag-over');
          handleAutoScroll(e.clientY);
        });
        cell.addEventListener('dragleave', function(e) {
          if (!this.contains(e.relatedTarget)) this.classList.remove('drag-over');
        });
        cell.addEventListener('drop', function(e) {
          e.preventDefault();
          this.classList.remove('drag-over');
          stopAutoScroll();
          const productId = e.dataTransfer.getData('text/plain');
          const x = parseInt(this.dataset.x);
          const y = parseInt(this.dataset.y);
          if (x >= 0 && x < matrixColumns && y >= 0 && y < matrixRows && y < allowedRows && !reservedRows.has(y)) {
            updateProductPosition(productId, x, y);
          }
        });
      });

      function handleAutoScroll(mouseY) {
        const vh = window.innerHeight;
        if (vh - mouseY < scrollEdgeSize) {
          if (!autoScrollInterval) autoScrollInterval = setInterval(() => window.scrollBy({ top: scrollSpeed, behavior: 'auto' }), 16);
        } else if (mouseY < scrollEdgeSize) {
          if (!autoScrollInterval) autoScrollInterval = setInterval(() => window.scrollBy({ top: -scrollSpeed, behavior: 'auto' }), 16);
        } else { stopAutoScroll(); }
      }
      function stopAutoScroll() { if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; } }

      // Context menu for vaciar celda
      document.addEventListener('contextmenu', function(e) {
        const card = e.target.closest('.product-card');
        const isUnassigned = card && card.dataset.unassigned === 'true';
        if (card && card.dataset.productId) {
          e.preventDefault();
          if (isUnassigned) {
            const productId = card.dataset.productId;
            const x = prompt('Columna (X):', '0');
            const y = prompt('Fila (Y):', '0');
            if (x !== null && y !== null) placeUnassigned(productId, parseInt(x), parseInt(y));
            return;
          }
          if (confirm('¿Reservar esta celda como vacía?')) {
            const productId = card.dataset.productId;
            const x = card.dataset.x || card.parentElement?.dataset.x;
            const y = card.dataset.y || card.parentElement?.dataset.y;
            vaciarCelda(productId, x, y);
          }
        }
      });

      async function updateProductPosition(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/update-position', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al actualizar posición'); }
      }

      async function vaciarCelda(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/vaciar-celda', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al reservar celda'); }
      }

      async function placeUnassigned(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/place-unassigned', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al asignar posición'); }
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}
