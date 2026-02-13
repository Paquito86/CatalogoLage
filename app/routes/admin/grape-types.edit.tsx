import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import type { Route } from "./+types/grape-types.edit";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);
  const grapeType = await prisma.grapeType.findUnique({ where: { Id: id } });
  if (!grapeType) throw new Response("Tipo de uva no encontrado", { status: 404 });

  return { grapeType };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);

  const id = parseInt(params.id, 10);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  await prisma.grapeType.update({
    where: { Id: id },
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null,
    },
  });

  return redirect("/admin/grape-types");
}

export default function GrapeTypeEdit() {
  const { grapeType } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1 className="mb-4">Editar Tipo de Uva</h1>

      {actionData?.error && (
        <div className="alert alert-danger">{actionData.error}</div>
      )}

      <Form method="post">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="Name" className="form-label">Nombre *</label>
              <input
                type="text"
                id="Name"
                name="Name"
                className="form-control"
                defaultValue={grapeType.Name}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="Description" className="form-label">Descripción</label>
              <textarea
                id="Description"
                name="Description"
                className="form-control"
                rows={3}
                defaultValue={grapeType.Description ?? ""}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-primary me-2">Guardar</button>
          <Link to="/admin/grape-types" className="btn btn-secondary">Cancelar</Link>
        </div>
      </Form>
    </div>
  );
}
