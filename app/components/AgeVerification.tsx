import { useState, useEffect } from "react";

const COOKIE_NAME = "age_verified";
const COOKIE_VALUE = "true";

function setCookie(name: string, value: string) {
  // Cookie sin fecha de expiración = cookie de sesión persistente
  // Establecemos una fecha muy lejana en el futuro (100 años)
  const date = new Date();
  date.setFullYear(date.getFullYear() + 100);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

export default function AgeVerification({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si ya existe la cookie
    const verified = getCookie(COOKIE_NAME) === COOKIE_VALUE;
    setIsVerified(verified);
  }, []);

  const handleConfirm = () => {
    setCookie(COOKIE_NAME, COOKIE_VALUE);
    setIsVerified(true);
  };

  const handleReject = () => {
    window.location.href = "https://www.google.com";
  };

  // Mientras se verifica la cookie, no mostramos nada (evita parpadeo)
  if (isVerified === null) {
    return null;
  }

  // Mostrar modal de verificación superpuesto al contenido
  return (
    <>
      {children}
      {!isVerified && (
        <div 
          className="modal fade show" 
          role="dialog"
          aria-modal={true}
          aria-labelledby="age-dialog-title"
          style={{ 
            display: "block", 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999
          }} 
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 id="age-dialog-title" className="modal-title w-100 text-center fw-bold fs-4">Verificación de Edad</h5>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: "4rem" }} />
                </div>
                <h6 className="mb-3 fs-5">¿Eres mayor de 18 años?</h6>
                <p className="text-muted mb-4">
                  Este sitio web contiene información sobre bebidas alcohólicas.
                  <br />
                  Debes ser mayor de edad para acceder.
                </p>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button 
                    type="button" 
                    className="btn btn-success btn-lg px-5"
                    onClick={handleConfirm}
                  >
                    Sí, soy mayor de 18
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg px-5"
                    onClick={handleReject}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-center">
                <small className="text-muted">
                  Al continuar, confirmas que tienes la edad legal para consumir alcohol en tu país.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
