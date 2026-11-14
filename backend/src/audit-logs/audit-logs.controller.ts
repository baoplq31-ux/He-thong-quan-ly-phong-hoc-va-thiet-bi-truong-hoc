import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { ADMIN_ROLES, requireUser } from "../common/auth.js";
import { PrismaService } from "../prisma.service.js";
@Controller("api/audit-logs")
export class AuditController {
  constructor(private prisma: PrismaService) {}
  @Get() async list(@Req() req: Request) { await requireUser(req, this.prisma, ADMIN_ROLES); return { data: await this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { id: true, code: true, name: true } } } }) }; }
}
