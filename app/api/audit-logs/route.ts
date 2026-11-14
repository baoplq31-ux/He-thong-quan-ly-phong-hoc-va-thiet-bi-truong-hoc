import { NextResponse } from "next/server";

import { ADMIN_ROLES, requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser(ADMIN_ROLES);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("GET /api/audit-logs error:", error);
    return NextResponse.json(
      { message: "Không thể tải nhật ký hệ thống." },
      { status: 500 },
    );
  }
}
