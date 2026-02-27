import { Link } from "react-router";

export default function Home() {
  return (
    <>
      <div className="hero-section" style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://eu2.contabostorage.com/e4ecd8e8ee8c4b2f81cfae38d5e07fa4:lage/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <h1>Almacenes Lage</h1>
        <p>Catálogo de productos</p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <Link to="/catalog" className="text-decoration-none">
            <div className="card catalog-card h-75 shadow-sm border-0 text-white">
              <img 
                src="https://eu2.contabostorage.com/e4ecd8e8ee8c4b2f81cfae38d5e07fa4:lage/landing-vino.jpg" 
                className="card-img h-100" 
                alt="Vino" 
                style={{ objectFit: "cover", minHeight: "300px" }}
              />
              <div className="card-img-overlay d-flex flex-column justify-content-center text-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                <h3 className="card-title fw-bold">Vino</h3>
                <p className="card-text">
                  Descubre nuestra selección de vinos tintos, blancos, rosados y más.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/destilados" className="text-decoration-none">
            <div className="card catalog-card h-75 shadow-sm border-0 text-white">
              <img 
                src="https://eu2.contabostorage.com/e4ecd8e8ee8c4b2f81cfae38d5e07fa4:lage/landing-destilados.jpg" 
                className="card-img h-100" 
                alt="Destilados" 
                style={{ objectFit: "cover", minHeight: "300px" }}
              />
              <div className="card-img-overlay d-flex flex-column justify-content-center text-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                <h3 className="card-title fw-bold">Destilados</h3>
                <p className="card-text">
                  Whisky, ron, ginebra, vodka, tequila y licores.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/cafe" className="text-decoration-none">
            <div className="card catalog-card h-75 shadow-sm border-0 text-white">
              <img 
                src="https://eu2.contabostorage.com/e4ecd8e8ee8c4b2f81cfae38d5e07fa4:lage/segafredo2.jpeg" 
                className="card-img h-100" 
                alt="Café e Infusiones" 
                style={{ objectFit: "cover", minHeight: "300px" }}
              />
              <div className="card-img-overlay d-flex flex-column justify-content-center text-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                <h3 className="card-title fw-bold">Café e Infusiones</h3>
                <p className="card-text">
                  Café de especialidad, tés e infusiones.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
