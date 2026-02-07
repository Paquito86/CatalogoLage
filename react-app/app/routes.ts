import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("catalog", "routes/catalog.tsx"),
  route("destilados", "routes/destilados.tsx"),
  route("cafe", "routes/cafe.tsx"),

  // API routes
  route("api/lookups/categories", "routes/api.lookups.categories.ts"),
  route("api/lookups/grapes", "routes/api.lookups.grapes.ts"),
  route("api/products/:id", "routes/api.products.$id.ts"),
  route("api/products/save", "routes/api.products.save.ts"),
  route("api/catalog/:catalogType/update-position", "routes/api.catalog.update-position.ts"),
  route("api/catalog/:catalogType/vaciar-celda", "routes/api.catalog.vaciar-celda.ts"),
  route("api/catalog/:catalogType/create-title", "routes/api.catalog.create-title.ts"),
  route("api/catalog/:catalogType/update-title", "routes/api.catalog.update-title.ts"),
  route("api/catalog/:catalogType/delete-title", "routes/api.catalog.delete-title.ts"),
  route("api/catalog/:catalogType/insert-row", "routes/api.catalog.insert-row.ts"),
  route("api/catalog/:catalogType/delete-row", "routes/api.catalog.delete-row.ts"),
  route("api/catalog/:catalogType/delete-last-empty-rows", "routes/api.catalog.delete-last-empty-rows.ts"),
  route("api/catalog/:catalogType/place-unassigned", "routes/api.catalog.place-unassigned.ts"),

  // Admin routes
  route("admin/products", "routes/admin/products.tsx"),
  route("admin/products/create", "routes/admin/products.create.tsx"),
  route("admin/products/:id/edit", "routes/admin/products.edit.tsx"),
  route("admin/products/:id/delete", "routes/admin/products.delete.tsx"),
  route("admin/categories", "routes/admin/categories.tsx"),
  route("admin/categories/create", "routes/admin/categories.create.tsx"),
  route("admin/categories/:id/edit", "routes/admin/categories.edit.tsx"),
  route("admin/categories/:id/delete", "routes/admin/categories.delete.tsx"),
  route("admin/grape-types", "routes/admin/grape-types.tsx"),
  route("admin/grape-types/create", "routes/admin/grape-types.create.tsx"),
  route("admin/grape-types/:id/edit", "routes/admin/grape-types.edit.tsx"),
  route("admin/grape-types/:id/delete", "routes/admin/grape-types.delete.tsx"),
] satisfies RouteConfig;
