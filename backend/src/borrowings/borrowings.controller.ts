import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Body,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Request } from "express";

import { AuditService } from "../common/audit.js";
import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

const ACTIVE = ["Đã duyệt", "Đang mượn", "Quá hạn"];
const CONDITIONS = ["Tốt", "Cần kiểm tra", "Hỏng"];

function validDate(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new BadRequestException(`${label} không hợp lệ.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${label} không hợp lệ.`);
  return date;
}

@Controller("api/borrowings")
export class BorrowingsController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get()
  async list(@Req() request: Request) {
    const user = await requireUser(request, this.prisma);
    const manager = FACILITY_MANAGER_ROLES.includes(user.role as (typeof FACILITY_MANAGER_ROLES)[number]);
    const records = await this.prisma.equipmentBorrowing.findMany({
      where: manager ? undefined : { borrowerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        equipment: { include: { room: { select: { id: true, code: true, name: true } } } },
        borrower: { select: { id: true, code: true, name: true, email: true, role: true } },
        approvedBy: { select: { id: true, code: true, name: true } },
        returnedBy: { select: { id: true, code: true, name: true } },
      },
    });
    const now = new Date();
    return {
      success: true,
      data: records.map((item) => ({
        ...item,
        status: item.status === "Đang mượn" && item.expectedReturnDate < now ? "Quá hạn" : item.status,
      })),
    };
  }

  @Post()
  async create(@Req() request: Request, @Body() body: any) {
    const user = await requireUser(request, this.prisma);
    const equipmentId = positiveId(body.equipmentId);
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException("Số lượng phải là số nguyên lớn hơn 0.");
    const purpose = requiredText(body.purpose, "Mục đích mượn");
    const borrowDate = validDate(body.borrowDate, "Ngày mượn");
    const expectedReturnDate = validDate(body.expectedReturnDate, "Ngày dự kiến trả");
    if (expectedReturnDate <= borrowDate) throw new BadRequestException("Ngày dự kiến trả phải sau ngày mượn.");
    const equipment = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) throw new NotFoundException("Không tìm thấy thiết bị.");
    if (equipment.status === "Hỏng") throw new ConflictException("Thiết bị đang hỏng, không thể cho mượn.");
    const active = await this.prisma.equipmentBorrowing.aggregate({ where: { equipmentId, status: { in: ACTIVE } }, _sum: { quantity: true } });
    const maintenance = await this.prisma.maintenance.aggregate({ where: { equipmentId, status: "Đang xử lý" }, _sum: { quantity: true } });
    const available = equipment.quantity - (active._sum.quantity ?? 0) - (maintenance._sum.quantity ?? 0);
    if (quantity > available) throw new ConflictException(`Không đủ thiết bị. Hiện còn ${Math.max(0, available)} cái có thể mượn.`);
    const record = await this.prisma.$transaction(async (tx) => {
      const created = await tx.equipmentBorrowing.create({
        data: {
          code: `TMP-${randomUUID()}`,
          equipmentId,
          borrowerId: user.id,
          quantity,
          purpose,
          borrowDate,
          expectedReturnDate,
          note: typeof body.note === "string" && body.note.trim() ? body.note.trim() : null,
          conditionBefore: equipment.status,
          status: "Chờ duyệt",
        },
      });
      return tx.equipmentBorrowing.update({
        where: { id: created.id },
        data: { code: `MTB-${String(created.id).padStart(4, "0")}` },
        include: { equipment: { include: { room: true } }, borrower: { select: { id: true, code: true, name: true, email: true, role: true } } },
      });
    });
    await this.audit.record({ userId: user.id, action: "Tạo phiếu mượn thiết bị", module: "borrowing", objectId: record.id, newValue: { equipmentId, quantity, status: record.status } });
    return { success: true, message: "Tạo phiếu mượn thiết bị thành công.", data: record };
  }

  @Get(":id")
  async getOne(@Req() request: Request, @Param("id") rawId: string) {
    const user = await requireUser(request, this.prisma);
    const id = positiveId(rawId);
    const item = await this.prisma.equipmentBorrowing.findUnique({
      where: { id },
      include: { equipment: { include: { room: true } }, borrower: true, approvedBy: true, returnedBy: true },
    });
    if (!item) throw new NotFoundException("Không tìm thấy phiếu mượn.");
    const manager = FACILITY_MANAGER_ROLES.includes(user.role as (typeof FACILITY_MANAGER_ROLES)[number]);
    if (!manager && item.borrowerId !== user.id) throw new ForbiddenException("Bạn không có quyền xem phiếu mượn này.");
    return { success: true, data: item };
  }

  @Patch(":id")
  async update(@Req() request: Request, @Param("id") rawId: string, @Body() body: any) {
    const actor = await requireUser(request, this.prisma);
    const id = positiveId(rawId);
    const current = await this.prisma.equipmentBorrowing.findUnique({ where: { id }, include: { equipment: true } });
    if (!current) throw new NotFoundException("Không tìm thấy phiếu mượn.");
    const manager = FACILITY_MANAGER_ROLES.includes(actor.role as (typeof FACILITY_MANAGER_ROLES)[number]);

    if (body.action === "edit") {
      if (current.borrowerId !== actor.id && !manager) throw new ForbiddenException("Bạn không có quyền sửa phiếu này.");
      if (current.status !== "Chờ duyệt") throw new ConflictException("Chỉ phiếu chờ duyệt mới được sửa.");
      const equipmentId = positiveId(body.equipmentId);
      const quantity = Number(body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException("Số lượng mượn không hợp lệ.");
      const borrowDate = validDate(body.borrowDate, "Ngày mượn");
      const expectedReturnDate = validDate(body.expectedReturnDate, "Ngày dự kiến trả");
      if (expectedReturnDate <= borrowDate) throw new BadRequestException("Ngày dự kiến trả phải sau ngày mượn.");
      const equipment = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
      if (!equipment || equipment.status === "Hỏng") throw new ConflictException("Thiết bị được chọn không khả dụng.");
      const updated = await this.prisma.equipmentBorrowing.update({
        where: { id },
        data: { equipmentId, quantity, borrowDate, expectedReturnDate, purpose: requiredText(body.purpose, "Mục đích mượn"), note: body.note?.trim() || null },
      });
      await this.audit.record({ userId: actor.id, action: "Sửa phiếu mượn", module: "borrowing", objectId: id, oldValue: current, newValue: updated });
      return { success: true, message: "Đã cập nhật phiếu mượn.", data: updated };
    }

    if (!manager) throw new ForbiddenException("Chỉ cán bộ quản lý mới được xử lý phiếu mượn.");
    const status = requiredText(body.status, "Trạng thái");
    let updateData: any = { status };
    if (status === "Đã duyệt") {
      if (current.status !== "Chờ duyệt") throw new ConflictException("Chỉ phiếu chờ duyệt mới được duyệt.");
      const active = await this.prisma.equipmentBorrowing.aggregate({ where: { equipmentId: current.equipmentId, status: { in: ACTIVE }, id: { not: id } }, _sum: { quantity: true } });
      const maintenance = await this.prisma.maintenance.aggregate({ where: { equipmentId: current.equipmentId, status: "Đang xử lý" }, _sum: { quantity: true } });
      const available = current.equipment.quantity - (active._sum.quantity ?? 0) - (maintenance._sum.quantity ?? 0);
      if (current.quantity > available) throw new ConflictException("Không còn đủ số lượng thiết bị để duyệt phiếu.");
      updateData = { status, approvedById: actor.id, approvedAt: new Date() };
    } else if (status === "Từ chối") {
      if (current.status !== "Chờ duyệt") throw new ConflictException("Chỉ phiếu chờ duyệt mới được từ chối.");
      updateData = { status, note: [current.note, body.rejectionReason].filter(Boolean).join("\nLý do từ chối: ") || current.note };
    } else if (status === "Đang mượn") {
      if (current.status !== "Đã duyệt") throw new ConflictException("Chỉ phiếu đã duyệt mới được bàn giao thiết bị.");
    } else if (status === "Đã trả") {
      if (!["Đang mượn", "Quá hạn"].includes(current.status)) throw new ConflictException("Phiếu này chưa ở trạng thái đang mượn.");
      const conditionAfter = requiredText(body.conditionAfter, "Tình trạng khi trả");
      if (!CONDITIONS.includes(conditionAfter)) throw new BadRequestException("Tình trạng thiết bị khi trả không hợp lệ.");
      updateData = { status, actualReturnDate: new Date(), returnedAt: new Date(), returnedById: actor.id, conditionAfter, returnNote: body.returnNote?.trim() || null };
    } else {
      throw new BadRequestException("Trạng thái phiếu mượn không hợp lệ.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const item = await tx.equipmentBorrowing.update({ where: { id }, data: updateData, include: { equipment: true } });
      if (status === "Đã duyệt") {
        await tx.equipment.update({ where: { id: current.equipmentId }, data: { availableQuantity: { decrement: current.quantity } } });
      }
      if (status === "Đã trả") {
        const equipment = await tx.equipment.findUniqueOrThrow({ where: { id: current.equipmentId } });
        const borrowed = await tx.equipmentBorrowing.aggregate({ where: { equipmentId: equipment.id, status: { in: ACTIVE } }, _sum: { quantity: true } });
        const maintenance = await tx.maintenance.aggregate({ where: { equipmentId: equipment.id, status: "Đang xử lý" }, _sum: { quantity: true } });
        const availableQuantity = Math.max(0, equipment.quantity - (borrowed._sum.quantity ?? 0) - (maintenance._sum.quantity ?? 0));
        await tx.equipment.update({ where: { id: equipment.id }, data: { availableQuantity, status: updateData.conditionAfter } });
        if (updateData.conditionAfter !== "Tốt") {
          await tx.incident.create({ data: { title: `Thiết bị ${equipment.code} được trả trong tình trạng ${updateData.conditionAfter}`, reportedBy: actor.name, reportedById: actor.id, time: new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" }).format(new Date()), severity: updateData.conditionAfter === "Hỏng" ? "Khẩn cấp" : "Trung bình", status: "Mới báo", roomId: equipment.roomId } });
        }
      }
      return item;
    });
    await this.audit.record({ userId: actor.id, action: `Cập nhật phiếu mượn: ${status}`, module: "borrowing", objectId: id, oldValue: { status: current.status }, newValue: { status: updated.status } });
    return { success: true, message: "Đã cập nhật phiếu mượn.", data: updated };
  }

  @Delete(":id")
  async remove(@Req() request: Request, @Param("id") rawId: string) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(rawId);
    const current = await this.prisma.equipmentBorrowing.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Không tìm thấy phiếu mượn.");
    if (current.status !== "Chờ duyệt") throw new ConflictException("Chỉ phiếu chờ duyệt mới được xóa.");
    await this.prisma.equipmentBorrowing.delete({ where: { id } });
    await this.audit.record({ userId: actor.id, action: "Xóa phiếu mượn", module: "borrowing", objectId: id, oldValue: current });
    return { success: true, message: "Đã xóa phiếu mượn." };
  }
}
