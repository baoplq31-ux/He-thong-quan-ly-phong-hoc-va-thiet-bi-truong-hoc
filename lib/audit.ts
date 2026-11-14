import { prisma } from "@/lib/prisma";

type AuditEntry = {
  userId: number;
  action: string;
  module: string;
  objectId?: string | number;
  oldValue?: unknown;
  newValue?: unknown;
};

function serialize(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.stringify(value);
}

export async function recordAudit(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      module: entry.module,
      objectId:
        entry.objectId === undefined
          ? null
          : String(entry.objectId),
      oldValue: serialize(entry.oldValue),
      newValue: serialize(entry.newValue),
    },
  });
}

export async function recordAuditSafely(entry: AuditEntry) {
  try {
    await recordAudit(entry);
  } catch (error) {
    console.error(
      `Không thể ghi audit ${entry.module}/${entry.action}:`,
      error,
    );
  }
}
