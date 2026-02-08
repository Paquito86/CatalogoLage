import { useLoaderData } from "react-router";
import { loadCatalogData } from "~/lib/catalog.server";
import { getUser, isAdmin } from "~/lib/auth.server";
import CatalogGrid from "~/components/CatalogGrid";
import type { Route } from "./+types/destilados";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const user = await getUser(request);
  const adminMode = url.searchParams.get("AdminMode") === "true" && isAdmin(user);
  const isPrintMode = url.searchParams.get("Print") === "true" && isAdmin(user);

  const data = await loadCatalogData("spirits", {
    query: url.searchParams.get("Query") || undefined,
    categoryId: url.searchParams.get("categoryId") ? Number(url.searchParams.get("categoryId")) : undefined,
    winery: url.searchParams.get("Winery") || undefined,
    origin: url.searchParams.get("Origin") || undefined,
    grapeTypeId: url.searchParams.get("GrapeTypeId") ? Number(url.searchParams.get("GrapeTypeId")) : undefined,
  });

  return {
    ...data,
    isAdminUser: isAdmin(user),
    isLoggedIn: !!user,
    adminMode,
    isPrintMode,
  };
}

export default function DestiladosPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <CatalogGrid
      data={data as any}
      catalogType="spirits"
      title="Catálogo de Destilados"
      isAdmin={data.isAdminUser}
      isLoggedIn={data.isLoggedIn}
      adminMode={data.adminMode}
      isPrintMode={data.isPrintMode}
    />
  );
}
