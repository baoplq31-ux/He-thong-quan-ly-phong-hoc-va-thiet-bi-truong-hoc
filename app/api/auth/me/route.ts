import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    user: {
      id: String(user.id),
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      lastLogin: user.lastLogin
        ? new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Asia/Ho_Chi_Minh",
          }).format(new Date(user.lastLogin))
        : "Chưa đăng nhập",
    },
  });
}