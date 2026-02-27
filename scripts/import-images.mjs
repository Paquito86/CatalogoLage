import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { readFileSync } from "fs";
import { config } from "dotenv";

config();

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

const jsonPath = "scripts/products-without-contabo-image.json";
const products = JSON.parse(readFileSync(jsonPath, "utf-8"));

const toUpdate = products.filter((p) => p.modified === true);

if (toUpdate.length === 0) {
  console.log('No hay productos con "modified: true". Nada que importar.');
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`Actualizando ${toUpdate.length} producto(s)...`);

let ok = 0;
let errors = 0;

for (const product of toUpdate) {
  try {
    await prisma.product.update({
      where: { Id: product.id },
      data: { ImageUrl: product.imageUrl },
    });
    console.log(`  ✓ [${product.id}] ${product.name}`);
    ok++;
  } catch (err) {
    console.error(`  ✗ [${product.id}] ${product.name}: ${err.message}`);
    errors++;
  }
}

console.log(`\nFinalizado: ${ok} actualizados, ${errors} errores.`);

await prisma.$disconnect();
