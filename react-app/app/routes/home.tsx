import { Link } from "react-router";

export default function Home() {
  return (
    <>
      <div className="hero-section">
        <h1>Almacenes Lage</h1>
        <p>Distribución de bebidas — Catálogo de productos</p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <Link to="/catalog" className="text-decoration-none">
            <div className="card catalog-card h-100 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-cup-fill fs-1 text-danger mb-3 d-block" />
                <h3 className="card-title">Vino</h3>
                <p className="card-text text-muted">
                  Descubre nuestra selección de vinos tintos, blancos, rosados y más.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/destilados" className="text-decoration-none">
            <div className="card catalog-card h-100 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-droplet-fill fs-1 text-warning mb-3 d-block" />
                <h3 className="card-title">Destilados</h3>
                <p className="card-text text-muted">
                  Whisky, ron, ginebra, vodka, tequila y licores premium.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/cafe" className="text-decoration-none">
            <div className="card catalog-card h-100 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-cup-hot-fill fs-1 text-success mb-3 d-block" />
                <h3 className="card-title">Café e Infusiones</h3>
                <p className="card-text text-muted">
                  Café de especialidad, tés e infusiones de todo el mundo.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
