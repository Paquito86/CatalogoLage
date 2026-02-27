import { Form, redirect, useActionData } from "react-router";
import { verifyLogin, getSession, commitSession } from "~/lib/auth.server";
import type { Route } from "./+types/login";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  const user = await verifyLogin(email, password);
  if (!user) {
    return { error: "Email o contraseña incorrectos." };
  }

  const session = await getSession(request);
  session.set("userId", user.id);

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <h1 className="mb-4">Iniciar sesión</h1>

        {actionData?.error && (
          <div className="alert alert-danger">{actionData.error}</div>
        )}

        <Form method="post">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Iniciar sesión
          </button>
        </Form>
      </div>
    </div>
  );
}
