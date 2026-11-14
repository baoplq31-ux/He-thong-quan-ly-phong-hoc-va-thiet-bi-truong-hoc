import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: {
    userId?: number | null;
    action: string;
    module: string;
    objectId?: string | number | null;
    oldValue?: unknown;
    newValue?: unknown;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        module: entry.module,
        objectId: entry.objectId == null ? null : String(entry.objectId),
        oldValue: entry.oldValue == null ? null : JSON.stringify(entry.oldValue),
        newValue: entry.newValue == null ? null : JSON.stringify(entry.newValue),
      },
    });
  }
}
