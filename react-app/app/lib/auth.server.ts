import { createCookieSessionStorage, redirect } from "react-router";
import { prisma } from "./db.server";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.destroySession(session);
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get("userId") ?? null;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await prisma.aspNetUser.findUnique({
    where: { Id: userId },
    include: { UserRoles: { include: { Role: true } } },
  });

  if (!user) return null;

  return {
    id: user.Id,
    email: user.Email,
    userName: user.UserName,
    roles: user.UserRoles.map((ur) => ur.Role.Name).filter(Boolean) as string[],
  };
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (!user.roles.includes("Admin")) throw redirect("/");
  return user;
}

export function isAdmin(user: Awaited<ReturnType<typeof getUser>>) {
  return user?.roles.includes("Admin") ?? false;
}

// ASP.NET Identity compatible password hashing
// ASP.NET Identity v3 uses PBKDF2 with HMAC-SHA256, 128-bit salt, 256-bit subkey, 10000 iterations
// Format: { 0x01, prf (4 bytes, big-endian), iter (4 bytes, big-endian), saltLength (4 bytes, big-endian), salt, subkey }
function verifyPasswordV3(hashedPassword: string, providedPassword: string): boolean {
  const buffer = Buffer.from(hashedPassword, "base64");
  if (buffer.length < 13 || buffer[0] !== 0x01) return false;

  const prf = buffer.readUInt32BE(1); // PRF identifier
  const iterCount = buffer.readUInt32BE(5);
  const saltLength = buffer.readUInt32BE(9);

  if (buffer.length < 13 + saltLength) return false;

  const salt = buffer.subarray(13, 13 + saltLength);
  const expectedSubkey = buffer.subarray(13 + saltLength);
  const subkeyLength = expectedSubkey.length;

  // prf == 1 means HMAC-SHA256
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

export async function verifyLogin(email: string, password: string) {
  const normalizedEmail = email.toUpperCase();

  const user = await prisma.aspNetUser.findFirst({
    where: { NormalizedEmail: normalizedEmail },
    include: { UserRoles: { include: { Role: true } } },
  });

  if (!user || !user.PasswordHash) return null;

  const isValid = verifyPasswordV3(user.PasswordHash, password);
  if (!isValid) return null;

  return {
    id: user.Id,
    email: user.Email,
    userName: user.UserName,
    roles: user.UserRoles.map((ur) => ur.Role.Name).filter(Boolean) as string[],
  };
}
