/**
 * Migration script: seeds the Catalogs table and maps existing Category.SortOrder → CatalogId.
 *
 * SortOrder mapping:
 *   null or 1  → wines       (slug: "wines")
 *   2          → spirits     (slug: "spirits")
 *   3          → cafe        (slug: "cafe")
 *   4          → aguacerveza (slug: "aguacerveza")
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

function buildMssqlConfig() {
  const url = process.env.DATABASE_URL ?? "";
  const withoutScheme = url.replace(/^sqlserver:\/\//, "");
  const parts = withoutScheme.split(";");
  const hostPort = parts[0].split(":");
  const params = {};
  for (const part of parts.slice(1)) {
    const [k, ...v] = part.split("=");
    if (k) params[k.toLowerCase()] = v.join("=");
  }
  return {
    server: hostPort[0],
    port: hostPort[1] ? parseInt(hostPort[1], 10) : 1433,
    database: params["database"],
    user: params["user"],
    password: params["password"],
    options: {
      encrypt: params["encrypt"] !== "false",
      trustServerCertificate: params["trustservercertificate"] === "true",
    },
  };
}

const adapter = new PrismaMssql(buildMssqlConfig());
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Catalogs table...");

  const catalogs = [
    { Name: "Vinos", Slug: "wines" },
    { Name: "Destilados", Slug: "spirits" },
    { Name: "Café", Slug: "cafe" },
    { Name: "Agua y Cerveza", Slug: "aguacerveza" },
  ];

  for (const catalog of catalogs) {
    await prisma.catalog.upsert({
      where: { Slug: catalog.Slug },
      update: { Name: catalog.Name },
      create: catalog,
    });
    console.log(`  ✓ Catalog: ${catalog.Name} (slug=${catalog.Slug})`);
  }

  // Map SortOrder → CatalogId for existing categories
  console.log("\nMigrating Category.SortOrder → CatalogId...");

  const mapping = [
    { where: { SortOrder: 1 }, catalogSlug: "wines" },
    { where: { SortOrder: 2 }, catalogSlug: "spirits" },
    { where: { SortOrder: 3 }, catalogSlug: "cafe" },
    { where: { SortOrder: 4 }, catalogSlug: "aguacerveza" },
    // Categories with null SortOrder are treated as wines (legacy)
    { where: { SortOrder: null }, catalogSlug: "wines" },
  ];

  for (const { where, catalogSlug } of mapping) {
    const catalog = await prisma.catalog.findUnique({ where: { Slug: catalogSlug } });
    if (!catalog) continue;

    const result = await prisma.category.updateMany({
      where,
      data: { CatalogId: catalog.Id },
    });
    console.log(
      `  ✓ SortOrder=${where.SortOrder ?? "null"} → CatalogId=${catalog.Id} (${catalogSlug}): ${result.count} categories updated`
    );
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
