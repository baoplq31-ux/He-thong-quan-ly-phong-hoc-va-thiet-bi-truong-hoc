import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  NotFoundException,
  Patch,
  Post,
  Req,
  Body,
} from "@nestjs/common";
import type { Request } from "express";

import { AuditService } from "../common/audit.js";
import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { notifyRoles } from "../common/notifications.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

const STATUSES = ["Tốt", "Cần kiểm tra", "Hỏng"];
const ACTIVE_BORROWING_STATUSES = ["Đã duyệt", "Đang mượn", "Quá hạn"];

@Controller("api/equipment")
export class EquipmentController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Post()
  async create(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const code = requiredText(body.code, "Mã thiết bị").toUpperCase();
    const name = requiredText(body.name, "Tên thiết bị");
    const type = requiredText(body.type, "Loại thiết bị");
    const roomCode = requiredText(body.room, "Phòng").toUpperCase();
    const status = requiredText(body.status, "Trạng thái");
    const lastChecked = requiredText(body.lastChecked, "Ngày kiểm tra");
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException("Số lượng phải là số nguyên lớn hơn 0.");
    if (!STATUSES.includes(status)) throw new BadRequestException("Trạng thái thiết bị không hợp lệ.");
    if (await this.prisma.equipment.findUnique({ where: { code } })) throw new ConflictException("Mã thiết bị đã tồn tại.");
    const room = await this.prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) throw new NotFoundException(`Không tìm thấy phòng ${roomCode}.`);
    const equipment = await this.prisma.$transaction(async (tx) => {
      const item = await tx.equipment.create({
        data: { code, name, type, roomId: room.id, quantity, availableQuantity: status === "Hỏng" ? 0 : quantity, status, lastChecked },
        include: { room: true },
      });
      await tx.room.update({ where: { id: room.id }, data: { equipmentCount: { increment: quantity } } });
      return item;
    });
    await this.audit.record({ userId: actor.id, action: "Tạo thiết bị", module: "equipment", objectId: equipment.id, newValue: equipment });
    if (status !== "Tốt") {
      await notifyRoles(this.prisma, [...FACILITY_MANAGER_ROLES], {
        title: "Thiết bị cần kiểm tra",
        message: `${code} - ${name} đang ở trạng thái ${status}.`,
        type: "equipment",
        referenceType: "equipment",
        referenceId: equipment.id,
      });
    }
    return { message: "Thêm thiết bị thành công.", equipment: { ...equipment, room: room.code } };
  }

  @Patch()
  async update(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const current = await this.prisma.equipment.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Không tìm thấy thiết bị.");
    const code = requiredText(body.code, "Mã thiết bị").toUpperCase();
    const name = requiredText(body.name, "Tên thiết bị");
    const type = requiredText(body.type, "Loại thiết bị");
    const roomCode = requiredText(body.room, "Phòng").toUpperCase();
    const status = requiredText(body.status, "Trạng thái");
    const lastChecked = requiredText(body.lastChecked, "Ngày kiểm tra");
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException("Số lượng phải là số nguyên lớn hơn 0.");
    if (!STATUSES.includes(status)) throw new BadRequestException("Trạng thái thiết bị không hợp lệ.");
    const room = await this.prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) throw new NotFoundException("Không tìm thấy phòng được chọn.");
    const duplicate = await this.prisma.equipment.findFirst({ where: { code, NOT: { id } } });
    if (duplicate) throw new ConflictException("Mã thiết bị đã tồn tại.");

    const equipment = await this.prisma.$transaction(async (tx) => {
      const [borrowed, maintenance] = await Promise.all([
        tx.equipmentBorrowing.aggregate({ where: { equipmentId: id, status: { in: ACTIVE_BORROWING_STATUSES } }, _sum: { quantity: true } }),
        tx.maintenance.aggregate({ where: { equipmentId: id, status: "Đang xử lý" }, _sum: { quantity: true } }),
      ]);
      const reserved = (borrowed._sum.quantity ?? 0) + (maintenance._sum.quantity ?? 0);
      if (quantity < reserved) throw new ConflictException("Không thể giảm số lượng dưới số thiết bị đang mượn hoặc bảo trì.");
      const updated = await tx.equipment.update({
        where: { id },
        data: { code, name, type, roomId: room.id, quantity, status, lastChecked, availableQuantity: status === "Hỏng" ? 0 : quantity - reserved },
        include: { room: true },
      });
      if (current.roomId !== room.id) {
        const [oldTotal, newTotal] = await Promise.all([
          tx.equipment.aggregate({ where: { roomId: current.roomId }, _sum: { quantity: true } }),
          tx.equipment.aggregate({ where: { roomId: room.id }, _sum: { quantity: true } }),
        ]);
        await tx.room.update({ where: { id: current.roomId }, data: { equipmentCount: oldTotal._sum.quantity ?? 0 } });
        await tx.room.update({ where: { id: room.id }, data: { equipmentCount: newTotal._sum.quantity ?? 0 } });
      } else {
        await tx.room.update({ where: { id: room.id }, data: { equipmentCount: { increment: quantity - current.quantity } } });
      }
      return updated;
    });
    await this.audit.record({ userId: actor.id, action: "Cập nhật thiết bị", module: "equipment", objectId: id, oldValue: current, newValue: equipment });
    return { message: "Cập nhật thiết bị thành công.", equipment: { ...equipment, room: room.code } };
  }

  @Delete()
  async remove(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const equipment = await this.prisma.equipment.findUnique({ where: { id }, include: { _count: { select: { borrowings: true, maintenances: true } } } });
    if (!equipment) throw new NotFoundException("Không tìm thấy thiết bị.");
    if (equipment._count.borrowings || equipment._count.maintenances) throw new ConflictException("Không thể xóa thiết bị đã có phiếu mượn hoặc bảo trì.");
    await this.prisma.$transaction(async (tx) => {
      await tx.equipment.delete({ where: { id } });
      await tx.room.update({ where: { id: equipment.roomId }, data: { equipmentCount: { decrement: equipment.quantity } } });
    });
    await this.audit.record({ userId: actor.id, action: "Xóa thiết bị", module: "equipment", objectId: id, oldValue: equipment });
    return { message: `Đã xóa thiết bị ${equipment.code}.` };
  }
}
