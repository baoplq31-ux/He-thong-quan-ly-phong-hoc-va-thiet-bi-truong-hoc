import { PrismaService } from "../prisma.service.js";

export async function notifyRoles(
  prisma: PrismaService,
  roles: string[],
  values: { title: string; message: string; type: string; referenceType?: string; referenceId?: number },
) {
  const users = await prisma.systemUser.findMany({
    where: { role: { in: roles }, status: "Hoạt động" },
    select: { id: true },
  });
  if (!users.length) return;
  await prisma.notification.createMany({
    data: users.map(({ id }) => ({ userId: id, ...values })),
  });
}
