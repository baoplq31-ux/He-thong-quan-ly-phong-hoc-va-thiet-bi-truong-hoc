import {
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import type { Request } from "express";

import { PrismaService } from "../prisma.service.js";

export const SESSION_COOKIE_NAME = "edufacility_session";
export const ADMIN_ROLES = ["Quản trị viên"] as const;
export const FACILITY_MANAGER_ROLES = [
  "Quản trị viên",
  "Cán bộ thiết bị",
] as const;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requireUser(
  request: Request,
  prisma: PrismaService,
  allowedRoles?: readonly string[],
) {
  const token = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  if (!token) throw new UnauthorizedException("Vui lòng đăng nhập.");

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (
    !session ||
    session.expiresAt <= new Date() ||
    session.user.status !== "Hoạt động"
  ) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    throw new UnauthorizedException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này.");
  }
  return session.user;
}

export function hashSessionToken(token: string) {
  return hashToken(token);
}
