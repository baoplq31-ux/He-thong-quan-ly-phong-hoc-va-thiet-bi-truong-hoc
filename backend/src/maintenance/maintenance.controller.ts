import { BadRequestException, ConflictException, Controller, Get, Patch, Post, Body, Param, Req } from "@nestjs/common";
import type { Request } from "express";
import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

function date(value: unknown, label: string) { if (typeof value !== "string" || !value.trim() || Number.isNaN(new Date(value).getTime())) throw new BadRequestException(`${label} không hợp lệ.`); return new Date(value); }
@Controller("api/maintenance")
export class MaintenanceController {
  constructor(private prisma: PrismaService) {}
  @Get() async list(@Req() req: Request) { await requireUser(req, this.prisma, FACILITY_MANAGER_ROLES); return { data: await this.prisma.maintenance.findMany({ orderBy: { createdAt: "desc" }, include: { equipment: { select: { id: true, code: true, name: true, quantity: true } }, createdBy: { select: { id: true, code: true, name: true } } } }) }; }
  @Post() async create(@Req() req: Request, @Body() b: any) {
    const actor = await requireUser(req, this.prisma, FACILITY_MANAGER_ROLES), equipmentId = positiveId(b.equipmentId), quantity = Number(b.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException("Số lượng bảo trì phải là số nguyên lớn hơn 0.");
    const record = await this.prisma.$transaction(async tx => {
      const equipment = await tx.equipment.findUnique({ where: { id: equipmentId } }); if (!equipment) throw new BadRequestException("Không tìm thấy thiết bị.");
      const [borrowed, maintenance] = await Promise.all([tx.equipmentBorrowing.aggregate({ where: { equipmentId, status: { in: ["Đã duyệt", "Đang mượn", "Quá hạn"] } }, _sum: { quantity: true } }), tx.maintenance.aggregate({ where: { equipmentId, status: "Đang xử lý" }, _sum: { quantity: true } })]);
      const available = equipment.quantity - (borrowed._sum.quantity ?? 0) - (maintenance._sum.quantity ?? 0); if (quantity > available) throw new ConflictException(`Chỉ còn ${Math.max(0, available)} thiết bị có thể đưa vào bảo trì.`);
      await tx.equipment.update({ where: { id: equipmentId }, data: { availableQuantity: equipment.status === "Hỏng" ? 0 : Math.max(0, available - quantity), status: "Cần kiểm tra" } });
      const created = await tx.maintenance.create({ data: { equipmentId, createdById: actor.id, quantity, type: requiredText(b.type, "Loại bảo trì"), issueDescription: requiredText(b.issueDescription, "Mô tả lỗi"), content: requiredText(b.content, "Nội dung bảo trì"), startDate: date(b.startDate, "Ngày bắt đầu"), assignedTo: typeof b.assignedTo === "string" ? b.assignedTo.trim() || null : null }, include: { equipment: true, createdBy: { select: { id: true, code: true, name: true } } } });
      await tx.auditLog.create({ data: { userId: actor.id, action: "Tạo phiếu bảo trì", module: "maintenance", objectId: String(created.id), newValue: JSON.stringify(created) } }); return created;
    });
    return { success: true, message: "Đã tạo phiếu bảo trì.", data: record };
  }
  @Patch(":id") async update(@Req() req: Request, @Param("id") rawId: string, @Body() b: any) {
    const actor = await requireUser(req, this.prisma, FACILITY_MANAGER_ROLES), id = positiveId(rawId), current = await this.prisma.maintenance.findUnique({ where: { id }, include: { equipment: true } });
    if (!current) throw new BadRequestException("Không tìm thấy phiếu bảo trì.");
    if (current.status === "Đã hoàn thành") throw new ConflictException("Phiếu bảo trì đã được hoàn thành.");
    const repairResult = requiredText(b.repairResult, "Kết quả xử lý");
    const conditionAfter = requiredText(b.conditionAfter, "Tình trạng thiết bị sau bảo trì");
    if (!["Tốt", "Cần kiểm tra", "Hỏng"].includes(conditionAfter)) throw new BadRequestException("Tình trạng sau bảo trì không hợp lệ.");
    const cost = b.cost === undefined || b.cost === null || b.cost === "" ? null : Number(b.cost);
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) throw new BadRequestException("Chi phí bảo trì phải lớn hơn hoặc bằng 0.");
    const updated = await this.prisma.$transaction(async tx => {
      const [borrowed, otherActive] = await Promise.all([tx.equipmentBorrowing.aggregate({ where: { equipmentId: current.equipmentId, status: { in: ["Đã duyệt", "Đang mượn", "Quá hạn"] } }, _sum: { quantity: true } }), tx.maintenance.aggregate({ where: { equipmentId: current.equipmentId, status: "Đang xử lý", id: { not: id } }, _sum: { quantity: true } })]);
      const availableQuantity = conditionAfter === "Hỏng" ? 0 : Math.max(0, current.equipment.quantity - (borrowed._sum.quantity ?? 0) - (otherActive._sum.quantity ?? 0));
      await tx.equipment.update({ where: { id: current.equipmentId }, data: { availableQuantity, status: conditionAfter } });
      const item = await tx.maintenance.update({ where: { id }, data: { status: "Đã hoàn thành", endDate: new Date(), repairResult, conditionAfter, cost }, include: { equipment: { select: { id: true, code: true, name: true, quantity: true } }, createdBy: { select: { id: true, code: true, name: true } } } });
      await tx.auditLog.create({ data: { userId: actor.id, action: "Hoàn thành phiếu bảo trì", module: "maintenance", objectId: String(id), oldValue: JSON.stringify({ status: current.status }), newValue: JSON.stringify({ status: item.status, conditionAfter, availableQuantity }) } });
      return item;
    });
    return { success: true, message: "Đã cập nhật kết quả bảo trì.", data: updated };
  }
}
