import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { getUser } from "./lib/auth.server";
import AgeVerification from "./components/AgeVerification";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
      </body>
    </html>
  );
}

function Navbar() {
  const data = useRouteLoaderData<typeof loader>("root");
  const user = data?.user;
  const isAdminUser = user?.roles.includes("Admin");

  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-white border-bottom shadow-sm mb-3">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="https://almaceneslage.com/wp-content/uploads/2016/12/logo_LAGE.png"
            alt="LAGE"
            style={{ height: "32px", width: "auto", maxHeight: "36px" }}
          />
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav flex-grow-1">
            <li className="nav-item">
              <NavLink className="nav-link text-dark" to="/">Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-dark" to="/catalog">Vino</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-dark" to="/destilados">Destilados</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-dark" to="/cafe">Café e Infusiones</NavLink>
            </li>
            {isAdminUser && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Administración
                </a>
                <ul className="dropdown-menu">
                  <li><NavLink className="dropdown-item" to="/admin/products">Productos</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/admin/categories">Categorías</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/admin/grape-types">Tipos de uva</NavLink></li>
                </ul>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <form method="post" action="/logout">
                <span className="me-2 text-muted small">{user.email}</span>
                <button type="submit" className="btn btn-outline-secondary btn-sm">
                  Cerrar sesión
                </button>
              </form>
            ) : (
              <NavLink to="/login" className="btn btn-outline-primary btn-sm">
                Iniciar sesión
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AgeVerification>
      <header>
        <Navbar />
      </header>
      <div className="container">
        <main role="main" className="pb-3">
          <Outlet />
        </main>
      </div>
      <footer className="border-top footer text-muted mt-4 py-3">
        <div className="container">
          &copy; 2026 Álvaro Díaz para Almacenes Lage
        </div>
      </footer>
    </AgeVerification>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "¡Error!";
  let details = "Ha ocurrido un error inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "No se encontró la página solicitada."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-4 p-4 container">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-100 p-4 overflow-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
