import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, createCookieSessionStorage, redirect, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, useRouteLoaderData, NavLink, Meta, Links, ScrollRestoration, Scripts, Link, useActionData, Form, useSearchParams, useLoaderData } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as process$1 from "node:process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/library";
import crypto from "crypto";
import { useState, useRef, useEffect } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client"
    },
    "output": {
      "value": "/home/runner/work/CatalogoLage/CatalogoLage/react-app/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/runner/work/CatalogoLage/CatalogoLage/react-app/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativePath": "../../prisma",
  "clientVersion": "6.9.0",
  "engineVersion": "81e4af48011447c3cc503a190e86995b66d2a28e",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlserver",
  "postinstall": false,
  "ciName": "GitHub Actions",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "sqlserver"\n  url      = env("DATABASE_URL")\n}\n\nmodel Product {\n  Id             Int      @id @default(autoincrement())\n  Name           String   @db.NVarChar(200)\n  Manufacturer   String?  @db.NVarChar(200)\n  Winery         String?  @db.NVarChar(200)\n  Price          Decimal? @db.Decimal(12, 2)\n  Description    String?  @db.NVarChar(Max)\n  ImageUrl       String?  @db.NVarChar(Max)\n  Size           String?  @db.NVarChar(50)\n  AlcoholPercent Float?\n  Origin         String?  @db.NVarChar(100)\n  CategoryId     Int\n  GrapeTypeId    Int?\n\n  // Wine matrix coordinates\n  MatrixX Int?\n  MatrixY Int?\n\n  // Spirits matrix coordinates\n  MatrixXSpirits Int?\n  MatrixYSpirits Int?\n\n  // Coffee matrix coordinates\n  MatrixXCafe Int?\n  MatrixYCafe Int?\n\n  Category  Category   @relation(fields: [CategoryId], references: [Id], onDelete: Cascade)\n  GrapeType GrapeType? @relation(fields: [GrapeTypeId], references: [Id], onDelete: NoAction, onUpdate: NoAction)\n\n  @@map("Products")\n}\n\nmodel Category {\n  Id          Int       @id @default(autoincrement())\n  Name        String    @db.NVarChar(Max)\n  Description String?   @db.NVarChar(Max)\n  SortOrder   Int?\n  Products    Product[]\n\n  @@map("Categories")\n}\n\nmodel GrapeType {\n  Id          Int       @id @default(autoincrement())\n  Name        String    @db.NVarChar(100)\n  Description String?   @db.NVarChar(300)\n  Products    Product[]\n\n  @@map("GrapeTypes")\n}\n\nmodel CatalogTitleRow {\n  Id      Int    @id @default(autoincrement())\n  Text    String @db.NVarChar(200)\n  MatrixY Int    @unique\n  Level   Int    @default(2)\n\n  @@map("CatalogTitleRows")\n}\n\nmodel CatalogSpiritsTitleRow {\n  Id      Int    @id @default(autoincrement())\n  Text    String @db.NVarChar(200)\n  MatrixY Int    @unique\n  Level   Int    @default(2)\n\n  @@map("CatalogSpiritsTitleRows")\n}\n\nmodel CatalogCafeTitleRow {\n  Id      Int    @id @default(autoincrement())\n  Text    String @db.NVarChar(200)\n  MatrixY Int    @unique\n  Level   Int    @default(2)\n\n  @@map("CatalogCafeTitleRows")\n}\n\nmodel CatalogEmptyCell {\n  Id Int @id @default(autoincrement())\n  X  Int\n  Y  Int\n\n  @@unique([X, Y])\n  @@map("CatalogEmptyCells")\n}\n\nmodel CatalogSpiritsEmptyCell {\n  Id Int @id @default(autoincrement())\n  X  Int\n  Y  Int\n\n  @@unique([X, Y])\n  @@map("CatalogSpiritsEmptyCells")\n}\n\nmodel CatalogCafeEmptyCell {\n  Id Int @id @default(autoincrement())\n  X  Int\n  Y  Int\n\n  @@unique([X, Y])\n  @@map("CatalogCafeEmptyCells")\n}\n\n// ASP.NET Identity tables (read-only from React app for authentication)\nmodel AspNetUser {\n  Id                   String           @id @db.NVarChar(450)\n  UserName             String?          @db.NVarChar(256)\n  NormalizedUserName   String?          @db.NVarChar(256)\n  Email                String?          @db.NVarChar(256)\n  NormalizedEmail      String?          @db.NVarChar(256)\n  EmailConfirmed       Boolean\n  PasswordHash         String?          @db.NVarChar(Max)\n  SecurityStamp        String?          @db.NVarChar(Max)\n  ConcurrencyStamp     String?          @db.NVarChar(Max)\n  PhoneNumber          String?          @db.NVarChar(Max)\n  PhoneNumberConfirmed Boolean\n  TwoFactorEnabled     Boolean\n  LockoutEnd           DateTime?        @db.DateTimeOffset\n  LockoutEnabled       Boolean\n  AccessFailedCount    Int\n  UserRoles            AspNetUserRole[]\n\n  @@map("AspNetUsers")\n}\n\nmodel AspNetRole {\n  Id               String           @id @db.NVarChar(450)\n  Name             String?          @db.NVarChar(256)\n  NormalizedName   String?          @db.NVarChar(256)\n  ConcurrencyStamp String?          @db.NVarChar(Max)\n  UserRoles        AspNetUserRole[]\n\n  @@map("AspNetRoles")\n}\n\nmodel AspNetUserRole {\n  UserId String     @db.NVarChar(450)\n  RoleId String     @db.NVarChar(450)\n  User   AspNetUser @relation(fields: [UserId], references: [Id], onDelete: Cascade)\n  Role   AspNetRole @relation(fields: [RoleId], references: [Id], onDelete: Cascade)\n\n  @@id([UserId, RoleId])\n  @@map("AspNetUserRoles")\n}\n',
  "inlineSchemaHash": "da7e48131f593babd567996254cbb843ce71a2a06b4dabfbee1aa8ad09d3c5b4",
  "copyEngine": true,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "dirname": ""
};
config.runtimeDataModel = JSON.parse('{"models":{"Product":{"dbName":"Products","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"Name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Manufacturer","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Winery","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Price","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"ImageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Size","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["50"]],"isGenerated":false,"isUpdatedAt":false},{"name":"AlcoholPercent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Float","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Origin","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["100"]],"isGenerated":false,"isUpdatedAt":false},{"name":"CategoryId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"GrapeTypeId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixX","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixY","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixXSpirits","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixYSpirits","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixXCafe","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixYCafe","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Category","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Category","nativeType":null,"relationName":"CategoryToProduct","relationFromFields":["CategoryId"],"relationToFields":["Id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"GrapeType","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"GrapeType","nativeType":null,"relationName":"GrapeTypeToProduct","relationFromFields":["GrapeTypeId"],"relationToFields":["Id"],"relationOnDelete":"NoAction","relationOnUpdate":"NoAction","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Category":{"dbName":"Categories","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"Name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"SortOrder","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Products","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Product","nativeType":null,"relationName":"CategoryToProduct","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"GrapeType":{"dbName":"GrapeTypes","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"Name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["100"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["300"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Products","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Product","nativeType":null,"relationName":"GrapeTypeToProduct","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"CatalogTitleRow":{"dbName":"CatalogTitleRows","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"Text","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixY","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Level","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":2,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"CatalogSpiritsTitleRow":{"dbName":"CatalogSpiritsTitleRows","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"Text","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixY","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Level","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":2,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"CatalogCafeTitleRow":{"dbName":"CatalogCafeTitleRows","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"Text","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"MatrixY","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Level","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":2,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"CatalogEmptyCell":{"dbName":"CatalogEmptyCells","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"X","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Y","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["X","Y"]],"uniqueIndexes":[{"name":null,"fields":["X","Y"]}],"isGenerated":false},"CatalogSpiritsEmptyCell":{"dbName":"CatalogSpiritsEmptyCells","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"X","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Y","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["X","Y"]],"uniqueIndexes":[{"name":null,"fields":["X","Y"]}],"isGenerated":false},"CatalogCafeEmptyCell":{"dbName":"CatalogCafeEmptyCells","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"X","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"Y","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["X","Y"]],"uniqueIndexes":[{"name":null,"fields":["X","Y"]}],"isGenerated":false},"AspNetUser":{"dbName":"AspNetUsers","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["450"]],"isGenerated":false,"isUpdatedAt":false},{"name":"UserName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["256"]],"isGenerated":false,"isUpdatedAt":false},{"name":"NormalizedUserName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["256"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Email","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["256"]],"isGenerated":false,"isUpdatedAt":false},{"name":"NormalizedEmail","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["256"]],"isGenerated":false,"isUpdatedAt":false},{"name":"EmailConfirmed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"PasswordHash","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"SecurityStamp","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"ConcurrencyStamp","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"PhoneNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"PhoneNumberConfirmed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"TwoFactorEnabled","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"LockoutEnd","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["DateTimeOffset",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"LockoutEnabled","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"AccessFailedCount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"UserRoles","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AspNetUserRole","nativeType":null,"relationName":"AspNetUserToAspNetUserRole","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"AspNetRole":{"dbName":"AspNetRoles","schema":null,"fields":[{"name":"Id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["450"]],"isGenerated":false,"isUpdatedAt":false},{"name":"Name","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["256"]],"isGenerated":false,"isUpdatedAt":false},{"name":"NormalizedName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["256"]],"isGenerated":false,"isUpdatedAt":false},{"name":"ConcurrencyStamp","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["Max"]],"isGenerated":false,"isUpdatedAt":false},{"name":"UserRoles","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AspNetUserRole","nativeType":null,"relationName":"AspNetRoleToAspNetUserRole","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"AspNetUserRole":{"dbName":"AspNetUserRoles","schema":null,"fields":[{"name":"UserId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["450"]],"isGenerated":false,"isUpdatedAt":false},{"name":"RoleId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":["NVarChar",["450"]],"isGenerated":false,"isUpdatedAt":false},{"name":"User","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AspNetUser","nativeType":null,"relationName":"AspNetUserToAspNetUserRole","relationFromFields":["UserId"],"relationToFields":["Id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"Role","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AspNetRole","nativeType":null,"relationName":"AspNetRoleToAspNetUserRole","relationFromFields":["RoleId"],"relationToFields":["Id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":{"name":null,"fields":["UserId","RoleId"]},"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{},"types":{}}');
config.engineWasm = void 0;
config.compilerWasm = void 0;
function getPrismaClientClass(dirname) {
  config.dirname = dirname;
  return runtime.getPrismaClient(config);
}
runtime.Public.validator;
runtime.Extensions.getExtensionContext;
({
  DbNull: runtime.objectEnumValues.classes.DbNull,
  JsonNull: runtime.objectEnumValues.classes.JsonNull,
  AnyNull: runtime.objectEnumValues.classes.AnyNull
});
runtime.objectEnumValues.instances.DbNull;
runtime.objectEnumValues.instances.JsonNull;
runtime.objectEnumValues.instances.AnyNull;
runtime.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable",
  Snapshot: "Snapshot"
});
runtime.Extensions.defineExtension;
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass(__dirname$1);
path.join(__dirname$1, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process$1.cwd(), "generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node");
let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production"
  }
});
async function getSession(request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}
async function commitSession(session) {
  return sessionStorage.commitSession(session);
}
async function destroySession(session) {
  return sessionStorage.destroySession(session);
}
async function getUserId(request) {
  const session = await getSession(request);
  return session.get("userId") ?? null;
}
async function getUser(request) {
  const userId = await getUserId(request);
  if (!userId) return null;
  const user = await prisma.aspNetUser.findUnique({
    where: { Id: userId },
    include: { UserRoles: { include: { Role: true } } }
  });
  if (!user) return null;
  return {
    id: user.Id,
    email: user.Email,
    userName: user.UserName,
    roles: user.UserRoles.map((ur) => ur.Role.Name).filter(Boolean)
  };
}
async function requireUser(request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}
async function requireAdmin(request) {
  const user = await requireUser(request);
  if (!user.roles.includes("Admin")) throw redirect("/");
  return user;
}
function isAdmin(user) {
  return user?.roles.includes("Admin") ?? false;
}
function verifyPasswordV3(hashedPassword, providedPassword) {
  const buffer = Buffer.from(hashedPassword, "base64");
  if (buffer.length < 13 || buffer[0] !== 1) return false;
  const prf = buffer.readUInt32BE(1);
  const iterCount = buffer.readUInt32BE(5);
  const saltLength = buffer.readUInt32BE(9);
  if (buffer.length < 13 + saltLength) return false;
  const salt = buffer.subarray(13, 13 + saltLength);
  const expectedSubkey = buffer.subarray(13 + saltLength);
  const subkeyLength = expectedSubkey.length;
  const algorithm = prf === 1 ? "sha256" : "sha512";
  const actualSubkey = crypto.pbkdf2Sync(
    providedPassword,
    salt,
    iterCount,
    subkeyLength,
    algorithm
  );
  return crypto.timingSafeEqual(expectedSubkey, actualSubkey);
}
async function verifyLogin(email, password) {
  const normalizedEmail = email.toUpperCase();
  const user = await prisma.aspNetUser.findFirst({
    where: { NormalizedEmail: normalizedEmail },
    include: { UserRoles: { include: { Role: true } } }
  });
  if (!user || !user.PasswordHash) return null;
  const isValid = verifyPasswordV3(user.PasswordHash, password);
  if (!isValid) return null;
  return {
    id: user.Id,
    email: user.Email,
    userName: user.UserName,
    roles: user.UserRoles.map((ur) => ur.Role.Name).filter(Boolean)
  };
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap"
}, {
  rel: "stylesheet",
  href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
}, {
  rel: "stylesheet",
  href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
}];
async function loader$j({
  request
}) {
  const user = await getUser(request);
  return {
    user
  };
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "es",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {}), /* @__PURE__ */ jsx("script", {
        src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
      })]
    })]
  });
}
function Navbar() {
  const data = useRouteLoaderData("root");
  const user = data?.user;
  const isAdminUser = user?.roles.includes("Admin");
  return /* @__PURE__ */ jsx("nav", {
    className: "navbar navbar-expand-sm navbar-light bg-white border-bottom shadow-sm mb-3",
    children: /* @__PURE__ */ jsxs("div", {
      className: "container",
      children: [/* @__PURE__ */ jsx(NavLink, {
        className: "navbar-brand d-flex align-items-center",
        to: "/",
        children: /* @__PURE__ */ jsx("img", {
          src: "https://almaceneslage.com/wp-content/uploads/2016/12/logo_LAGE.png",
          alt: "LAGE",
          style: {
            height: "32px",
            width: "auto",
            maxHeight: "36px"
          }
        })
      }), /* @__PURE__ */ jsx("button", {
        className: "navbar-toggler",
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": "#navbarNav",
        "aria-controls": "navbarNav",
        "aria-expanded": "false",
        "aria-label": "Alternar navegación",
        children: /* @__PURE__ */ jsx("span", {
          className: "navbar-toggler-icon"
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "collapse navbar-collapse",
        id: "navbarNav",
        children: [/* @__PURE__ */ jsxs("ul", {
          className: "navbar-nav flex-grow-1",
          children: [/* @__PURE__ */ jsx("li", {
            className: "nav-item",
            children: /* @__PURE__ */ jsx(NavLink, {
              className: "nav-link text-dark",
              to: "/",
              children: "Inicio"
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "nav-item",
            children: /* @__PURE__ */ jsx(NavLink, {
              className: "nav-link text-dark",
              to: "/catalog",
              children: "Vino"
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "nav-item",
            children: /* @__PURE__ */ jsx(NavLink, {
              className: "nav-link text-dark",
              to: "/destilados",
              children: "Destilados"
            })
          }), /* @__PURE__ */ jsx("li", {
            className: "nav-item",
            children: /* @__PURE__ */ jsx(NavLink, {
              className: "nav-link text-dark",
              to: "/cafe",
              children: "Café e Infusiones"
            })
          }), isAdminUser && /* @__PURE__ */ jsxs("li", {
            className: "nav-item dropdown",
            children: [/* @__PURE__ */ jsx("a", {
              className: "nav-link dropdown-toggle",
              href: "#",
              role: "button",
              "data-bs-toggle": "dropdown",
              "aria-expanded": "false",
              children: "Administración"
            }), /* @__PURE__ */ jsxs("ul", {
              className: "dropdown-menu",
              children: [/* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx(NavLink, {
                  className: "dropdown-item",
                  to: "/admin/products",
                  children: "Productos"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx(NavLink, {
                  className: "dropdown-item",
                  to: "/admin/categories",
                  children: "Categorías"
                })
              }), /* @__PURE__ */ jsx("li", {
                children: /* @__PURE__ */ jsx(NavLink, {
                  className: "dropdown-item",
                  to: "/admin/grape-types",
                  children: "Tipos de uva"
                })
              })]
            })]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "d-flex align-items-center",
          children: user ? /* @__PURE__ */ jsxs("form", {
            method: "post",
            action: "/logout",
            children: [/* @__PURE__ */ jsx("span", {
              className: "me-2 text-muted small",
              children: user.email
            }), /* @__PURE__ */ jsx("button", {
              type: "submit",
              className: "btn btn-outline-secondary btn-sm",
              children: "Cerrar sesión"
            })]
          }) : /* @__PURE__ */ jsx(NavLink, {
            to: "/login",
            className: "btn btn-outline-primary btn-sm",
            children: "Iniciar sesión"
          })
        })]
      })]
    })
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("header", {
      children: /* @__PURE__ */ jsx(Navbar, {})
    }), /* @__PURE__ */ jsx("div", {
      className: "container",
      children: /* @__PURE__ */ jsx("main", {
        role: "main",
        className: "pb-3",
        children: /* @__PURE__ */ jsx(Outlet, {})
      })
    }), /* @__PURE__ */ jsx("footer", {
      className: "border-top footer text-muted mt-4 py-3",
      children: /* @__PURE__ */ jsx("div", {
        className: "container",
        children: "© 2025 Álvaro Díaz para Almacenes Lage"
      })
    })]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "¡Error!";
  let details = "Ha ocurrido un error inesperado.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "No se encontró la página solicitada." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-4 p-4 container",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links,
  loader: loader$j
}, Symbol.toStringTag, { value: "Module" }));
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs("div", {
      className: "hero-section",
      children: [/* @__PURE__ */ jsx("h1", {
        children: "Almacenes Lage"
      }), /* @__PURE__ */ jsx("p", {
        children: "Distribución de bebidas — Catálogo de productos"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "row g-4",
      children: [/* @__PURE__ */ jsx("div", {
        className: "col-md-4",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/catalog",
          className: "text-decoration-none",
          children: /* @__PURE__ */ jsx("div", {
            className: "card catalog-card h-100 shadow-sm",
            children: /* @__PURE__ */ jsxs("div", {
              className: "card-body text-center py-5",
              children: [/* @__PURE__ */ jsx("i", {
                className: "bi bi-cup-fill fs-1 text-danger mb-3 d-block"
              }), /* @__PURE__ */ jsx("h3", {
                className: "card-title",
                children: "Vino"
              }), /* @__PURE__ */ jsx("p", {
                className: "card-text text-muted",
                children: "Descubre nuestra selección de vinos tintos, blancos, rosados y más."
              })]
            })
          })
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "col-md-4",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/destilados",
          className: "text-decoration-none",
          children: /* @__PURE__ */ jsx("div", {
            className: "card catalog-card h-100 shadow-sm",
            children: /* @__PURE__ */ jsxs("div", {
              className: "card-body text-center py-5",
              children: [/* @__PURE__ */ jsx("i", {
                className: "bi bi-droplet-fill fs-1 text-warning mb-3 d-block"
              }), /* @__PURE__ */ jsx("h3", {
                className: "card-title",
                children: "Destilados"
              }), /* @__PURE__ */ jsx("p", {
                className: "card-text text-muted",
                children: "Whisky, ron, ginebra, vodka, tequila y licores premium."
              })]
            })
          })
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "col-md-4",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/cafe",
          className: "text-decoration-none",
          children: /* @__PURE__ */ jsx("div", {
            className: "card catalog-card h-100 shadow-sm",
            children: /* @__PURE__ */ jsxs("div", {
              className: "card-body text-center py-5",
              children: [/* @__PURE__ */ jsx("i", {
                className: "bi bi-cup-hot-fill fs-1 text-success mb-3 d-block"
              }), /* @__PURE__ */ jsx("h3", {
                className: "card-title",
                children: "Café e Infusiones"
              }), /* @__PURE__ */ jsx("p", {
                className: "card-text text-muted",
                children: "Café de especialidad, tés e infusiones de todo el mundo."
              })]
            })
          })
        })
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home
}, Symbol.toStringTag, { value: "Module" }));
async function action$l({
  request
}) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return {
      error: "Email y contraseña son obligatorios."
    };
  }
  const user = await verifyLogin(email, password);
  if (!user) {
    return {
      error: "Email o contraseña incorrectos."
    };
  }
  const session = await getSession(request);
  session.set("userId", user.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
const login = UNSAFE_withComponentProps(function Login() {
  const actionData = useActionData();
  return /* @__PURE__ */ jsx("div", {
    className: "row justify-content-center",
    children: /* @__PURE__ */ jsxs("div", {
      className: "col-md-6 col-lg-4",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "mb-4",
        children: "Iniciar sesión"
      }), actionData?.error && /* @__PURE__ */ jsx("div", {
        className: "alert alert-danger",
        children: actionData.error
      }), /* @__PURE__ */ jsxs(Form, {
        method: "post",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "mb-3",
          children: [/* @__PURE__ */ jsx("label", {
            htmlFor: "email",
            className: "form-label",
            children: "Email"
          }), /* @__PURE__ */ jsx("input", {
            type: "email",
            id: "email",
            name: "email",
            className: "form-control",
            required: true,
            autoFocus: true
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "mb-3",
          children: [/* @__PURE__ */ jsx("label", {
            htmlFor: "password",
            className: "form-label",
            children: "Contraseña"
          }), /* @__PURE__ */ jsx("input", {
            type: "password",
            id: "password",
            name: "password",
            className: "form-control",
            required: true
          })]
        }), /* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary w-100",
          children: "Iniciar sesión"
        })]
      })]
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$l,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
async function action$k({
  request
}) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
}
function loader$i() {
  return redirect("/");
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$k,
  loader: loader$i
}, Symbol.toStringTag, { value: "Module" }));
const configs = {
  wines: {
    sortOrderFilter: [null, 1],
    matrixXField: "MatrixX",
    matrixYField: "MatrixY"
  },
  spirits: {
    sortOrderFilter: [2],
    matrixXField: "MatrixXSpirits",
    matrixYField: "MatrixYSpirits"
  },
  cafe: {
    sortOrderFilter: [3],
    matrixXField: "MatrixXCafe",
    matrixYField: "MatrixYCafe"
  }
};
function buildCategoryWhere(catalogType) {
  const config2 = configs[catalogType];
  if (catalogType === "wines") {
    return { OR: [{ SortOrder: null }, { SortOrder: 1 }] };
  }
  return { SortOrder: config2.sortOrderFilter[0] };
}
async function loadCatalogData(catalogType, filters) {
  const config2 = configs[catalogType];
  const MATRIX_COLUMNS2 = 3;
  const categoryWhere = buildCategoryWhere(catalogType);
  const categories2 = await prisma.category.findMany({
    where: categoryWhere,
    orderBy: { Name: "asc" }
  });
  const productWhere = {
    Category: categoryWhere
  };
  if (filters.query) {
    const term = filters.query.trim();
    productWhere.OR = [
      { Name: { contains: term } },
      { Description: { contains: term } },
      { Manufacturer: { contains: term } },
      { Winery: { contains: term } },
      { Origin: { contains: term } },
      { Size: { contains: term } },
      { Category: { Name: { contains: term } } },
      { GrapeType: { Name: { contains: term } } }
    ];
  }
  if (filters.categoryId) {
    productWhere.CategoryId = filters.categoryId;
  }
  if (filters.winery) {
    productWhere.Winery = filters.winery;
  }
  if (filters.origin) {
    productWhere.Origin = filters.origin;
  }
  if (filters.grapeTypeId) {
    productWhere.GrapeTypeId = filters.grapeTypeId;
  }
  const products2 = await prisma.product.findMany({
    where: productWhere,
    include: { Category: true, GrapeType: true },
    orderBy: { Name: "asc" }
  });
  const allCatalogProducts = await prisma.product.findMany({
    where: { Category: categoryWhere },
    select: { Winery: true, Origin: true }
  });
  const wineries = [...new Set(allCatalogProducts.map((p) => p.Winery).filter(Boolean))].sort();
  const origins = [...new Set(allCatalogProducts.map((p) => p.Origin).filter(Boolean))].sort();
  const grapeTypes2 = await prisma.grapeType.findMany({ orderBy: { Name: "asc" } });
  let titleRows = [];
  let emptyCellRecords = [];
  if (catalogType === "wines") {
    titleRows = await prisma.catalogTitleRow.findMany({ orderBy: { MatrixY: "asc" } });
    emptyCellRecords = await prisma.catalogEmptyCell.findMany();
  } else if (catalogType === "spirits") {
    titleRows = await prisma.catalogSpiritsTitleRow.findMany({ orderBy: { MatrixY: "asc" } });
    emptyCellRecords = await prisma.catalogSpiritsEmptyCell.findMany();
  } else {
    titleRows = await prisma.catalogCafeTitleRow.findMany({ orderBy: { MatrixY: "asc" } });
    emptyCellRecords = await prisma.catalogCafeEmptyCell.findMany();
  }
  const emptyCells = emptyCellRecords.map((e) => ({ x: e.X, y: e.Y }));
  const emptyCellSet = new Set(emptyCells.map((e) => `${e.x},${e.y}`));
  const reservedRows = new Set(titleRows.map((t) => t.MatrixY));
  const xField = config2.matrixXField;
  const yField = config2.matrixYField;
  const maxProductY = products2.reduce((max, p) => {
    const val = p[yField];
    return val != null && val > max ? val : max;
  }, -1);
  const maxTitleY = titleRows.reduce((max, t) => t.MatrixY > max ? t.MatrixY : max, -1);
  const maxEmptyY = emptyCells.reduce((max, e) => e.y > max ? e.y : max, -1);
  const matrixRows = Math.max(1, Math.max(maxProductY + 1, Math.max(maxTitleY + 1, maxEmptyY + 1)));
  const allProductsMaxY = await prisma.product.findMany({
    where: { Category: categoryWhere },
    select: { [yField]: true }
  });
  const globalMaxProductY = allProductsMaxY.reduce((max, p) => {
    const val = p[yField];
    return val != null && val > max ? val : max;
  }, -1);
  const maxAllowedRows = Math.max(1, Math.max(globalMaxProductY + 1, Math.max(maxTitleY + 1, maxEmptyY + 1)));
  const productMatrix = Array.from(
    { length: matrixRows },
    () => Array(MATRIX_COLUMNS2).fill(null)
  );
  const unpositionedProducts = [];
  for (const product of products2) {
    const px = product[xField];
    const py = product[yField];
    const validCoords = px != null && py != null && px >= 0 && px < MATRIX_COLUMNS2 && py >= 0 && py < matrixRows && !reservedRows.has(py) && !emptyCellSet.has(`${px},${py}`);
    if (validCoords && productMatrix[py][px] == null) {
      productMatrix[py][px] = product;
    } else {
      unpositionedProducts.push(product);
    }
  }
  const titleRowsWithProducts = [];
  const sortedTitles = [...titleRows].sort((a, b) => a.MatrixY - b.MatrixY);
  for (let i = 0; i < sortedTitles.length; i++) {
    const t = sortedTitles[i];
    const yStart = Math.max(t.MatrixY + 1, 0);
    const yEnd = Math.min(
      i + 1 < sortedTitles.length ? sortedTitles[i + 1].MatrixY - 1 : matrixRows - 1,
      matrixRows - 1
    );
    let hasProduct = false;
    for (let y = yStart; y <= yEnd && !hasProduct; y++) {
      for (let x = 0; x < MATRIX_COLUMNS2; x++) {
        if (productMatrix[y]?.[x] != null) {
          hasProduct = true;
          break;
        }
      }
    }
    if (hasProduct) titleRowsWithProducts.push(t.MatrixY);
  }
  const isFiltered = !!(filters.query || filters.categoryId || filters.winery || filters.origin || filters.grapeTypeId);
  return {
    products: products2,
    categories: categories2,
    wineries,
    origins,
    grapeTypes: grapeTypes2,
    titleRows,
    emptyCells,
    matrixRows,
    matrixColumns: MATRIX_COLUMNS2,
    maxAllowedRows,
    productMatrix,
    unpositionedProducts,
    titleRowsWithProducts,
    isFiltered
  };
}
function formatPrice(price) {
  if (price == null) return null;
  const num = typeof price === "object" && "toNumber" in price ? price.toNumber() : Number(price);
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(num);
}
function ProductCard({
  product,
  x,
  y,
  isAdmin: isAdmin2,
  adminMode,
  isPrintMode,
  catalogType
}) {
  const isWine = !!(product.Winery && product.Winery.trim());
  const hasPosition = catalogType === "wines" ? product.MatrixX != null && product.MatrixY != null : catalogType === "spirits" ? product.MatrixXSpirits != null && product.MatrixYSpirits != null : product.MatrixXCafe != null && product.MatrixYCafe != null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `card product-card h-100 ${adminMode ? "draggable" : ""}`,
      "data-product-id": product.Id,
      "data-x": x,
      "data-y": y,
      children: [
        adminMode && !isPrintMode && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `drag-area ${hasPosition ? "positioned" : ""}`,
              draggable: true,
              "data-product-id": product.Id,
              children: /* @__PURE__ */ jsxs("div", { className: "drag-handle", children: [
                /* @__PURE__ */ jsx("i", { className: "bi bi-hand-index-thumb fs-5" }),
                /* @__PURE__ */ jsx("small", { children: "Arrastra" })
              ] })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "position-indicator", children: `${x},${y}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `card-horizontal ${adminMode && !isPrintMode ? "non-draggable" : ""}`, children: [
          /* @__PURE__ */ jsx("div", { className: "catalog-product-image-box", children: product.ImageUrl ? /* @__PURE__ */ jsx("img", { src: product.ImageUrl, alt: product.Name, draggable: false }) : !adminMode ? /* @__PURE__ */ jsxs("div", { className: "no-image-placeholder", children: [
            /* @__PURE__ */ jsx("i", { className: "text-muted", children: "?" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted small", children: "Sin imagen" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "no-image-placeholder", children: /* @__PURE__ */ jsx("i", { className: "text-muted", children: "?" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
            /* @__PURE__ */ jsx("h5", { className: "card-title", children: product.Name }),
            /* @__PURE__ */ jsx("h6", { className: "card-subtitle mb-2 text-muted", children: (isWine ? product.Winery : product.Manufacturer) ?? "" }),
            !adminMode && /* @__PURE__ */ jsxs(Fragment, { children: [
              product.Description && /* @__PURE__ */ jsx("p", { className: "card-text", children: product.Description }),
              /* @__PURE__ */ jsxs("ul", { className: "list-unstyled small product-details", children: [
                product.Size && /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Tamaño:" }),
                  " ",
                  product.Size
                ] }),
                product.AlcoholPercent != null && /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "% Alcohol:" }),
                  " ",
                  product.AlcoholPercent,
                  "%"
                ] }),
                product.Origin && /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Origen:" }),
                  " ",
                  product.Origin
                ] }),
                product.GrapeType && /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Tipo de uva:" }),
                  " ",
                  product.GrapeType.Name
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Categoría:" }),
                  " ",
                  product.Category?.Name
                ] })
              ] })
            ] }),
            adminMode && !isPrintMode && /* @__PURE__ */ jsxs("ul", { className: "list-unstyled small text-muted mb-1", children: [
              product.Origin && /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Origen:" }),
                " ",
                product.Origin
              ] }),
              product.GrapeType && /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Tipo de uva:" }),
                " ",
                product.GrapeType.Name
              ] })
            ] }),
            product.Price != null && /* @__PURE__ */ jsx("div", { className: `product-price text-primary fw-bold ${adminMode ? "" : "fs-5"}`, children: formatPrice(product.Price) })
          ] })
        ] })
      ]
    }
  );
}
function CatalogGrid({
  data,
  catalogType,
  title,
  isAdmin: isAdmin2,
  adminMode,
  isPrintMode
}) {
  const [searchParams] = useSearchParams();
  const titleRowMap = new Map(data.titleRows.map((t) => [t.MatrixY, t]));
  const emptyCellSet = new Set(data.emptyCells.map((e) => `${e.x},${e.y}`));
  const titleRowsWithProductsSet = new Set(data.titleRowsWithProducts);
  const query = searchParams.get("Query") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const winery = searchParams.get("Winery") || "";
  const origin = searchParams.get("Origin") || "";
  const grapeTypeId = searchParams.get("GrapeTypeId") || "";
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h1", { children: title }),
    isAdmin2 && !isPrintMode && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
      adminMode ? /* @__PURE__ */ jsx("a", { href: `${catalogPath}?${new URLSearchParams(Object.fromEntries([["Query", query], ["categoryId", categoryId], ["Winery", winery], ["Origin", origin], ["GrapeTypeId", grapeTypeId]].filter(([, v]) => v)))}`, className: "btn btn-secondary", children: "Salir del modo edición" }) : /* @__PURE__ */ jsx("a", { href: `${catalogPath}?AdminMode=true&${new URLSearchParams(Object.fromEntries([["Query", query], ["categoryId", categoryId], ["Winery", winery], ["Origin", origin], ["GrapeTypeId", grapeTypeId]].filter(([, v]) => v)))}`, className: "btn btn-warning", children: "Modo edición de matriz" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `${catalogPath}?Print=true&${new URLSearchParams(Object.fromEntries([["Query", query], ["categoryId", categoryId], ["Winery", winery], ["Origin", origin], ["GrapeTypeId", grapeTypeId]].filter(([, v]) => v)))}`,
          className: "btn btn-outline-secondary ms-2",
          children: "Versión para imprimir"
        }
      )
    ] }),
    !isPrintMode && /* @__PURE__ */ jsxs(Form, { method: "get", className: "mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "row g-2 align-items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "q", className: "form-label", children: "Buscar" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "q",
              name: "Query",
              defaultValue: query,
              className: "form-control",
              placeholder: "Nombre, descripción, fabricante o bodega"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "categoryId", className: "form-label", children: "Categoría" }),
          /* @__PURE__ */ jsxs("select", { id: "categoryId", name: "categoryId", className: "form-select", defaultValue: categoryId, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Todas --" }),
            data.categories.map((c) => /* @__PURE__ */ jsx("option", { value: c.Id, children: c.Name }, c.Id))
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-md-3 d-grid", children: /* @__PURE__ */ jsx("button", { className: "btn btn-primary", type: "submit", children: "Filtrar" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "row g-2 mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "Winery", className: "form-label", children: "Bodega" }),
          /* @__PURE__ */ jsxs("select", { id: "Winery", name: "Winery", className: "form-select", defaultValue: winery, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Todas --" }),
            data.wineries.map((w) => /* @__PURE__ */ jsx("option", { value: w, children: w }, w))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "Origin", className: "form-label", children: "Denominación de Origen" }),
          /* @__PURE__ */ jsxs("select", { id: "Origin", name: "Origin", className: "form-select", defaultValue: origin, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Todas --" }),
            data.origins.map((o) => /* @__PURE__ */ jsx("option", { value: o, children: o }, o))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "GrapeTypeId", className: "form-label", children: "Tipo de uva" }),
          /* @__PURE__ */ jsxs("select", { id: "GrapeTypeId", name: "GrapeTypeId", className: "form-select", defaultValue: grapeTypeId, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Todas --" }),
            data.grapeTypes.map((g) => /* @__PURE__ */ jsx("option", { value: g.Id, children: g.Name }, g.Id))
          ] })
        ] })
      ] }),
      adminMode && /* @__PURE__ */ jsx("input", { type: "hidden", name: "AdminMode", value: "true" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `matrix-container ${isPrintMode ? "no-center" : ""} mb-4`, children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `matrix-grid ${adminMode ? "admin-mode" : "view-mode"} ${data.isFiltered ? "filtered-mode" : ""}`,
        style: { gridTemplateColumns: `repeat(${data.matrixColumns}, 1fr)` },
        children: Array.from({ length: data.matrixRows }, (_, y) => {
          const titleRow = titleRowMap.get(y);
          if (titleRow) {
            const showTitle = !data.isFiltered || titleRowsWithProductsSet.has(y);
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `matrix-title-row section-row ${showTitle ? "" : "no-products"}`,
                "data-y": y,
                "data-level": titleRow.Level,
                style: { gridColumn: `1 / span ${data.matrixColumns}`, position: "relative" },
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [
                    /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2", children: [
                      !isPrintMode && /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-outline-secondary toggle-section",
                          title: "Colapsar/expandir sección",
                          children: /* @__PURE__ */ jsx("i", { className: "bi bi-chevron-up" })
                        }
                      ),
                      titleRow.Level === 1 ? /* @__PURE__ */ jsxs("h3", { className: "m-0 title-h1", children: [
                        titleRow.Text,
                        adminMode && /* @__PURE__ */ jsxs("small", { className: "text-muted ms-2", children: [
                          "Fila ",
                          titleRow.MatrixY
                        ] })
                      ] }) : /* @__PURE__ */ jsxs("h4", { className: "m-0", children: [
                        titleRow.Text,
                        adminMode && /* @__PURE__ */ jsxs("small", { className: "text-muted ms-2", children: [
                          "Fila ",
                          titleRow.MatrixY
                        ] })
                      ] })
                    ] }),
                    adminMode && !isPrintMode && /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2", children: [
                      /* @__PURE__ */ jsx(TitleEditForm, { titleRow, catalogType }),
                      /* @__PURE__ */ jsx(DeleteTitleButton, { titleId: titleRow.Id, catalogType })
                    ] })
                  ] }),
                  adminMode && !isPrintMode && /* @__PURE__ */ jsx(DeleteRowButton, { y, catalogType })
                ]
              },
              `title-${y}`
            );
          }
          return Array.from({ length: data.matrixColumns }, (_2, x) => {
            const isEmptyReserved = emptyCellSet.has(`${x},${y}`);
            const product = data.productMatrix[y]?.[x] ?? null;
            const isEmptyCell = product == null;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `matrix-cell ${adminMode ? "editable" : ""} ${isEmptyReserved && adminMode ? "reserved-empty" : ""} ${data.isFiltered && isEmptyCell ? "empty" : ""}`,
                "data-x": x,
                "data-y": y,
                style: { position: "relative" },
                children: [
                  x === data.matrixColumns - 1 && adminMode && !isPrintMode && /* @__PURE__ */ jsx(DeleteRowButton, { y, catalogType }),
                  product ? /* @__PURE__ */ jsx(
                    ProductCard,
                    {
                      product,
                      x,
                      y,
                      isAdmin: isAdmin2,
                      adminMode,
                      isPrintMode,
                      catalogType
                    }
                  ) : adminMode && !isPrintMode ? isEmptyReserved ? /* @__PURE__ */ jsx("div", { className: "empty-cell-indicator reserved", children: `${x},${y}` }) : /* @__PURE__ */ jsx("div", { className: "empty-cell-indicator", children: `${x},${y}` }) : null
                ]
              },
              `cell-${x}-${y}`
            );
          });
        })
      }
    ) }),
    adminMode && !isPrintMode && /* @__PURE__ */ jsx(AdminControls, { data, catalogType }),
    adminMode && data.unpositionedProducts.length > 0 && !isPrintMode && /* @__PURE__ */ jsx(
      UnpositionedProducts,
      {
        products: data.unpositionedProducts,
        catalogType,
        matrixColumns: data.matrixColumns
      }
    ),
    adminMode && !isPrintMode && /* @__PURE__ */ jsx(CreateTitleForm, { catalogType }),
    adminMode && !isPrintMode && /* @__PURE__ */ jsx(
      CatalogDragDropScript,
      {
        catalogType,
        matrixRows: data.matrixRows,
        matrixColumns: data.matrixColumns,
        maxAllowedRows: data.maxAllowedRows,
        reservedRows: data.titleRows.map((t) => t.MatrixY),
        emptyCells: data.emptyCells
      }
    )
  ] });
}
function TitleEditForm({
  titleRow,
  catalogType
}) {
  return /* @__PURE__ */ jsxs(
    "form",
    {
      method: "post",
      action: `/api/catalog/${catalogType}/update-title`,
      className: "row g-1 align-items-end",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "col-auto", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "id", value: titleRow.Id }),
          /* @__PURE__ */ jsx(
            "input",
            {
              name: "text",
              className: "form-control form-control-sm",
              defaultValue: titleRow.Text,
              style: { maxWidth: "220px" }
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-auto", children: /* @__PURE__ */ jsx(
          "input",
          {
            name: "y",
            type: "number",
            min: "0",
            className: "form-control form-control-sm",
            defaultValue: titleRow.MatrixY,
            style: { width: "90px" }
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "col-auto", children: /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
          /* @__PURE__ */ jsx("input", { type: "radio", className: "btn-check", name: "level", id: `levelH1_${titleRow.Id}`, value: "1", defaultChecked: titleRow.Level === 1 }),
          /* @__PURE__ */ jsx("label", { className: "btn btn-outline-secondary btn-sm", htmlFor: `levelH1_${titleRow.Id}`, children: "h1" }),
          /* @__PURE__ */ jsx("input", { type: "radio", className: "btn-check", name: "level", id: `levelH2_${titleRow.Id}`, value: "2", defaultChecked: titleRow.Level !== 1 }),
          /* @__PURE__ */ jsx("label", { className: "btn btn-outline-secondary btn-sm", htmlFor: `levelH2_${titleRow.Id}`, children: "h2" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-auto", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-sm btn-outline-success", children: "Guardar" }) })
      ]
    }
  );
}
function DeleteTitleButton({ titleId, catalogType }) {
  return /* @__PURE__ */ jsxs(
    "form",
    {
      method: "post",
      action: `/api/catalog/${catalogType}/delete-title`,
      onSubmit: (e) => {
        if (!confirm("¿Eliminar este título?")) e.preventDefault();
      },
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "id", value: titleId }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-sm btn-outline-danger", children: "Eliminar" })
      ]
    }
  );
}
function DeleteRowButton({ y, catalogType }) {
  return /* @__PURE__ */ jsxs("form", { method: "post", action: `/api/catalog/${catalogType}/delete-row`, className: "delete-row-form", children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "y", value: y }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "btn btn-sm btn-danger delete-row-btn",
        title: "Eliminar fila",
        onClick: (e) => {
          if (!confirm("¿Eliminar esta fila? Se desplazarán hacia arriba las filas inferiores.")) e.preventDefault();
        },
        children: "✖"
      }
    )
  ] });
}
function AdminControls({ data, catalogType }) {
  return /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-end mb-4 gap-2", children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: `/api/catalog/${catalogType}/insert-row`,
        className: "d-inline-flex align-items-end gap-2 p-2 border rounded bg-light",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "d-flex flex-column", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label mb-0 small", children: "Insertar fila en posición" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                name: "y",
                type: "number",
                min: "0",
                className: "form-control form-control-sm",
                defaultValue: data.matrixRows,
                style: { width: "120px" }
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "d-grid", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-sm btn-outline-primary", children: "Añadir fila" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: `/api/catalog/${catalogType}/delete-last-empty-rows`,
        className: "d-inline-flex align-items-end gap-2 p-2 border rounded bg-light",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "d-flex flex-column", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label mb-0 small", children: "Borrar últimas filas vacías" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                name: "count",
                type: "number",
                min: "1",
                className: "form-control form-control-sm",
                defaultValue: 1,
                style: { width: "120px" }
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "d-grid", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-sm btn-outline-danger", children: "Borrar" }) })
        ]
      }
    )
  ] });
}
function UnpositionedProducts({
  products: products2,
  catalogType,
  matrixColumns
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("h5", { children: [
      "Productos sin posición asignada (",
      products2.length,
      "):"
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "unpositioned-products mb-4",
        id: "unassigned-container",
        style: { display: "grid", gridTemplateColumns: `repeat(${matrixColumns}, 1fr)`, gap: "15px" },
        children: products2.map((p) => {
          const isWine = !!(p.Winery && p.Winery.trim());
          return /* @__PURE__ */ jsxs("div", { className: "card product-card", "data-product-id": p.Id, "data-unassigned": "true", children: [
            /* @__PURE__ */ jsx("div", { className: "drag-area", draggable: true, "data-product-id": String(p.Id), children: /* @__PURE__ */ jsxs("div", { className: "drag-handle", children: [
              /* @__PURE__ */ jsx("i", { className: "bi bi-hand-index-thumb fs-5" }),
              /* @__PURE__ */ jsx("small", { children: "Arrastra" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "card-horizontal non-draggable", children: [
              /* @__PURE__ */ jsx("div", { className: "catalog-product-image-box small", children: p.ImageUrl ? /* @__PURE__ */ jsx("img", { src: p.ImageUrl, alt: p.Name, draggable: false }) : /* @__PURE__ */ jsx("div", { className: "no-image-placeholder", children: /* @__PURE__ */ jsx("i", { className: "text-muted", children: "?" }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
                /* @__PURE__ */ jsx("h6", { className: "card-title", children: p.Name }),
                /* @__PURE__ */ jsx("small", { className: "card-subtitle mb-2 text-muted", children: (isWine ? p.Winery : p.Manufacturer) ?? "" }),
                /* @__PURE__ */ jsxs("ul", { className: "list-unstyled small text-muted mb-1", children: [
                  p.Origin && /* @__PURE__ */ jsxs("li", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Origen:" }),
                    " ",
                    p.Origin
                  ] }),
                  p.GrapeType && /* @__PURE__ */ jsxs("li", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Tipo de uva:" }),
                    " ",
                    p.GrapeType.Name
                  ] })
                ] }),
                p.Price != null && /* @__PURE__ */ jsx("div", { className: "product-price text-primary fw-bold", children: formatPrice(p.Price) })
              ] })
            ] })
          ] }, p.Id);
        })
      }
    )
  ] });
}
function CreateTitleForm({ catalogType }) {
  return /* @__PURE__ */ jsx("div", { className: "card mb-4", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h6", { children: "Crear título de sección" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: `/api/catalog/${catalogType}/create-title`,
        className: "row g-2 align-items-end",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: "Texto" }),
            /* @__PURE__ */ jsx("input", { name: "text", className: "form-control form-control-sm", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: "Fila (Y)" }),
            /* @__PURE__ */ jsx("input", { name: "y", type: "number", min: "0", className: "form-control form-control-sm", defaultValue: "0" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: "Nivel" }),
            /* @__PURE__ */ jsxs("select", { name: "level", className: "form-select form-select-sm", defaultValue: "2", children: [
              /* @__PURE__ */ jsx("option", { value: "1", children: "h1" }),
              /* @__PURE__ */ jsx("option", { value: "2", children: "h2" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-auto", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-sm btn-primary", children: "Crear título" }) })
        ]
      }
    )
  ] }) });
}
function CatalogDragDropScript({
  catalogType,
  matrixRows,
  matrixColumns,
  maxAllowedRows,
  reservedRows,
  emptyCells
}) {
  const scriptContent = `
    (function(){
      const catalogType = ${JSON.stringify(catalogType)};
      const matrixRows = ${matrixRows};
      const matrixColumns = ${matrixColumns};
      const allowedRows = ${maxAllowedRows};
      const reservedRows = new Set(${JSON.stringify(reservedRows)});
      const emptyReserved = new Set(${JSON.stringify(emptyCells.map((e) => e.x + ":" + e.y))});

      const dropCells = [...document.querySelectorAll('.matrix-cell.editable')].filter(c =>
        !reservedRows.has(parseInt(c.dataset.y)) && parseInt(c.dataset.y) < allowedRows
      );
      let autoScrollInterval = null;
      const scrollEdgeSize = 60;
      const scrollSpeed = 12;

      // Section collapse
      const sectionRows = [...document.querySelectorAll('.matrix-title-row.section-row')].sort((a,b) => parseInt(a.dataset.y) - parseInt(b.dataset.y));
      const allMatrixCells = [...document.querySelectorAll('.matrix-cell')];
      const storageKey = 'matrix-collapse:' + location.pathname;
      let collapsedSet = new Set();
      try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) collapsedSet = new Set(saved.map(v => parseInt(v,10)).filter(v => !Number.isNaN(v))); } catch {}

      function getSectionRange(row) {
        const yStart = parseInt(row.dataset.y);
        const level = parseInt(row.dataset.level || '2');
        if (level === 1) {
          const nextH1 = sectionRows.find(r => parseInt(r.dataset.y) > yStart && parseInt(r.dataset.level || '2') === 1);
          return { yStart, yEnd: nextH1 ? parseInt(nextH1.dataset.y) - 1 : matrixRows - 1 };
        }
        const idx = sectionRows.indexOf(row);
        const next = idx >= 0 && idx + 1 < sectionRows.length ? sectionRows[idx + 1] : null;
        return { yStart, yEnd: next ? parseInt(next.dataset.y) - 1 : matrixRows - 1 };
      }

      function setSectionCollapsed(row, collapsed) {
        const icon = row.querySelector('.toggle-section i');
        if (icon) { icon.classList.toggle('bi-chevron-up', !collapsed); icon.classList.toggle('bi-chevron-down', collapsed); }
        const { yStart, yEnd } = getSectionRange(row);
        allMatrixCells.forEach(c => {
          const y = parseInt(c.dataset.y);
          if (!Number.isNaN(y) && y > yStart && y <= yEnd) c.classList.toggle('hidden-by-section', collapsed);
        });
        if (parseInt(row.dataset.level || '2') === 1) {
          sectionRows.forEach(sr => {
            const y = parseInt(sr.dataset.y);
            if (y > yStart && y <= yEnd) {
              const icon = sr.querySelector('.toggle-section i');
              if (icon) { icon.classList.toggle('bi-chevron-down', collapsed); icon.classList.toggle('bi-chevron-up', !collapsed); }
              sr.classList.toggle('section-collapsed', collapsed);
            }
          });
        }
      }

      sectionRows.forEach(row => {
        const y = parseInt(row.dataset.y);
        if (collapsedSet.has(y)) { row.classList.add('section-collapsed'); setSectionCollapsed(row, true); }
      });

      document.querySelectorAll('.toggle-section').forEach(btn => {
        btn.addEventListener('click', function() {
          const row = this.closest('.section-row');
          const collapsed = row.classList.toggle('section-collapsed');
          setSectionCollapsed(row, collapsed);
          const y = parseInt(row.dataset.y);
          if (!Number.isNaN(y)) {
            if (collapsed) collapsedSet.add(y); else collapsedSet.delete(y);
            try { localStorage.setItem(storageKey, JSON.stringify([...collapsedSet])); } catch {}
          }
        });
      });

      // Drag & drop
      document.querySelectorAll('.drag-area').forEach(dragArea => {
        const productCard = dragArea.closest('.card');
        const productId = dragArea.dataset.productId || productCard?.dataset.productId;
        if (!productId) return;

        dragArea.addEventListener('dragstart', function(e) {
          e.stopPropagation();
          this.classList.add('dragging');
          productCard?.classList.add('being-dragged');
          e.dataTransfer.setData('text/plain', productId);
          e.dataTransfer.effectAllowed = 'move';
        });
        dragArea.addEventListener('dragend', function() {
          this.classList.remove('dragging');
          productCard?.classList.remove('being-dragged');
          dropCells.forEach(c => c.classList.remove('drag-over'));
          stopAutoScroll();
        });
      });

      dropCells.forEach(cell => {
        cell.addEventListener('dragover', function(e) {
          const y = parseInt(this.dataset.y);
          if (y >= allowedRows) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          this.classList.add('drag-over');
          handleAutoScroll(e.clientY);
        });
        cell.addEventListener('dragleave', function(e) {
          if (!this.contains(e.relatedTarget)) this.classList.remove('drag-over');
        });
        cell.addEventListener('drop', function(e) {
          e.preventDefault();
          this.classList.remove('drag-over');
          stopAutoScroll();
          const productId = e.dataTransfer.getData('text/plain');
          const x = parseInt(this.dataset.x);
          const y = parseInt(this.dataset.y);
          if (x >= 0 && x < matrixColumns && y >= 0 && y < matrixRows && y < allowedRows && !reservedRows.has(y)) {
            updateProductPosition(productId, x, y);
          }
        });
      });

      function handleAutoScroll(mouseY) {
        const vh = window.innerHeight;
        if (vh - mouseY < scrollEdgeSize) {
          if (!autoScrollInterval) autoScrollInterval = setInterval(() => window.scrollBy({ top: scrollSpeed, behavior: 'auto' }), 16);
        } else if (mouseY < scrollEdgeSize) {
          if (!autoScrollInterval) autoScrollInterval = setInterval(() => window.scrollBy({ top: -scrollSpeed, behavior: 'auto' }), 16);
        } else { stopAutoScroll(); }
      }
      function stopAutoScroll() { if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; } }

      // Context menu for vaciar celda
      document.addEventListener('contextmenu', function(e) {
        const card = e.target.closest('.product-card');
        const isUnassigned = card && card.dataset.unassigned === 'true';
        if (card && card.dataset.productId) {
          e.preventDefault();
          if (isUnassigned) {
            const productId = card.dataset.productId;
            const x = prompt('Columna (X):', '0');
            const y = prompt('Fila (Y):', '0');
            if (x !== null && y !== null) placeUnassigned(productId, parseInt(x), parseInt(y));
            return;
          }
          if (confirm('¿Reservar esta celda como vacía?')) {
            const productId = card.dataset.productId;
            const x = card.dataset.x || card.parentElement?.dataset.x;
            const y = card.dataset.y || card.parentElement?.dataset.y;
            vaciarCelda(productId, x, y);
          }
        }
      });

      async function updateProductPosition(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/update-position', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al actualizar posición'); }
      }

      async function vaciarCelda(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/vaciar-celda', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al reservar celda'); }
      }

      async function placeUnassigned(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/place-unassigned', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al asignar posición'); }
      }
    })();
  `;
  return /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: scriptContent } });
}
async function loader$h({
  request
}) {
  const url = new URL(request.url);
  const user = await getUser(request);
  const adminMode = url.searchParams.get("AdminMode") === "true" && isAdmin(user);
  const isPrintMode = url.searchParams.get("Print") === "true" && isAdmin(user);
  const data = await loadCatalogData("wines", {
    query: url.searchParams.get("Query") || void 0,
    categoryId: url.searchParams.get("categoryId") ? Number(url.searchParams.get("categoryId")) : void 0,
    winery: url.searchParams.get("Winery") || void 0,
    origin: url.searchParams.get("Origin") || void 0,
    grapeTypeId: url.searchParams.get("GrapeTypeId") ? Number(url.searchParams.get("GrapeTypeId")) : void 0
  });
  return {
    ...data,
    isAdminUser: isAdmin(user),
    adminMode,
    isPrintMode
  };
}
const catalog = UNSAFE_withComponentProps(function CatalogPage() {
  const data = useLoaderData();
  return /* @__PURE__ */ jsx(CatalogGrid, {
    data,
    catalogType: "wines",
    title: "Catálogo de Vinos",
    isAdmin: data.isAdminUser,
    adminMode: data.adminMode,
    isPrintMode: data.isPrintMode
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: catalog,
  loader: loader$h
}, Symbol.toStringTag, { value: "Module" }));
async function loader$g({
  request
}) {
  const url = new URL(request.url);
  const user = await getUser(request);
  const adminMode = url.searchParams.get("AdminMode") === "true" && isAdmin(user);
  const isPrintMode = url.searchParams.get("Print") === "true" && isAdmin(user);
  const data = await loadCatalogData("spirits", {
    query: url.searchParams.get("Query") || void 0,
    categoryId: url.searchParams.get("categoryId") ? Number(url.searchParams.get("categoryId")) : void 0,
    winery: url.searchParams.get("Winery") || void 0,
    origin: url.searchParams.get("Origin") || void 0,
    grapeTypeId: url.searchParams.get("GrapeTypeId") ? Number(url.searchParams.get("GrapeTypeId")) : void 0
  });
  return {
    ...data,
    isAdminUser: isAdmin(user),
    adminMode,
    isPrintMode
  };
}
const destilados = UNSAFE_withComponentProps(function DestiladosPage() {
  const data = useLoaderData();
  return /* @__PURE__ */ jsx(CatalogGrid, {
    data,
    catalogType: "spirits",
    title: "Catálogo de Destilados",
    isAdmin: data.isAdminUser,
    adminMode: data.adminMode,
    isPrintMode: data.isPrintMode
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: destilados,
  loader: loader$g
}, Symbol.toStringTag, { value: "Module" }));
async function loader$f({
  request
}) {
  const url = new URL(request.url);
  const user = await getUser(request);
  const adminMode = url.searchParams.get("AdminMode") === "true" && isAdmin(user);
  const isPrintMode = url.searchParams.get("Print") === "true" && isAdmin(user);
  const data = await loadCatalogData("cafe", {
    query: url.searchParams.get("Query") || void 0,
    categoryId: url.searchParams.get("categoryId") ? Number(url.searchParams.get("categoryId")) : void 0,
    winery: url.searchParams.get("Winery") || void 0,
    origin: url.searchParams.get("Origin") || void 0,
    grapeTypeId: url.searchParams.get("GrapeTypeId") ? Number(url.searchParams.get("GrapeTypeId")) : void 0
  });
  return {
    ...data,
    isAdminUser: isAdmin(user),
    adminMode,
    isPrintMode
  };
}
const cafe = UNSAFE_withComponentProps(function CafePage() {
  const data = useLoaderData();
  return /* @__PURE__ */ jsx(CatalogGrid, {
    data,
    catalogType: "cafe",
    title: "Café e Infusiones",
    isAdmin: data.isAdminUser,
    adminMode: data.adminMode,
    isPrintMode: data.isPrintMode
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cafe,
  loader: loader$f
}, Symbol.toStringTag, { value: "Module" }));
async function loader$e() {
  const categories2 = await prisma.category.findMany({
    orderBy: {
      Name: "asc"
    },
    select: {
      Id: true,
      Name: true
    }
  });
  return categories2.map((c) => ({
    id: c.Id,
    name: c.Name
  }));
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$e
}, Symbol.toStringTag, { value: "Module" }));
async function loader$d() {
  const grapes = await prisma.grapeType.findMany({
    orderBy: {
      Name: "asc"
    },
    select: {
      Id: true,
      Name: true
    }
  });
  return grapes.map((g) => ({
    id: g.Id,
    name: g.Name
  }));
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$d
}, Symbol.toStringTag, { value: "Module" }));
async function loader$c({
  params
}) {
  const id = Number(params.id);
  if (isNaN(id)) return new Response("Id inválido", {
    status: 400
  });
  const p = await prisma.product.findUnique({
    where: {
      Id: id
    }
  });
  if (!p) return new Response("Not found", {
    status: 404
  });
  return {
    id: p.Id,
    name: p.Name,
    categoryId: p.CategoryId,
    winery: p.Winery,
    manufacturer: p.Manufacturer,
    grapeTypeId: p.GrapeTypeId,
    price: p.Price ? Number(p.Price) : null,
    alcoholPercent: p.AlcoholPercent,
    size: p.Size,
    origin: p.Origin,
    imageUrl: p.ImageUrl,
    description: p.Description
  };
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
async function action$j({
  request
}) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = Number(form.get("Id"));
  if (isNaN(id)) return new Response("Id inválido", {
    status: 400
  });
  const p = await prisma.product.findUnique({
    where: {
      Id: id
    }
  });
  if (!p) return new Response("Not found", {
    status: 404
  });
  const priceStr = String(form.get("Price") || "");
  const alcStr = String(form.get("AlcoholPercent") || "");
  const grapeId = form.get("GrapeTypeId") ? Number(form.get("GrapeTypeId")) : null;
  let price = null;
  if (priceStr) {
    const normalized = priceStr.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) price = parsed;
  }
  let alcoholPercent = null;
  if (alcStr) {
    const normalized = alcStr.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) alcoholPercent = parsed;
  }
  await prisma.product.update({
    where: {
      Id: id
    },
    data: {
      Name: String(form.get("Name") || ""),
      CategoryId: Number(form.get("CategoryId")) || p.CategoryId,
      Winery: String(form.get("Winery") || ""),
      Manufacturer: String(form.get("Manufacturer") || ""),
      GrapeTypeId: grapeId || null,
      Price: price,
      AlcoholPercent: alcoholPercent,
      Size: String(form.get("Size") || ""),
      Origin: String(form.get("Origin") || ""),
      ImageUrl: String(form.get("ImageUrl") || ""),
      Description: String(form.get("Description") || "")
    }
  });
  return {
    success: true
  };
}
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$j
}, Symbol.toStringTag, { value: "Module" }));
async function action$i({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const productId = Number(form.get("productId"));
  const x = Number(form.get("x"));
  const y = Number(form.get("y"));
  const product = await prisma.product.findUnique({
    where: {
      Id: productId
    },
    include: {
      Category: true
    }
  });
  if (!product) return new Response("Not found", {
    status: 404
  });
  if (catalogType === "wines") {
    const existing = await prisma.product.findFirst({
      where: {
        MatrixX: x,
        MatrixY: y,
        Id: {
          not: productId
        },
        Category: {
          OR: [{
            SortOrder: null
          }, {
            SortOrder: 1
          }]
        }
      }
    });
    if (existing) {
      await prisma.product.update({
        where: {
          Id: existing.Id
        },
        data: {
          MatrixX: product.MatrixX,
          MatrixY: product.MatrixY
        }
      });
    }
    await prisma.catalogEmptyCell.deleteMany({
      where: {
        X: x,
        Y: y
      }
    });
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixX: x,
        MatrixY: y
      }
    });
  } else if (catalogType === "spirits") {
    const existing = await prisma.product.findFirst({
      where: {
        MatrixXSpirits: x,
        MatrixYSpirits: y,
        Id: {
          not: productId
        },
        Category: {
          SortOrder: 2
        }
      }
    });
    if (existing) {
      await prisma.product.update({
        where: {
          Id: existing.Id
        },
        data: {
          MatrixXSpirits: product.MatrixXSpirits,
          MatrixYSpirits: product.MatrixYSpirits
        }
      });
    }
    await prisma.catalogSpiritsEmptyCell.deleteMany({
      where: {
        X: x,
        Y: y
      }
    });
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixXSpirits: x,
        MatrixYSpirits: y
      }
    });
  } else {
    const existing = await prisma.product.findFirst({
      where: {
        MatrixXCafe: x,
        MatrixYCafe: y,
        Id: {
          not: productId
        },
        Category: {
          SortOrder: 3
        }
      }
    });
    if (existing) {
      await prisma.product.update({
        where: {
          Id: existing.Id
        },
        data: {
          MatrixXCafe: product.MatrixXCafe,
          MatrixYCafe: product.MatrixYCafe
        }
      });
    }
    await prisma.catalogCafeEmptyCell.deleteMany({
      where: {
        X: x,
        Y: y
      }
    });
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixXCafe: x,
        MatrixYCafe: y
      }
    });
  }
  return {
    success: true
  };
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$i
}, Symbol.toStringTag, { value: "Module" }));
async function action$h({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const productId = Number(form.get("productId"));
  const x = Number(form.get("x"));
  const y = Number(form.get("y"));
  if (catalogType === "wines") {
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixX: null,
        MatrixY: null
      }
    });
    const exists = await prisma.catalogEmptyCell.findFirst({
      where: {
        X: x,
        Y: y
      }
    });
    if (!exists) await prisma.catalogEmptyCell.create({
      data: {
        X: x,
        Y: y
      }
    });
  } else if (catalogType === "spirits") {
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixXSpirits: null,
        MatrixYSpirits: null
      }
    });
    const exists = await prisma.catalogSpiritsEmptyCell.findFirst({
      where: {
        X: x,
        Y: y
      }
    });
    if (!exists) await prisma.catalogSpiritsEmptyCell.create({
      data: {
        X: x,
        Y: y
      }
    });
  } else {
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixXCafe: null,
        MatrixYCafe: null
      }
    });
    const exists = await prisma.catalogCafeEmptyCell.findFirst({
      where: {
        X: x,
        Y: y
      }
    });
    if (!exists) await prisma.catalogCafeEmptyCell.create({
      data: {
        X: x,
        Y: y
      }
    });
  }
  return {
    success: true
  };
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$h
}, Symbol.toStringTag, { value: "Module" }));
async function action$g({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const text = String(form.get("text") || "").trim();
  const y = Math.max(0, Number(form.get("y")) || 0);
  let level = Number(form.get("level")) || 2;
  if (level !== 1 && level !== 2) level = 2;
  if (!text) return new Response("El título es obligatorio", {
    status: 400
  });
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  if (catalogType === "wines") {
    const exists = await prisma.catalogTitleRow.findFirst({
      where: {
        MatrixY: y
      }
    });
    if (exists) return new Response("Ya existe un título en esa fila", {
      status: 400
    });
    await prisma.catalogTitleRow.create({
      data: {
        Text: text,
        MatrixY: y,
        Level: level
      }
    });
  } else if (catalogType === "spirits") {
    const exists = await prisma.catalogSpiritsTitleRow.findFirst({
      where: {
        MatrixY: y
      }
    });
    if (exists) return new Response("Ya existe un título en esa fila", {
      status: 400
    });
    await prisma.catalogSpiritsTitleRow.create({
      data: {
        Text: text,
        MatrixY: y,
        Level: level
      }
    });
  } else {
    const exists = await prisma.catalogCafeTitleRow.findFirst({
      where: {
        MatrixY: y
      }
    });
    if (exists) return new Response("Ya existe un título en esa fila", {
      status: 400
    });
    await prisma.catalogCafeTitleRow.create({
      data: {
        Text: text,
        MatrixY: y,
        Level: level
      }
    });
  }
  return redirect(`${catalogPath}?AdminMode=true`);
}
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$g
}, Symbol.toStringTag, { value: "Module" }));
async function action$f({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const id = Number(form.get("id"));
  const text = String(form.get("text") || "").trim();
  const y = Math.max(0, Number(form.get("y")) || 0);
  let level = Number(form.get("level")) || 2;
  if (level !== 1 && level !== 2) level = 2;
  if (!text) return new Response("El título es obligatorio", {
    status: 400
  });
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  if (catalogType === "wines") {
    const title = await prisma.catalogTitleRow.findUnique({
      where: {
        Id: id
      }
    });
    if (!title) return new Response("Not found", {
      status: 404
    });
    if (y !== title.MatrixY) {
      const exists = await prisma.catalogTitleRow.findFirst({
        where: {
          MatrixY: y,
          Id: {
            not: id
          }
        }
      });
      if (exists) return new Response("Ya existe un título en la fila destino", {
        status: 400
      });
    }
    await prisma.catalogTitleRow.update({
      where: {
        Id: id
      },
      data: {
        Text: text,
        MatrixY: y,
        Level: level
      }
    });
  } else if (catalogType === "spirits") {
    const title = await prisma.catalogSpiritsTitleRow.findUnique({
      where: {
        Id: id
      }
    });
    if (!title) return new Response("Not found", {
      status: 404
    });
    if (y !== title.MatrixY) {
      const exists = await prisma.catalogSpiritsTitleRow.findFirst({
        where: {
          MatrixY: y,
          Id: {
            not: id
          }
        }
      });
      if (exists) return new Response("Ya existe un título en la fila destino", {
        status: 400
      });
    }
    await prisma.catalogSpiritsTitleRow.update({
      where: {
        Id: id
      },
      data: {
        Text: text,
        MatrixY: y,
        Level: level
      }
    });
  } else {
    const title = await prisma.catalogCafeTitleRow.findUnique({
      where: {
        Id: id
      }
    });
    if (!title) return new Response("Not found", {
      status: 404
    });
    if (y !== title.MatrixY) {
      const exists = await prisma.catalogCafeTitleRow.findFirst({
        where: {
          MatrixY: y,
          Id: {
            not: id
          }
        }
      });
      if (exists) return new Response("Ya existe un título en la fila destino", {
        status: 400
      });
    }
    await prisma.catalogCafeTitleRow.update({
      where: {
        Id: id
      },
      data: {
        Text: text,
        MatrixY: y,
        Level: level
      }
    });
  }
  return redirect(`${catalogPath}?AdminMode=true`);
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$f
}, Symbol.toStringTag, { value: "Module" }));
async function action$e({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const id = Number(form.get("id"));
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  if (catalogType === "wines") {
    await prisma.catalogTitleRow.delete({
      where: {
        Id: id
      }
    }).catch(() => {
    });
  } else if (catalogType === "spirits") {
    await prisma.catalogSpiritsTitleRow.delete({
      where: {
        Id: id
      }
    }).catch(() => {
    });
  } else {
    await prisma.catalogCafeTitleRow.delete({
      where: {
        Id: id
      }
    }).catch(() => {
    });
  }
  return redirect(`${catalogPath}?AdminMode=true`);
}
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$e
}, Symbol.toStringTag, { value: "Module" }));
const MATRIX_COLUMNS = 3;
async function action$d({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const y = Math.max(0, Number(form.get("y")) || 0);
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  if (catalogType === "wines") {
    const newRowY = y + 1;
    const productsToShift = await prisma.product.findMany({
      where: {
        MatrixY: {
          gte: newRowY
        },
        Category: {
          OR: [{
            SortOrder: null
          }, {
            SortOrder: 1
          }]
        }
      }
    });
    for (const p of productsToShift) {
      await prisma.product.update({
        where: {
          Id: p.Id
        },
        data: {
          MatrixY: (p.MatrixY ?? 0) + 1
        }
      });
    }
    const titlesToShift = await prisma.catalogTitleRow.findMany({
      where: {
        MatrixY: {
          gte: newRowY
        }
      }
    });
    for (const t of titlesToShift) {
      await prisma.catalogTitleRow.update({
        where: {
          Id: t.Id
        },
        data: {
          MatrixY: t.MatrixY + 1
        }
      });
    }
    const emptiesToShift = await prisma.catalogEmptyCell.findMany({
      where: {
        Y: {
          gte: newRowY
        }
      }
    });
    for (const e of emptiesToShift) {
      await prisma.catalogEmptyCell.update({
        where: {
          Id: e.Id
        },
        data: {
          Y: e.Y + 1
        }
      });
    }
    for (let x = 0; x < MATRIX_COLUMNS; x++) {
      const exists = await prisma.catalogEmptyCell.findFirst({
        where: {
          X: x,
          Y: newRowY
        }
      });
      if (!exists) await prisma.catalogEmptyCell.create({
        data: {
          X: x,
          Y: newRowY
        }
      });
    }
  } else if (catalogType === "spirits") {
    const newRowY = y + 1;
    const productsToShift = await prisma.product.findMany({
      where: {
        MatrixYSpirits: {
          gte: newRowY
        },
        Category: {
          SortOrder: 2
        }
      }
    });
    for (const p of productsToShift) {
      await prisma.product.update({
        where: {
          Id: p.Id
        },
        data: {
          MatrixYSpirits: (p.MatrixYSpirits ?? 0) + 1
        }
      });
    }
    const titlesToShift = await prisma.catalogSpiritsTitleRow.findMany({
      where: {
        MatrixY: {
          gte: newRowY
        }
      }
    });
    for (const t of titlesToShift) {
      await prisma.catalogSpiritsTitleRow.update({
        where: {
          Id: t.Id
        },
        data: {
          MatrixY: t.MatrixY + 1
        }
      });
    }
    const emptiesToShift = await prisma.catalogSpiritsEmptyCell.findMany({
      where: {
        Y: {
          gte: newRowY
        }
      }
    });
    for (const e of emptiesToShift) {
      await prisma.catalogSpiritsEmptyCell.update({
        where: {
          Id: e.Id
        },
        data: {
          Y: e.Y + 1
        }
      });
    }
    for (let x = 0; x < MATRIX_COLUMNS; x++) {
      const exists = await prisma.catalogSpiritsEmptyCell.findFirst({
        where: {
          X: x,
          Y: newRowY
        }
      });
      if (!exists) await prisma.catalogSpiritsEmptyCell.create({
        data: {
          X: x,
          Y: newRowY
        }
      });
    }
  } else {
    const newRowY = y + 1;
    const productsToShift = await prisma.product.findMany({
      where: {
        MatrixYCafe: {
          gte: newRowY
        },
        Category: {
          SortOrder: 3
        }
      }
    });
    for (const p of productsToShift) {
      await prisma.product.update({
        where: {
          Id: p.Id
        },
        data: {
          MatrixYCafe: (p.MatrixYCafe ?? 0) + 1
        }
      });
    }
    const titlesToShift = await prisma.catalogCafeTitleRow.findMany({
      where: {
        MatrixY: {
          gte: newRowY
        }
      }
    });
    for (const t of titlesToShift) {
      await prisma.catalogCafeTitleRow.update({
        where: {
          Id: t.Id
        },
        data: {
          MatrixY: t.MatrixY + 1
        }
      });
    }
    const emptiesToShift = await prisma.catalogCafeEmptyCell.findMany({
      where: {
        Y: {
          gte: newRowY
        }
      }
    });
    for (const e of emptiesToShift) {
      await prisma.catalogCafeEmptyCell.update({
        where: {
          Id: e.Id
        },
        data: {
          Y: e.Y + 1
        }
      });
    }
    for (let x = 0; x < MATRIX_COLUMNS; x++) {
      const exists = await prisma.catalogCafeEmptyCell.findFirst({
        where: {
          X: x,
          Y: newRowY
        }
      });
      if (!exists) await prisma.catalogCafeEmptyCell.create({
        data: {
          X: x,
          Y: newRowY
        }
      });
    }
  }
  return redirect(`${catalogPath}?AdminMode=true`);
}
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$d
}, Symbol.toStringTag, { value: "Module" }));
async function action$c({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const y = Math.max(0, Number(form.get("y")) || 0);
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  if (catalogType === "wines") {
    await prisma.product.updateMany({
      where: {
        MatrixY: y,
        Category: {
          OR: [{
            SortOrder: null
          }, {
            SortOrder: 1
          }]
        }
      },
      data: {
        MatrixX: null,
        MatrixY: null
      }
    });
    await prisma.catalogTitleRow.deleteMany({
      where: {
        MatrixY: y
      }
    });
    await prisma.catalogEmptyCell.deleteMany({
      where: {
        Y: y
      }
    });
    const productsBelow = await prisma.product.findMany({
      where: {
        MatrixY: {
          gt: y
        },
        Category: {
          OR: [{
            SortOrder: null
          }, {
            SortOrder: 1
          }]
        }
      }
    });
    for (const p of productsBelow) {
      await prisma.product.update({
        where: {
          Id: p.Id
        },
        data: {
          MatrixY: (p.MatrixY ?? 0) - 1
        }
      });
    }
    const titlesBelow = await prisma.catalogTitleRow.findMany({
      where: {
        MatrixY: {
          gt: y
        }
      }
    });
    for (const t of titlesBelow) {
      await prisma.catalogTitleRow.update({
        where: {
          Id: t.Id
        },
        data: {
          MatrixY: t.MatrixY - 1
        }
      });
    }
    const emptiesBelow = await prisma.catalogEmptyCell.findMany({
      where: {
        Y: {
          gt: y
        }
      }
    });
    for (const e of emptiesBelow) {
      await prisma.catalogEmptyCell.update({
        where: {
          Id: e.Id
        },
        data: {
          Y: e.Y - 1
        }
      });
    }
  } else if (catalogType === "spirits") {
    await prisma.product.updateMany({
      where: {
        MatrixYSpirits: y,
        Category: {
          SortOrder: 2
        }
      },
      data: {
        MatrixXSpirits: null,
        MatrixYSpirits: null
      }
    });
    await prisma.catalogSpiritsTitleRow.deleteMany({
      where: {
        MatrixY: y
      }
    });
    await prisma.catalogSpiritsEmptyCell.deleteMany({
      where: {
        Y: y
      }
    });
    const productsBelow = await prisma.product.findMany({
      where: {
        MatrixYSpirits: {
          gt: y
        },
        Category: {
          SortOrder: 2
        }
      }
    });
    for (const p of productsBelow) {
      await prisma.product.update({
        where: {
          Id: p.Id
        },
        data: {
          MatrixYSpirits: (p.MatrixYSpirits ?? 0) - 1
        }
      });
    }
    const titlesBelow = await prisma.catalogSpiritsTitleRow.findMany({
      where: {
        MatrixY: {
          gt: y
        }
      }
    });
    for (const t of titlesBelow) {
      await prisma.catalogSpiritsTitleRow.update({
        where: {
          Id: t.Id
        },
        data: {
          MatrixY: t.MatrixY - 1
        }
      });
    }
    const emptiesBelow = await prisma.catalogSpiritsEmptyCell.findMany({
      where: {
        Y: {
          gt: y
        }
      }
    });
    for (const e of emptiesBelow) {
      await prisma.catalogSpiritsEmptyCell.update({
        where: {
          Id: e.Id
        },
        data: {
          Y: e.Y - 1
        }
      });
    }
  } else {
    await prisma.product.updateMany({
      where: {
        MatrixYCafe: y,
        Category: {
          SortOrder: 3
        }
      },
      data: {
        MatrixXCafe: null,
        MatrixYCafe: null
      }
    });
    await prisma.catalogCafeTitleRow.deleteMany({
      where: {
        MatrixY: y
      }
    });
    await prisma.catalogCafeEmptyCell.deleteMany({
      where: {
        Y: y
      }
    });
    const productsBelow = await prisma.product.findMany({
      where: {
        MatrixYCafe: {
          gt: y
        },
        Category: {
          SortOrder: 3
        }
      }
    });
    for (const p of productsBelow) {
      await prisma.product.update({
        where: {
          Id: p.Id
        },
        data: {
          MatrixYCafe: (p.MatrixYCafe ?? 0) - 1
        }
      });
    }
    const titlesBelow = await prisma.catalogCafeTitleRow.findMany({
      where: {
        MatrixY: {
          gt: y
        }
      }
    });
    for (const t of titlesBelow) {
      await prisma.catalogCafeTitleRow.update({
        where: {
          Id: t.Id
        },
        data: {
          MatrixY: t.MatrixY - 1
        }
      });
    }
    const emptiesBelow = await prisma.catalogCafeEmptyCell.findMany({
      where: {
        Y: {
          gt: y
        }
      }
    });
    for (const e of emptiesBelow) {
      await prisma.catalogCafeEmptyCell.update({
        where: {
          Id: e.Id
        },
        data: {
          Y: e.Y - 1
        }
      });
    }
  }
  return redirect(`${catalogPath}?AdminMode=true`);
}
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$c
}, Symbol.toStringTag, { value: "Module" }));
async function action$b({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const count = Math.max(0, Number(form.get("count")) || 0);
  const catalogPath = catalogType === "wines" ? "/catalog" : catalogType === "spirits" ? "/destilados" : "/cafe";
  if (count <= 0) return redirect(`${catalogPath}?AdminMode=true`);
  if (catalogType === "wines") {
    let deleted = 0;
    const maxY = Math.max((await prisma.product.aggregate({
      where: {
        Category: {
          OR: [{
            SortOrder: null
          }, {
            SortOrder: 1
          }]
        }
      },
      _max: {
        MatrixY: true
      }
    }))._max.MatrixY ?? -1, (await prisma.catalogTitleRow.aggregate({
      _max: {
        MatrixY: true
      }
    }))._max.MatrixY ?? -1, (await prisma.catalogEmptyCell.aggregate({
      _max: {
        Y: true
      }
    }))._max.Y ?? -1);
    let y = maxY;
    while (deleted < count && y >= 0) {
      const hasProduct = await prisma.product.findFirst({
        where: {
          MatrixY: y,
          Category: {
            OR: [{
              SortOrder: null
            }, {
              SortOrder: 1
            }]
          }
        }
      });
      const hasTitle = await prisma.catalogTitleRow.findFirst({
        where: {
          MatrixY: y
        }
      });
      if (hasProduct || hasTitle) break;
      const empties = await prisma.catalogEmptyCell.findMany({
        where: {
          Y: y
        }
      });
      if (empties.length === 0) {
        y--;
        continue;
      }
      await prisma.catalogEmptyCell.deleteMany({
        where: {
          Y: y
        }
      });
      deleted++;
      y--;
    }
  } else if (catalogType === "spirits") {
    let deleted = 0;
    const maxY = Math.max((await prisma.product.aggregate({
      where: {
        Category: {
          SortOrder: 2
        }
      },
      _max: {
        MatrixYSpirits: true
      }
    }))._max.MatrixYSpirits ?? -1, (await prisma.catalogSpiritsTitleRow.aggregate({
      _max: {
        MatrixY: true
      }
    }))._max.MatrixY ?? -1, (await prisma.catalogSpiritsEmptyCell.aggregate({
      _max: {
        Y: true
      }
    }))._max.Y ?? -1);
    let y = maxY;
    while (deleted < count && y >= 0) {
      const hasProduct = await prisma.product.findFirst({
        where: {
          MatrixYSpirits: y,
          Category: {
            SortOrder: 2
          }
        }
      });
      const hasTitle = await prisma.catalogSpiritsTitleRow.findFirst({
        where: {
          MatrixY: y
        }
      });
      if (hasProduct || hasTitle) break;
      const empties = await prisma.catalogSpiritsEmptyCell.findMany({
        where: {
          Y: y
        }
      });
      if (empties.length === 0) {
        y--;
        continue;
      }
      await prisma.catalogSpiritsEmptyCell.deleteMany({
        where: {
          Y: y
        }
      });
      deleted++;
      y--;
    }
  } else {
    let deleted = 0;
    const maxY = Math.max((await prisma.product.aggregate({
      where: {
        Category: {
          SortOrder: 3
        }
      },
      _max: {
        MatrixYCafe: true
      }
    }))._max.MatrixYCafe ?? -1, (await prisma.catalogCafeTitleRow.aggregate({
      _max: {
        MatrixY: true
      }
    }))._max.MatrixY ?? -1, (await prisma.catalogCafeEmptyCell.aggregate({
      _max: {
        Y: true
      }
    }))._max.Y ?? -1);
    let y = maxY;
    while (deleted < count && y >= 0) {
      const hasProduct = await prisma.product.findFirst({
        where: {
          MatrixYCafe: y,
          Category: {
            SortOrder: 3
          }
        }
      });
      const hasTitle = await prisma.catalogCafeTitleRow.findFirst({
        where: {
          MatrixY: y
        }
      });
      if (hasProduct || hasTitle) break;
      const empties = await prisma.catalogCafeEmptyCell.findMany({
        where: {
          Y: y
        }
      });
      if (empties.length === 0) {
        y--;
        continue;
      }
      await prisma.catalogCafeEmptyCell.deleteMany({
        where: {
          Y: y
        }
      });
      deleted++;
      y--;
    }
  }
  return redirect(`${catalogPath}?AdminMode=true`);
}
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$b
}, Symbol.toStringTag, { value: "Module" }));
async function action$a({
  request,
  params
}) {
  await requireAdmin(request);
  const catalogType = params.catalogType;
  const form = await request.formData();
  const productId = Number(form.get("productId"));
  const x = Number(form.get("x"));
  const y = Number(form.get("y"));
  if (catalogType === "wines") {
    const occupied = await prisma.product.findFirst({
      where: {
        MatrixX: x,
        MatrixY: y,
        Category: {
          OR: [{
            SortOrder: null
          }, {
            SortOrder: 1
          }]
        }
      }
    });
    if (occupied) return new Response("La celda ya está ocupada", {
      status: 400
    });
    await prisma.catalogEmptyCell.deleteMany({
      where: {
        X: x,
        Y: y
      }
    });
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixX: x,
        MatrixY: y
      }
    });
  } else if (catalogType === "spirits") {
    const occupied = await prisma.product.findFirst({
      where: {
        MatrixXSpirits: x,
        MatrixYSpirits: y,
        Category: {
          SortOrder: 2
        }
      }
    });
    if (occupied) return new Response("La celda ya está ocupada", {
      status: 400
    });
    await prisma.catalogSpiritsEmptyCell.deleteMany({
      where: {
        X: x,
        Y: y
      }
    });
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixXSpirits: x,
        MatrixYSpirits: y
      }
    });
  } else {
    const occupied = await prisma.product.findFirst({
      where: {
        MatrixXCafe: x,
        MatrixYCafe: y,
        Category: {
          SortOrder: 3
        }
      }
    });
    if (occupied) return new Response("La celda ya está ocupada", {
      status: 400
    });
    await prisma.catalogCafeEmptyCell.deleteMany({
      where: {
        X: x,
        Y: y
      }
    });
    await prisma.product.update({
      where: {
        Id: productId
      },
      data: {
        MatrixXCafe: x,
        MatrixYCafe: y
      }
    });
  }
  return {
    success: true
  };
}
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$a
}, Symbol.toStringTag, { value: "Module" }));
async function loader$b({
  request
}) {
  await requireAdmin(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const categoryFilterId = url.searchParams.get("CategoryFilterId") || "";
  const where = {};
  if (q) {
    where.OR = [{
      Name: {
        contains: q
      }
    }, {
      Manufacturer: {
        contains: q
      }
    }, {
      Winery: {
        contains: q
      }
    }];
  }
  if (categoryFilterId) {
    where.CategoryId = parseInt(categoryFilterId, 10);
  }
  const products2 = await prisma.product.findMany({
    where,
    include: {
      Category: true
    },
    orderBy: {
      Name: "asc"
    }
  });
  const categories2 = await prisma.category.findMany({
    orderBy: [{
      SortOrder: "asc"
    }, {
      Name: "asc"
    }]
  });
  return {
    products: products2,
    categories: categories2,
    q,
    categoryFilterId
  };
}
async function action$9({
  request
}) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "BulkChangeCategory") {
    const selectedIds = formData.getAll("selectedProducts").map((id) => parseInt(String(id), 10));
    const newCategoryId = parseInt(String(formData.get("newCategoryId")), 10);
    if (selectedIds.length > 0 && newCategoryId) {
      await prisma.product.updateMany({
        where: {
          Id: {
            in: selectedIds
          }
        },
        data: {
          CategoryId: newCategoryId
        }
      });
    }
    return {
      success: true,
      message: `${selectedIds.length} producto(s) actualizados.`
    };
  }
  if (intent === "BulkAssignMaker") {
    const selectedIds = formData.getAll("selectedProducts").map((id) => parseInt(String(id), 10));
    const makerType = String(formData.get("makerType"));
    const makerValue = String(formData.get("makerValue") || "");
    if (selectedIds.length > 0 && makerValue) {
      const data = {};
      if (makerType === "Winery") {
        data.Winery = makerValue;
      } else {
        data.Manufacturer = makerValue;
      }
      await prisma.product.updateMany({
        where: {
          Id: {
            in: selectedIds
          }
        },
        data
      });
    }
    return {
      success: true,
      message: `${selectedIds.length} producto(s) actualizados.`
    };
  }
  return {
    success: false,
    message: "Acción no reconocida."
  };
}
const products = UNSAFE_withComponentProps(function AdminProducts() {
  const {
    products: products2,
    categories: categories2,
    q,
    categoryFilterId
  } = useLoaderData();
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMakerModal, setShowMakerModal] = useState(false);
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedIds.length > 0 && selectedIds.length < products2.length;
    }
  }, [selectedIds, products2.length]);
  function handleSelectAll(checked) {
    setSelectedIds(checked ? products2.map((p) => p.Id) : []);
  }
  function handleSelectOne(id, checked) {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  }
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Productos"
    }), actionData?.message && /* @__PURE__ */ jsx("div", {
      className: `alert ${actionData.success ? "alert-success" : "alert-danger"}`,
      children: actionData.message
    }), /* @__PURE__ */ jsx("div", {
      className: "d-flex justify-content-between align-items-center mb-3",
      children: /* @__PURE__ */ jsxs(Link, {
        to: "/admin/products/create",
        className: "btn btn-primary",
        children: [/* @__PURE__ */ jsx("i", {
          className: "bi bi-plus-lg"
        }), " Crear Producto"]
      })
    }), /* @__PURE__ */ jsxs(Form, {
      method: "get",
      className: "row g-2 mb-3",
      children: [/* @__PURE__ */ jsx("div", {
        className: "col-auto",
        children: /* @__PURE__ */ jsx("input", {
          type: "text",
          name: "q",
          className: "form-control",
          placeholder: "Buscar...",
          defaultValue: q
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "col-auto",
        children: /* @__PURE__ */ jsxs("select", {
          name: "CategoryFilterId",
          className: "form-select",
          defaultValue: categoryFilterId,
          children: [/* @__PURE__ */ jsx("option", {
            value: "",
            children: "Todas las categorías"
          }), categories2.map((cat) => /* @__PURE__ */ jsx("option", {
            value: cat.Id,
            children: cat.Name
          }, cat.Id))]
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "col-auto",
        children: /* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-outline-secondary",
          children: "Filtrar"
        })
      }), (q || categoryFilterId) && /* @__PURE__ */ jsx("div", {
        className: "col-auto",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/admin/products",
          className: "btn btn-outline-danger",
          children: "Limpiar"
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-3",
      children: [/* @__PURE__ */ jsxs("button", {
        type: "button",
        className: "btn btn-outline-primary btn-sm me-2",
        disabled: selectedIds.length === 0,
        onClick: () => setShowCategoryModal(true),
        children: ["Cambiar Categoría (", selectedIds.length, ")"]
      }), /* @__PURE__ */ jsxs("button", {
        type: "button",
        className: "btn btn-outline-primary btn-sm",
        disabled: selectedIds.length === 0,
        onClick: () => setShowMakerModal(true),
        children: ["Asignar Fabricante/Bodega (", selectedIds.length, ")"]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "table-responsive",
      children: /* @__PURE__ */ jsxs("table", {
        className: "table table-striped table-hover",
        children: [/* @__PURE__ */ jsx("thead", {
          children: /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("th", {
              children: /* @__PURE__ */ jsx("input", {
                type: "checkbox",
                ref: selectAllRef,
                checked: selectedIds.length === products2.length && products2.length > 0,
                onChange: (e) => handleSelectAll(e.target.checked)
              })
            }), /* @__PURE__ */ jsx("th", {
              children: "Nombre"
            }), /* @__PURE__ */ jsx("th", {
              children: "Fabricante / Bodega"
            }), /* @__PURE__ */ jsx("th", {
              children: "Categoría"
            }), /* @__PURE__ */ jsx("th", {
              children: "Precio"
            }), /* @__PURE__ */ jsx("th", {
              children: "Acciones"
            })]
          })
        }), /* @__PURE__ */ jsxs("tbody", {
          children: [products2.map((product) => /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("td", {
              children: /* @__PURE__ */ jsx("input", {
                type: "checkbox",
                checked: selectedIds.includes(product.Id),
                onChange: (e) => handleSelectOne(product.Id, e.target.checked)
              })
            }), /* @__PURE__ */ jsx("td", {
              children: product.Name
            }), /* @__PURE__ */ jsx("td", {
              children: product.Manufacturer || product.Winery || "—"
            }), /* @__PURE__ */ jsx("td", {
              children: product.Category.Name
            }), /* @__PURE__ */ jsx("td", {
              children: product.Price != null ? `$${product.Price}` : "—"
            }), /* @__PURE__ */ jsxs("td", {
              children: [/* @__PURE__ */ jsx(Link, {
                to: `/admin/products/${product.Id}/edit`,
                className: "btn btn-sm btn-outline-secondary me-1",
                children: "Editar"
              }), /* @__PURE__ */ jsx(Link, {
                to: `/admin/products/${product.Id}/delete`,
                className: "btn btn-sm btn-outline-danger",
                children: "Eliminar"
              })]
            })]
          }, product.Id)), products2.length === 0 && /* @__PURE__ */ jsx("tr", {
            children: /* @__PURE__ */ jsx("td", {
              colSpan: 6,
              className: "text-center text-muted",
              children: "No se encontraron productos."
            })
          })]
        })]
      })
    }), /* @__PURE__ */ jsxs("p", {
      className: "text-muted",
      children: ["Total: ", products2.length, " producto(s)"]
    }), showCategoryModal && /* @__PURE__ */ jsx("div", {
      className: "modal d-block",
      tabIndex: -1,
      style: {
        backgroundColor: "rgba(0,0,0,0.5)"
      },
      children: /* @__PURE__ */ jsx("div", {
        className: "modal-dialog",
        children: /* @__PURE__ */ jsx("div", {
          className: "modal-content",
          children: /* @__PURE__ */ jsxs(Form, {
            method: "post",
            onSubmit: () => setShowCategoryModal(false),
            children: [/* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "intent",
              value: "BulkChangeCategory"
            }), selectedIds.map((id) => /* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "selectedProducts",
              value: id
            }, id)), /* @__PURE__ */ jsxs("div", {
              className: "modal-header",
              children: [/* @__PURE__ */ jsx("h5", {
                className: "modal-title",
                children: "Cambiar Categoría"
              }), /* @__PURE__ */ jsx("button", {
                type: "button",
                className: "btn-close",
                onClick: () => setShowCategoryModal(false)
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "modal-body",
              children: [/* @__PURE__ */ jsxs("p", {
                children: [selectedIds.length, " producto(s) seleccionado(s)"]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mb-3",
                children: [/* @__PURE__ */ jsx("label", {
                  htmlFor: "newCategoryId",
                  className: "form-label",
                  children: "Nueva Categoría"
                }), /* @__PURE__ */ jsxs("select", {
                  name: "newCategoryId",
                  id: "newCategoryId",
                  className: "form-select",
                  required: true,
                  children: [/* @__PURE__ */ jsx("option", {
                    value: "",
                    children: "Seleccionar..."
                  }), categories2.map((cat) => /* @__PURE__ */ jsx("option", {
                    value: cat.Id,
                    children: cat.Name
                  }, cat.Id))]
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "modal-footer",
              children: [/* @__PURE__ */ jsx("button", {
                type: "button",
                className: "btn btn-secondary",
                onClick: () => setShowCategoryModal(false),
                children: "Cancelar"
              }), /* @__PURE__ */ jsx("button", {
                type: "submit",
                className: "btn btn-primary",
                children: "Aplicar"
              })]
            })]
          })
        })
      })
    }), showMakerModal && /* @__PURE__ */ jsx("div", {
      className: "modal d-block",
      tabIndex: -1,
      style: {
        backgroundColor: "rgba(0,0,0,0.5)"
      },
      children: /* @__PURE__ */ jsx("div", {
        className: "modal-dialog",
        children: /* @__PURE__ */ jsx("div", {
          className: "modal-content",
          children: /* @__PURE__ */ jsxs(Form, {
            method: "post",
            onSubmit: () => setShowMakerModal(false),
            children: [/* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "intent",
              value: "BulkAssignMaker"
            }), selectedIds.map((id) => /* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "selectedProducts",
              value: id
            }, id)), /* @__PURE__ */ jsxs("div", {
              className: "modal-header",
              children: [/* @__PURE__ */ jsx("h5", {
                className: "modal-title",
                children: "Asignar Fabricante / Bodega"
              }), /* @__PURE__ */ jsx("button", {
                type: "button",
                className: "btn-close",
                onClick: () => setShowMakerModal(false)
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "modal-body",
              children: [/* @__PURE__ */ jsxs("p", {
                children: [selectedIds.length, " producto(s) seleccionado(s)"]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mb-3",
                children: [/* @__PURE__ */ jsx("label", {
                  htmlFor: "makerType",
                  className: "form-label",
                  children: "Tipo"
                }), /* @__PURE__ */ jsxs("select", {
                  name: "makerType",
                  id: "makerType",
                  className: "form-select",
                  required: true,
                  children: [/* @__PURE__ */ jsx("option", {
                    value: "Winery",
                    children: "Bodega"
                  }), /* @__PURE__ */ jsx("option", {
                    value: "Manufacturer",
                    children: "Fabricante"
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "mb-3",
                children: [/* @__PURE__ */ jsx("label", {
                  htmlFor: "makerValue",
                  className: "form-label",
                  children: "Valor"
                }), /* @__PURE__ */ jsx("input", {
                  type: "text",
                  name: "makerValue",
                  id: "makerValue",
                  className: "form-control",
                  required: true
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "modal-footer",
              children: [/* @__PURE__ */ jsx("button", {
                type: "button",
                className: "btn btn-secondary",
                onClick: () => setShowMakerModal(false),
                children: "Cancelar"
              }), /* @__PURE__ */ jsx("button", {
                type: "submit",
                className: "btn btn-primary",
                children: "Aplicar"
              })]
            })]
          })
        })
      })
    })]
  });
});
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$9,
  default: products,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
async function loader$a({
  request
}) {
  await requireAdmin(request);
  const categories2 = await prisma.category.findMany({
    orderBy: [{
      SortOrder: "asc"
    }, {
      Name: "asc"
    }]
  });
  const grapeTypes2 = await prisma.grapeType.findMany({
    orderBy: {
      Name: "asc"
    }
  });
  return {
    categories: categories2,
    grapeTypes: grapeTypes2
  };
}
async function action$8({
  request
}) {
  await requireAdmin(request);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();
  if (!name) {
    return {
      error: "El nombre es obligatorio."
    };
  }
  const categoryId = parseInt(String(formData.get("CategoryId")), 10);
  if (!categoryId) {
    return {
      error: "La categoría es obligatoria."
    };
  }
  const priceStr = String(formData.get("Price") || "");
  const alcoholStr = String(formData.get("AlcoholPercent") || "");
  const grapeTypeIdStr = String(formData.get("GrapeTypeId") || "");
  let price = null;
  if (priceStr) {
    const parsed = parseFloat(priceStr.replace(",", "."));
    if (!isNaN(parsed)) price = parsed;
  }
  let alcoholPercent = null;
  if (alcoholStr) {
    const parsed = parseFloat(alcoholStr.replace(",", "."));
    if (!isNaN(parsed)) alcoholPercent = parsed;
  }
  await prisma.product.create({
    data: {
      Name: name,
      Manufacturer: String(formData.get("Manufacturer") || "") || null,
      Winery: String(formData.get("Winery") || "") || null,
      Price: price,
      Description: String(formData.get("Description") || "") || null,
      ImageUrl: String(formData.get("ImageUrl") || "") || null,
      Size: String(formData.get("Size") || "") || null,
      AlcoholPercent: alcoholPercent,
      Origin: String(formData.get("Origin") || "") || null,
      CategoryId: categoryId,
      GrapeTypeId: grapeTypeIdStr ? parseInt(grapeTypeIdStr, 10) : null
    }
  });
  return redirect("/admin/products");
}
const products_create = UNSAFE_withComponentProps(function ProductCreate() {
  const {
    categories: categories2,
    grapeTypes: grapeTypes2
  } = useLoaderData();
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Crear Producto"
    }), actionData?.error && /* @__PURE__ */ jsx("div", {
      className: "alert alert-danger",
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "row",
        children: /* @__PURE__ */ jsxs("div", {
          className: "col-md-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Name",
              className: "form-label",
              children: "Nombre *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Name",
              name: "Name",
              className: "form-control",
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "row",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Manufacturer",
                className: "form-label",
                children: "Fabricante"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                id: "Manufacturer",
                name: "Manufacturer",
                className: "form-control"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Winery",
                className: "form-label",
                children: "Bodega"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                id: "Winery",
                name: "Winery",
                className: "form-control"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "row",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "col-md-4 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Price",
                className: "form-label",
                children: "Precio"
              }), /* @__PURE__ */ jsx("input", {
                type: "number",
                id: "Price",
                name: "Price",
                className: "form-control",
                step: "0.01",
                min: "0"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-4 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Size",
                className: "form-label",
                children: "Tamaño"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                id: "Size",
                name: "Size",
                className: "form-control"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-4 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "AlcoholPercent",
                className: "form-label",
                children: "% Alcohol"
              }), /* @__PURE__ */ jsx("input", {
                type: "number",
                id: "AlcoholPercent",
                name: "AlcoholPercent",
                className: "form-control",
                step: "0.1",
                min: "0"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Origin",
              className: "form-label",
              children: "Origen"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Origin",
              name: "Origin",
              className: "form-control"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Description",
              className: "form-label",
              children: "Descripción"
            }), /* @__PURE__ */ jsx("textarea", {
              id: "Description",
              name: "Description",
              className: "form-control",
              rows: 3
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "ImageUrl",
              className: "form-label",
              children: "URL de Imagen"
            }), /* @__PURE__ */ jsx("input", {
              type: "url",
              id: "ImageUrl",
              name: "ImageUrl",
              className: "form-control"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "row",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "CategoryId",
                className: "form-label",
                children: "Categoría *"
              }), /* @__PURE__ */ jsxs("select", {
                id: "CategoryId",
                name: "CategoryId",
                className: "form-select",
                required: true,
                children: [/* @__PURE__ */ jsx("option", {
                  value: "",
                  children: "Seleccionar..."
                }), categories2.map((cat) => /* @__PURE__ */ jsx("option", {
                  value: cat.Id,
                  children: cat.Name
                }, cat.Id))]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "GrapeTypeId",
                className: "form-label",
                children: "Tipo de Uva"
              }), /* @__PURE__ */ jsxs("select", {
                id: "GrapeTypeId",
                name: "GrapeTypeId",
                className: "form-select",
                children: [/* @__PURE__ */ jsx("option", {
                  value: "",
                  children: "Ninguno"
                }), grapeTypes2.map((gt) => /* @__PURE__ */ jsx("option", {
                  value: gt.Id,
                  children: gt.Name
                }, gt.Id))]
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3",
        children: [/* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary me-2",
          children: "Crear"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/admin/products",
          className: "btn btn-secondary",
          children: "Cancelar"
        })]
      })]
    })]
  });
});
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$8,
  default: products_create,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
async function loader$9({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const product = await prisma.product.findUnique({
    where: {
      Id: id
    }
  });
  if (!product) throw new Response("Producto no encontrado", {
    status: 404
  });
  const categories2 = await prisma.category.findMany({
    orderBy: [{
      SortOrder: "asc"
    }, {
      Name: "asc"
    }]
  });
  const grapeTypes2 = await prisma.grapeType.findMany({
    orderBy: {
      Name: "asc"
    }
  });
  return {
    product,
    categories: categories2,
    grapeTypes: grapeTypes2
  };
}
async function action$7({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();
  if (!name) {
    return {
      error: "El nombre es obligatorio."
    };
  }
  const categoryId = parseInt(String(formData.get("CategoryId")), 10);
  if (!categoryId) {
    return {
      error: "La categoría es obligatoria."
    };
  }
  const priceStr = String(formData.get("Price") || "");
  const alcoholStr = String(formData.get("AlcoholPercent") || "");
  const grapeTypeIdStr = String(formData.get("GrapeTypeId") || "");
  let price = null;
  if (priceStr) {
    const parsed = parseFloat(priceStr.replace(",", "."));
    if (!isNaN(parsed)) price = parsed;
  }
  let alcoholPercent = null;
  if (alcoholStr) {
    const parsed = parseFloat(alcoholStr.replace(",", "."));
    if (!isNaN(parsed)) alcoholPercent = parsed;
  }
  await prisma.product.update({
    where: {
      Id: id
    },
    data: {
      Name: name,
      Manufacturer: String(formData.get("Manufacturer") || "") || null,
      Winery: String(formData.get("Winery") || "") || null,
      Price: price,
      Description: String(formData.get("Description") || "") || null,
      ImageUrl: String(formData.get("ImageUrl") || "") || null,
      Size: String(formData.get("Size") || "") || null,
      AlcoholPercent: alcoholPercent,
      Origin: String(formData.get("Origin") || "") || null,
      CategoryId: categoryId,
      GrapeTypeId: grapeTypeIdStr ? parseInt(grapeTypeIdStr, 10) : null
    }
  });
  return redirect("/admin/products");
}
const products_edit = UNSAFE_withComponentProps(function ProductEdit() {
  const {
    product,
    categories: categories2,
    grapeTypes: grapeTypes2
  } = useLoaderData();
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Editar Producto"
    }), actionData?.error && /* @__PURE__ */ jsx("div", {
      className: "alert alert-danger",
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "row",
        children: /* @__PURE__ */ jsxs("div", {
          className: "col-md-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Name",
              className: "form-label",
              children: "Nombre *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Name",
              name: "Name",
              className: "form-control",
              defaultValue: product.Name,
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "row",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Manufacturer",
                className: "form-label",
                children: "Fabricante"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                id: "Manufacturer",
                name: "Manufacturer",
                className: "form-control",
                defaultValue: product.Manufacturer ?? ""
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Winery",
                className: "form-label",
                children: "Bodega"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                id: "Winery",
                name: "Winery",
                className: "form-control",
                defaultValue: product.Winery ?? ""
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "row",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "col-md-4 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Price",
                className: "form-label",
                children: "Precio"
              }), /* @__PURE__ */ jsx("input", {
                type: "number",
                id: "Price",
                name: "Price",
                className: "form-control",
                step: "0.01",
                min: "0",
                defaultValue: product.Price != null ? String(product.Price) : ""
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-4 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "Size",
                className: "form-label",
                children: "Tamaño"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                id: "Size",
                name: "Size",
                className: "form-control",
                defaultValue: product.Size ?? ""
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-4 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "AlcoholPercent",
                className: "form-label",
                children: "% Alcohol"
              }), /* @__PURE__ */ jsx("input", {
                type: "number",
                id: "AlcoholPercent",
                name: "AlcoholPercent",
                className: "form-control",
                step: "0.1",
                min: "0",
                defaultValue: product.AlcoholPercent != null ? String(product.AlcoholPercent) : ""
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Origin",
              className: "form-label",
              children: "Origen"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Origin",
              name: "Origin",
              className: "form-control",
              defaultValue: product.Origin ?? ""
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Description",
              className: "form-label",
              children: "Descripción"
            }), /* @__PURE__ */ jsx("textarea", {
              id: "Description",
              name: "Description",
              className: "form-control",
              rows: 3,
              defaultValue: product.Description ?? ""
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "ImageUrl",
              className: "form-label",
              children: "URL de Imagen"
            }), /* @__PURE__ */ jsx("input", {
              type: "url",
              id: "ImageUrl",
              name: "ImageUrl",
              className: "form-control",
              defaultValue: product.ImageUrl ?? ""
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "row",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "CategoryId",
                className: "form-label",
                children: "Categoría *"
              }), /* @__PURE__ */ jsxs("select", {
                id: "CategoryId",
                name: "CategoryId",
                className: "form-select",
                defaultValue: product.CategoryId,
                required: true,
                children: [/* @__PURE__ */ jsx("option", {
                  value: "",
                  children: "Seleccionar..."
                }), categories2.map((cat) => /* @__PURE__ */ jsx("option", {
                  value: cat.Id,
                  children: cat.Name
                }, cat.Id))]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "col-md-6 mb-3",
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "GrapeTypeId",
                className: "form-label",
                children: "Tipo de Uva"
              }), /* @__PURE__ */ jsxs("select", {
                id: "GrapeTypeId",
                name: "GrapeTypeId",
                className: "form-select",
                defaultValue: product.GrapeTypeId ?? "",
                children: [/* @__PURE__ */ jsx("option", {
                  value: "",
                  children: "Ninguno"
                }), grapeTypes2.map((gt) => /* @__PURE__ */ jsx("option", {
                  value: gt.Id,
                  children: gt.Name
                }, gt.Id))]
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3",
        children: [/* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary me-2",
          children: "Guardar"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/admin/products",
          className: "btn btn-secondary",
          children: "Cancelar"
        })]
      })]
    })]
  });
});
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$7,
  default: products_edit,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
async function loader$8({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const product = await prisma.product.findUnique({
    where: {
      Id: id
    },
    include: {
      Category: true
    }
  });
  if (!product) throw new Response("Producto no encontrado", {
    status: 404
  });
  return {
    product
  };
}
async function action$6({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  await prisma.product.delete({
    where: {
      Id: id
    }
  });
  return redirect("/admin/products");
}
const products_delete = UNSAFE_withComponentProps(function ProductDelete() {
  const {
    product
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Eliminar Producto"
    }), /* @__PURE__ */ jsxs("div", {
      className: "alert alert-warning",
      children: [/* @__PURE__ */ jsx("h5", {
        children: "¿Está seguro que desea eliminar este producto?"
      }), /* @__PURE__ */ jsxs("p", {
        className: "mb-0",
        children: [/* @__PURE__ */ jsx("strong", {
          children: product.Name
        }), " — ", product.Category.Name]
      })]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("button", {
        type: "submit",
        className: "btn btn-danger me-2",
        children: "Eliminar"
      }), /* @__PURE__ */ jsx(Link, {
        to: "/admin/products",
        className: "btn btn-secondary",
        children: "Cancelar"
      })]
    })]
  });
});
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  default: products_delete,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
async function loader$7({
  request
}) {
  await requireAdmin(request);
  const categories2 = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          Products: true
        }
      }
    },
    orderBy: [{
      SortOrder: "asc"
    }, {
      Name: "asc"
    }]
  });
  return {
    categories: categories2
  };
}
const categories = UNSAFE_withComponentProps(function AdminCategories() {
  const {
    categories: categories2
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Categorías"
    }), /* @__PURE__ */ jsx("div", {
      className: "mb-3",
      children: /* @__PURE__ */ jsxs(Link, {
        to: "/admin/categories/create",
        className: "btn btn-primary",
        children: [/* @__PURE__ */ jsx("i", {
          className: "bi bi-plus-lg"
        }), " Crear Categoría"]
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "table-responsive",
      children: /* @__PURE__ */ jsxs("table", {
        className: "table table-striped table-hover",
        children: [/* @__PURE__ */ jsx("thead", {
          children: /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("th", {
              children: "Nombre"
            }), /* @__PURE__ */ jsx("th", {
              children: "Orden"
            }), /* @__PURE__ */ jsx("th", {
              children: "Productos"
            }), /* @__PURE__ */ jsx("th", {
              children: "Acciones"
            })]
          })
        }), /* @__PURE__ */ jsxs("tbody", {
          children: [categories2.map((cat) => /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("td", {
              children: cat.Name
            }), /* @__PURE__ */ jsx("td", {
              children: cat.SortOrder ?? "—"
            }), /* @__PURE__ */ jsx("td", {
              children: cat._count.Products
            }), /* @__PURE__ */ jsxs("td", {
              children: [/* @__PURE__ */ jsx(Link, {
                to: `/admin/categories/${cat.Id}/edit`,
                className: "btn btn-sm btn-outline-secondary me-1",
                children: "Editar"
              }), /* @__PURE__ */ jsx(Link, {
                to: `/admin/categories/${cat.Id}/delete`,
                className: "btn btn-sm btn-outline-danger",
                children: "Eliminar"
              })]
            })]
          }, cat.Id)), categories2.length === 0 && /* @__PURE__ */ jsx("tr", {
            children: /* @__PURE__ */ jsx("td", {
              colSpan: 4,
              className: "text-center text-muted",
              children: "No hay categorías."
            })
          })]
        })]
      })
    })]
  });
});
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: categories,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
async function loader$6({
  request
}) {
  await requireAdmin(request);
  return {};
}
async function action$5({
  request
}) {
  await requireAdmin(request);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();
  if (!name) {
    return {
      error: "El nombre es obligatorio."
    };
  }
  const sortOrderStr = String(formData.get("SortOrder") || "");
  await prisma.category.create({
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null,
      SortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : null
    }
  });
  return redirect("/admin/categories");
}
const categories_create = UNSAFE_withComponentProps(function CategoryCreate() {
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Crear Categoría"
    }), actionData?.error && /* @__PURE__ */ jsx("div", {
      className: "alert alert-danger",
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "row",
        children: /* @__PURE__ */ jsxs("div", {
          className: "col-md-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Name",
              className: "form-label",
              children: "Nombre *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Name",
              name: "Name",
              className: "form-control",
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Description",
              className: "form-label",
              children: "Descripción"
            }), /* @__PURE__ */ jsx("textarea", {
              id: "Description",
              name: "Description",
              className: "form-control",
              rows: 3
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "SortOrder",
              className: "form-label",
              children: "Orden"
            }), /* @__PURE__ */ jsxs("select", {
              id: "SortOrder",
              name: "SortOrder",
              className: "form-select",
              children: [/* @__PURE__ */ jsx("option", {
                value: "",
                children: "Sin orden"
              }), /* @__PURE__ */ jsx("option", {
                value: "1",
                children: "1 — Vinos"
              }), /* @__PURE__ */ jsx("option", {
                value: "2",
                children: "2 — Destilados"
              }), /* @__PURE__ */ jsx("option", {
                value: "3",
                children: "3 — Café"
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3",
        children: [/* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary me-2",
          children: "Crear"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/admin/categories",
          className: "btn btn-secondary",
          children: "Cancelar"
        })]
      })]
    })]
  });
});
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: categories_create,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
async function loader$5({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const category = await prisma.category.findUnique({
    where: {
      Id: id
    }
  });
  if (!category) throw new Response("Categoría no encontrada", {
    status: 404
  });
  return {
    category
  };
}
async function action$4({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();
  if (!name) {
    return {
      error: "El nombre es obligatorio."
    };
  }
  const sortOrderStr = String(formData.get("SortOrder") || "");
  await prisma.category.update({
    where: {
      Id: id
    },
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null,
      SortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : null
    }
  });
  return redirect("/admin/categories");
}
const categories_edit = UNSAFE_withComponentProps(function CategoryEdit() {
  const {
    category
  } = useLoaderData();
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Editar Categoría"
    }), actionData?.error && /* @__PURE__ */ jsx("div", {
      className: "alert alert-danger",
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "row",
        children: /* @__PURE__ */ jsxs("div", {
          className: "col-md-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Name",
              className: "form-label",
              children: "Nombre *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Name",
              name: "Name",
              className: "form-control",
              defaultValue: category.Name,
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Description",
              className: "form-label",
              children: "Descripción"
            }), /* @__PURE__ */ jsx("textarea", {
              id: "Description",
              name: "Description",
              className: "form-control",
              rows: 3,
              defaultValue: category.Description ?? ""
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "SortOrder",
              className: "form-label",
              children: "Orden"
            }), /* @__PURE__ */ jsxs("select", {
              id: "SortOrder",
              name: "SortOrder",
              className: "form-select",
              defaultValue: category.SortOrder ?? "",
              children: [/* @__PURE__ */ jsx("option", {
                value: "",
                children: "Sin orden"
              }), /* @__PURE__ */ jsx("option", {
                value: "1",
                children: "1 — Vinos"
              }), /* @__PURE__ */ jsx("option", {
                value: "2",
                children: "2 — Destilados"
              }), /* @__PURE__ */ jsx("option", {
                value: "3",
                children: "3 — Café"
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3",
        children: [/* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary me-2",
          children: "Guardar"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/admin/categories",
          className: "btn btn-secondary",
          children: "Cancelar"
        })]
      })]
    })]
  });
});
const route26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: categories_edit,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
async function loader$4({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const category = await prisma.category.findUnique({
    where: {
      Id: id
    },
    include: {
      _count: {
        select: {
          Products: true
        }
      }
    }
  });
  if (!category) throw new Response("Categoría no encontrada", {
    status: 404
  });
  return {
    category
  };
}
async function action$3({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  await prisma.product.deleteMany({
    where: {
      CategoryId: id
    }
  });
  await prisma.category.delete({
    where: {
      Id: id
    }
  });
  return redirect("/admin/categories");
}
const categories_delete = UNSAFE_withComponentProps(function CategoryDelete() {
  const {
    category
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Eliminar Categoría"
    }), /* @__PURE__ */ jsxs("div", {
      className: "alert alert-warning",
      children: [/* @__PURE__ */ jsx("h5", {
        children: "¿Está seguro que desea eliminar esta categoría?"
      }), /* @__PURE__ */ jsx("p", {
        children: /* @__PURE__ */ jsx("strong", {
          children: category.Name
        })
      }), category._count.Products > 0 && /* @__PURE__ */ jsxs("p", {
        className: "text-danger mb-0",
        children: [/* @__PURE__ */ jsx("strong", {
          children: "Advertencia:"
        }), " Se eliminarán también ", category._count.Products, " producto(s) asociado(s)."]
      })]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("button", {
        type: "submit",
        className: "btn btn-danger me-2",
        children: "Eliminar"
      }), /* @__PURE__ */ jsx(Link, {
        to: "/admin/categories",
        className: "btn btn-secondary",
        children: "Cancelar"
      })]
    })]
  });
});
const route27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: categories_delete,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
async function loader$3({
  request
}) {
  await requireAdmin(request);
  const grapeTypes2 = await prisma.grapeType.findMany({
    include: {
      _count: {
        select: {
          Products: true
        }
      }
    },
    orderBy: {
      Name: "asc"
    }
  });
  return {
    grapeTypes: grapeTypes2
  };
}
const grapeTypes = UNSAFE_withComponentProps(function AdminGrapeTypes() {
  const {
    grapeTypes: grapeTypes2
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Tipos de Uva"
    }), /* @__PURE__ */ jsx("div", {
      className: "mb-3",
      children: /* @__PURE__ */ jsxs(Link, {
        to: "/admin/grape-types/create",
        className: "btn btn-primary",
        children: [/* @__PURE__ */ jsx("i", {
          className: "bi bi-plus-lg"
        }), " Crear Tipo de Uva"]
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "table-responsive",
      children: /* @__PURE__ */ jsxs("table", {
        className: "table table-striped table-hover",
        children: [/* @__PURE__ */ jsx("thead", {
          children: /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("th", {
              children: "Nombre"
            }), /* @__PURE__ */ jsx("th", {
              children: "Descripción"
            }), /* @__PURE__ */ jsx("th", {
              children: "Productos"
            }), /* @__PURE__ */ jsx("th", {
              children: "Acciones"
            })]
          })
        }), /* @__PURE__ */ jsxs("tbody", {
          children: [grapeTypes2.map((gt) => /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("td", {
              children: gt.Name
            }), /* @__PURE__ */ jsx("td", {
              children: gt.Description || "—"
            }), /* @__PURE__ */ jsx("td", {
              children: gt._count.Products
            }), /* @__PURE__ */ jsxs("td", {
              children: [/* @__PURE__ */ jsx(Link, {
                to: `/admin/grape-types/${gt.Id}/edit`,
                className: "btn btn-sm btn-outline-secondary me-1",
                children: "Editar"
              }), /* @__PURE__ */ jsx(Link, {
                to: `/admin/grape-types/${gt.Id}/delete`,
                className: "btn btn-sm btn-outline-danger",
                children: "Eliminar"
              })]
            })]
          }, gt.Id)), grapeTypes2.length === 0 && /* @__PURE__ */ jsx("tr", {
            children: /* @__PURE__ */ jsx("td", {
              colSpan: 4,
              className: "text-center text-muted",
              children: "No hay tipos de uva."
            })
          })]
        })]
      })
    })]
  });
});
const route28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: grapeTypes,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2({
  request
}) {
  await requireAdmin(request);
  return {};
}
async function action$2({
  request
}) {
  await requireAdmin(request);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();
  if (!name) {
    return {
      error: "El nombre es obligatorio."
    };
  }
  await prisma.grapeType.create({
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null
    }
  });
  return redirect("/admin/grape-types");
}
const grapeTypes_create = UNSAFE_withComponentProps(function GrapeTypeCreate() {
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Crear Tipo de Uva"
    }), actionData?.error && /* @__PURE__ */ jsx("div", {
      className: "alert alert-danger",
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "row",
        children: /* @__PURE__ */ jsxs("div", {
          className: "col-md-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Name",
              className: "form-label",
              children: "Nombre *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Name",
              name: "Name",
              className: "form-control",
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Description",
              className: "form-label",
              children: "Descripción"
            }), /* @__PURE__ */ jsx("textarea", {
              id: "Description",
              name: "Description",
              className: "form-control",
              rows: 3
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3",
        children: [/* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary me-2",
          children: "Crear"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/admin/grape-types",
          className: "btn btn-secondary",
          children: "Cancelar"
        })]
      })]
    })]
  });
});
const route29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: grapeTypes_create,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
async function loader$1({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const grapeType = await prisma.grapeType.findUnique({
    where: {
      Id: id
    }
  });
  if (!grapeType) throw new Response("Tipo de uva no encontrado", {
    status: 404
  });
  return {
    grapeType
  };
}
async function action$1({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const formData = await request.formData();
  const name = String(formData.get("Name") || "").trim();
  if (!name) {
    return {
      error: "El nombre es obligatorio."
    };
  }
  await prisma.grapeType.update({
    where: {
      Id: id
    },
    data: {
      Name: name,
      Description: String(formData.get("Description") || "") || null
    }
  });
  return redirect("/admin/grape-types");
}
const grapeTypes_edit = UNSAFE_withComponentProps(function GrapeTypeEdit() {
  const {
    grapeType
  } = useLoaderData();
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Editar Tipo de Uva"
    }), actionData?.error && /* @__PURE__ */ jsx("div", {
      className: "alert alert-danger",
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("div", {
        className: "row",
        children: /* @__PURE__ */ jsxs("div", {
          className: "col-md-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Name",
              className: "form-label",
              children: "Nombre *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              id: "Name",
              name: "Name",
              className: "form-control",
              defaultValue: grapeType.Name,
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-3",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "Description",
              className: "form-label",
              children: "Descripción"
            }), /* @__PURE__ */ jsx("textarea", {
              id: "Description",
              name: "Description",
              className: "form-control",
              rows: 3,
              defaultValue: grapeType.Description ?? ""
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3",
        children: [/* @__PURE__ */ jsx("button", {
          type: "submit",
          className: "btn btn-primary me-2",
          children: "Guardar"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/admin/grape-types",
          className: "btn btn-secondary",
          children: "Cancelar"
        })]
      })]
    })]
  });
});
const route30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: grapeTypes_edit,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  const grapeType = await prisma.grapeType.findUnique({
    where: {
      Id: id
    },
    include: {
      _count: {
        select: {
          Products: true
        }
      }
    }
  });
  if (!grapeType) throw new Response("Tipo de uva no encontrado", {
    status: 404
  });
  return {
    grapeType
  };
}
async function action({
  request,
  params
}) {
  await requireAdmin(request);
  const id = parseInt(params.id, 10);
  await prisma.product.updateMany({
    where: {
      GrapeTypeId: id
    },
    data: {
      GrapeTypeId: null
    }
  });
  await prisma.grapeType.delete({
    where: {
      Id: id
    }
  });
  return redirect("/admin/grape-types");
}
const grapeTypes_delete = UNSAFE_withComponentProps(function GrapeTypeDelete() {
  const {
    grapeType
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4",
      children: "Eliminar Tipo de Uva"
    }), /* @__PURE__ */ jsxs("div", {
      className: "alert alert-warning",
      children: [/* @__PURE__ */ jsx("h5", {
        children: "¿Está seguro que desea eliminar este tipo de uva?"
      }), /* @__PURE__ */ jsx("p", {
        children: /* @__PURE__ */ jsx("strong", {
          children: grapeType.Name
        })
      }), grapeType._count.Products > 0 && /* @__PURE__ */ jsxs("p", {
        className: "text-muted mb-0",
        children: [grapeType._count.Products, " producto(s) asociado(s) perderán su tipo de uva."]
      })]
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsx("button", {
        type: "submit",
        className: "btn btn-danger me-2",
        children: "Eliminar"
      }), /* @__PURE__ */ jsx(Link, {
        to: "/admin/grape-types",
        className: "btn btn-secondary",
        children: "Cancelar"
      })]
    })]
  });
});
const route31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: grapeTypes_delete,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DKPVHLBE.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-DqjTPmWg.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": ["/assets/root-DznhLLkk.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-BsWCNaXp.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-BcGJnXwM.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/logout": { "id": "routes/logout", "parentId": "root", "path": "logout", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/catalog": { "id": "routes/catalog", "parentId": "root", "path": "catalog", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/catalog-CgeCRWGe.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js", "/assets/CatalogGrid-Dj2wkXGW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/destilados": { "id": "routes/destilados", "parentId": "root", "path": "destilados", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/destilados-DkSYR1sR.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js", "/assets/CatalogGrid-Dj2wkXGW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/cafe": { "id": "routes/cafe", "parentId": "root", "path": "cafe", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/cafe-ClAtFE1N.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js", "/assets/CatalogGrid-Dj2wkXGW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.lookups.categories": { "id": "routes/api.lookups.categories", "parentId": "root", "path": "api/lookups/categories", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.lookups.categories-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.lookups.grapes": { "id": "routes/api.lookups.grapes", "parentId": "root", "path": "api/lookups/grapes", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.lookups.grapes-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.products.$id": { "id": "routes/api.products.$id", "parentId": "root", "path": "api/products/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.products._id-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.products.save": { "id": "routes/api.products.save", "parentId": "root", "path": "api/products/save", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.products.save-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.update-position": { "id": "routes/api.catalog.update-position", "parentId": "root", "path": "api/catalog/:catalogType/update-position", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.update-position-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.vaciar-celda": { "id": "routes/api.catalog.vaciar-celda", "parentId": "root", "path": "api/catalog/:catalogType/vaciar-celda", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.vaciar-celda-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.create-title": { "id": "routes/api.catalog.create-title", "parentId": "root", "path": "api/catalog/:catalogType/create-title", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.create-title-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.update-title": { "id": "routes/api.catalog.update-title", "parentId": "root", "path": "api/catalog/:catalogType/update-title", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.update-title-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.delete-title": { "id": "routes/api.catalog.delete-title", "parentId": "root", "path": "api/catalog/:catalogType/delete-title", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.delete-title-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.insert-row": { "id": "routes/api.catalog.insert-row", "parentId": "root", "path": "api/catalog/:catalogType/insert-row", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.insert-row-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.delete-row": { "id": "routes/api.catalog.delete-row", "parentId": "root", "path": "api/catalog/:catalogType/delete-row", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.delete-row-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.delete-last-empty-rows": { "id": "routes/api.catalog.delete-last-empty-rows", "parentId": "root", "path": "api/catalog/:catalogType/delete-last-empty-rows", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.delete-last-empty-rows-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.catalog.place-unassigned": { "id": "routes/api.catalog.place-unassigned", "parentId": "root", "path": "api/catalog/:catalogType/place-unassigned", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.catalog.place-unassigned-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/products": { "id": "routes/admin/products", "parentId": "root", "path": "admin/products", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/products-Bt24dyij.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/products.create": { "id": "routes/admin/products.create", "parentId": "root", "path": "admin/products/create", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/products.create-B_-eehUF.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/products.edit": { "id": "routes/admin/products.edit", "parentId": "root", "path": "admin/products/:id/edit", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/products.edit-DcBcjpYJ.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/products.delete": { "id": "routes/admin/products.delete", "parentId": "root", "path": "admin/products/:id/delete", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/products.delete-Bpnyivnm.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/categories": { "id": "routes/admin/categories", "parentId": "root", "path": "admin/categories", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/categories-Choz-QgU.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/categories.create": { "id": "routes/admin/categories.create", "parentId": "root", "path": "admin/categories/create", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/categories.create-BdTHSsI8.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/categories.edit": { "id": "routes/admin/categories.edit", "parentId": "root", "path": "admin/categories/:id/edit", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/categories.edit-BQ6Cgh-F.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/categories.delete": { "id": "routes/admin/categories.delete", "parentId": "root", "path": "admin/categories/:id/delete", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/categories.delete-CVBnVi2D.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/grape-types": { "id": "routes/admin/grape-types", "parentId": "root", "path": "admin/grape-types", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/grape-types-CLta6Cpl.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/grape-types.create": { "id": "routes/admin/grape-types.create", "parentId": "root", "path": "admin/grape-types/create", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/grape-types.create-C9dUlV9D.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/grape-types.edit": { "id": "routes/admin/grape-types.edit", "parentId": "root", "path": "admin/grape-types/:id/edit", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/grape-types.edit-D9Vpoyoi.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/grape-types.delete": { "id": "routes/admin/grape-types.delete", "parentId": "root", "path": "admin/grape-types/:id/delete", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/grape-types.delete-BAqUVfrY.js", "imports": ["/assets/chunk-EPOLDU6W-B9w3MOV_.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-b5ec269a.js", "version": "b5ec269a", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/catalog": {
    id: "routes/catalog",
    parentId: "root",
    path: "catalog",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/destilados": {
    id: "routes/destilados",
    parentId: "root",
    path: "destilados",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/cafe": {
    id: "routes/cafe",
    parentId: "root",
    path: "cafe",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/api.lookups.categories": {
    id: "routes/api.lookups.categories",
    parentId: "root",
    path: "api/lookups/categories",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/api.lookups.grapes": {
    id: "routes/api.lookups.grapes",
    parentId: "root",
    path: "api/lookups/grapes",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/api.products.$id": {
    id: "routes/api.products.$id",
    parentId: "root",
    path: "api/products/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/api.products.save": {
    id: "routes/api.products.save",
    parentId: "root",
    path: "api/products/save",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/api.catalog.update-position": {
    id: "routes/api.catalog.update-position",
    parentId: "root",
    path: "api/catalog/:catalogType/update-position",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/api.catalog.vaciar-celda": {
    id: "routes/api.catalog.vaciar-celda",
    parentId: "root",
    path: "api/catalog/:catalogType/vaciar-celda",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/api.catalog.create-title": {
    id: "routes/api.catalog.create-title",
    parentId: "root",
    path: "api/catalog/:catalogType/create-title",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/api.catalog.update-title": {
    id: "routes/api.catalog.update-title",
    parentId: "root",
    path: "api/catalog/:catalogType/update-title",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/api.catalog.delete-title": {
    id: "routes/api.catalog.delete-title",
    parentId: "root",
    path: "api/catalog/:catalogType/delete-title",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/api.catalog.insert-row": {
    id: "routes/api.catalog.insert-row",
    parentId: "root",
    path: "api/catalog/:catalogType/insert-row",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/api.catalog.delete-row": {
    id: "routes/api.catalog.delete-row",
    parentId: "root",
    path: "api/catalog/:catalogType/delete-row",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/api.catalog.delete-last-empty-rows": {
    id: "routes/api.catalog.delete-last-empty-rows",
    parentId: "root",
    path: "api/catalog/:catalogType/delete-last-empty-rows",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "routes/api.catalog.place-unassigned": {
    id: "routes/api.catalog.place-unassigned",
    parentId: "root",
    path: "api/catalog/:catalogType/place-unassigned",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "routes/admin/products": {
    id: "routes/admin/products",
    parentId: "root",
    path: "admin/products",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "routes/admin/products.create": {
    id: "routes/admin/products.create",
    parentId: "root",
    path: "admin/products/create",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "routes/admin/products.edit": {
    id: "routes/admin/products.edit",
    parentId: "root",
    path: "admin/products/:id/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "routes/admin/products.delete": {
    id: "routes/admin/products.delete",
    parentId: "root",
    path: "admin/products/:id/delete",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "routes/admin/categories": {
    id: "routes/admin/categories",
    parentId: "root",
    path: "admin/categories",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "routes/admin/categories.create": {
    id: "routes/admin/categories.create",
    parentId: "root",
    path: "admin/categories/create",
    index: void 0,
    caseSensitive: void 0,
    module: route25
  },
  "routes/admin/categories.edit": {
    id: "routes/admin/categories.edit",
    parentId: "root",
    path: "admin/categories/:id/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route26
  },
  "routes/admin/categories.delete": {
    id: "routes/admin/categories.delete",
    parentId: "root",
    path: "admin/categories/:id/delete",
    index: void 0,
    caseSensitive: void 0,
    module: route27
  },
  "routes/admin/grape-types": {
    id: "routes/admin/grape-types",
    parentId: "root",
    path: "admin/grape-types",
    index: void 0,
    caseSensitive: void 0,
    module: route28
  },
  "routes/admin/grape-types.create": {
    id: "routes/admin/grape-types.create",
    parentId: "root",
    path: "admin/grape-types/create",
    index: void 0,
    caseSensitive: void 0,
    module: route29
  },
  "routes/admin/grape-types.edit": {
    id: "routes/admin/grape-types.edit",
    parentId: "root",
    path: "admin/grape-types/:id/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route30
  },
  "routes/admin/grape-types.delete": {
    id: "routes/admin/grape-types.delete",
    parentId: "root",
    path: "admin/grape-types/:id/delete",
    index: void 0,
    caseSensitive: void 0,
    module: route31
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
