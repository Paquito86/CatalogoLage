import { redirect } from "react-router";
import { getSession, destroySession } from "~/lib/auth.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request);
  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export function loader() {
  return redirect("/");
}
