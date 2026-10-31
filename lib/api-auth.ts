import "server-only";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

export const FACILITY_MANAGER_ROLES = [
  "Quản trị viên",
  "Cán bộ thiết bị",
] as const;

export const ADMIN_ROLES = ["Quản trị viên"] as const;

export async function requireApiUser(allowedRoles?: readonly string[]) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Bạn chưa đăng nhập." },
        { status: 401 },
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Bạn không có quyền thực hiện thao tác này." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}