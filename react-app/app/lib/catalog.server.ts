import { prisma } from "./db.server";
import type { Product, Category, GrapeType } from "../../generated/prisma";

export type CatalogType = "wines" | "spirits" | "cafe";

type TitleRow = { Id: number; Text: string; MatrixY: number; Level: number };
type EmptyCell = { X: number; Y: number };

/** Convierte campos Decimal de Prisma a number para serialización cliente */
export function serializeProduct<T extends Record<string, any>>(product: T): T {
  return {
    ...product,
    Price: product.Price != null ? Number(product.Price) : null,
  };
}

interface CatalogConfig {
  sortOrderFilter: (number | null)[];
  matrixXField: "MatrixX" | "MatrixXSpirits" | "MatrixXCafe";
  matrixYField: "MatrixY" | "MatrixYSpirits" | "MatrixYCafe";
}

const configs: Record<CatalogType, CatalogConfig> = {
  wines: {
    sortOrderFilter: [null, 1],
    matrixXField: "MatrixX",
    matrixYField: "MatrixY",
  },
  spirits: {
    sortOrderFilter: [2],
    matrixXField: "MatrixXSpirits",
    matrixYField: "MatrixYSpirits",
  },
  cafe: {
    sortOrderFilter: [3],
    matrixXField: "MatrixXCafe",
    matrixYField: "MatrixYCafe",
  },
};

export type ProductWithRelations = Product & {
  Category: Category | null;
  GrapeType: GrapeType | null;
};

export interface CatalogData {
  products: ProductWithRelations[];
  categories: Category[];
  wineries: string[];
  origins: string[];
  grapeTypes: GrapeType[];
  titleRows: TitleRow[];
  emptyCells: { x: number; y: number }[];
  matrixRows: number;
  matrixColumns: number;
  maxAllowedRows: number;
  productMatrix: (ProductWithRelations | null)[][];
  unpositionedProducts: ProductWithRelations[];
  titleRowsWithProducts: number[];
  isFiltered: boolean;
}

function buildCategoryWhere(catalogType: CatalogType) {
  const config = configs[catalogType];
  if (catalogType === "wines") {
    return { OR: [{ SortOrder: null }, { SortOrder: 1 }] };
  }
  return { SortOrder: config.sortOrderFilter[0] };
}

export async function loadCatalogData(
  catalogType: CatalogType,
  filters: {
    query?: string;
    categoryId?: number;
    winery?: string;
    origin?: string;
    grapeTypeId?: number;
  }
): Promise<CatalogData> {
  const config = configs[catalogType];
  const MATRIX_COLUMNS = 3;

  const categoryWhere = buildCategoryWhere(catalogType);

  // Load categories for this catalog
  const categories = await prisma.category.findMany({
    where: categoryWhere,
    orderBy: { Name: "asc" },
  });

  // Build product filter
  const productWhere: any = {
    Category: categoryWhere,
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
      { GrapeType: { Name: { contains: term } } },
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

  const rawProducts = await prisma.product.findMany({
    where: productWhere,
    include: { Category: true, GrapeType: true },
    orderBy: { Name: "asc" },
  });
  const products = rawProducts.map(serializeProduct);

  // Load wineries and origins for filters
  const allCatalogProducts = await prisma.product.findMany({
    where: { Category: categoryWhere },
    select: { Winery: true, Origin: true },
  });
  const wineries = [...new Set(allCatalogProducts.map((p) => p.Winery).filter(Boolean) as string[])].sort();
  const origins = [...new Set(allCatalogProducts.map((p) => p.Origin).filter(Boolean) as string[])].sort();
  const grapeTypes = await prisma.grapeType.findMany({ orderBy: { Name: "asc" } });

  // Load title rows and empty cells
  let titleRows: TitleRow[] = [];
  let emptyCellRecords: EmptyCell[] = [];

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

  // Calculate matrix dimensions
  const xField = config.matrixXField;
  const yField = config.matrixYField;
  const maxProductY = products.reduce((max, p) => {
    const val = p[yField] as number | null;
    return val != null && val > max ? val : max;
  }, -1);
  const maxTitleY = titleRows.reduce((max, t) => (t.MatrixY > max ? t.MatrixY : max), -1);
  const maxEmptyY = emptyCells.reduce((max, e) => (e.y > max ? e.y : max), -1);
  const matrixRows = Math.max(1, Math.max(maxProductY + 1, Math.max(maxTitleY + 1, maxEmptyY + 1)));

  // Compute maxAllowedRows (considers all products in catalog, not just filtered)
  const allProductsMaxY = await prisma.product.findMany({
    where: { Category: categoryWhere },
    select: { [yField]: true } as any,
  });
  const globalMaxProductY = allProductsMaxY.reduce((max: number, p: any) => {
    const val = p[yField] as number | null;
    return val != null && val > max ? val : max;
  }, -1);
  const maxAllowedRows = Math.max(1, Math.max(globalMaxProductY + 1, Math.max(maxTitleY + 1, maxEmptyY + 1)));

  // Build product matrix
  const productMatrix: (ProductWithRelations | null)[][] = Array.from(
    { length: matrixRows },
    () => Array(MATRIX_COLUMNS).fill(null)
  );
  const unpositionedProducts: ProductWithRelations[] = [];

  for (const product of products) {
    const px = product[xField] as number | null;
    const py = product[yField] as number | null;
    const validCoords =
      px != null &&
      py != null &&
      px >= 0 &&
      px < MATRIX_COLUMNS &&
      py >= 0 &&
      py < matrixRows &&
      !reservedRows.has(py) &&
      !emptyCellSet.has(`${px},${py}`);

    if (validCoords && productMatrix[py!][px!] == null) {
      productMatrix[py!][px!] = product;
    } else {
      unpositionedProducts.push(product);
    }
  }

  // Compute title rows with products
  const titleRowsWithProducts: number[] = [];
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
      for (let x = 0; x < MATRIX_COLUMNS; x++) {
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
    products,
    categories,
    wineries,
    origins,
    grapeTypes,
    titleRows,
    emptyCells,
    matrixRows,
    matrixColumns: MATRIX_COLUMNS,
    maxAllowedRows,
    productMatrix,
    unpositionedProducts,
    titleRowsWithProducts,
    isFiltered,
  };
}
