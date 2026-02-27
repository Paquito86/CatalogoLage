import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { writeFileSync } from "fs";
import { config } from "dotenv";

config(); // carga el .env

const CONTABO_DOMAIN = "https://eu2.contabostorage.com/";

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

const products = await prisma.product.findMany({
  select: {
    Id: true,
    Name: true,
    ImageUrl: true,
    Category: { select: { Name: true } },
  },
});

const filtered = products.filter(
  (p) => !p.ImageUrl || !p.ImageUrl.startsWith(CONTABO_DOMAIN)
);

const output = filtered.map((p) => ({
  id: p.Id,
  name: p.Name,
  category: p.Category.Name,
  imageUrl: p.ImageUrl ?? null,
}));

const outputPath = "scripts/products-without-contabo-image.json";
writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(
  `Se encontraron ${output.length} productos sin imagen en Contabo (de ${products.length} totales).`
);
console.log(`Resultado guardado en: ${outputPath}`);

await prisma.$disconnect();
