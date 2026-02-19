import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

function buildMssqlConfig() {
  const url = process.env.DATABASE_URL ?? "";
  // Format: sqlserver://host:port;key=value;...
  const withoutScheme = url.replace(/^sqlserver:\/\//, "");
  const parts = withoutScheme.split(";");
  const hostPort = parts[0].split(":");
  const params: Record<string, string> = {};
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

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const adapter = new PrismaMssql(buildMssqlConfig());

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ adapter });
  }
  prisma = global.__prisma;
}

export { prisma };
