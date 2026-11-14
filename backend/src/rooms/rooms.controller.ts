import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Body,
} from "@nestjs/common";
import type { Request } from "express";

import { AuditService } from "../common/audit.js";
import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

const ROOM_STATUSES = ["Đang trống", "Đang sử dụng", "Bảo trì", "Tạm khóa", "Ngừng sử dụng"];

@Controller("api/rooms")
export class RoomsController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Post()
  async create(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const code = requiredText(body.code, "Mã phòng").toUpperCase();
    const name = requiredText(body.name, "Tên phòng");
    const building = requiredText(body.building, "Tòa nhà");
    const floor = requiredText(body.floor, "Tầng");
    const type = requiredText(body.type, "Loại phòng");
    const status = requiredText(body.status, "Trạng thái");
    const capacity = Number(body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) throw new BadRequestException("Sức chứa phải là số nguyên lớn hơn 0.");
    if (!ROOM_STATUSES.includes(status)) throw new BadRequestException("Trạng thái phòng không hợp lệ.");
    if (await this.prisma.room.findUnique({ where: { code } })) throw new ConflictException("Mã phòng đã tồn tại.");
    const room = await this.prisma.room.create({
      data: { code, name, building, floor, type, capacity, status, equipmentCount: Math.max(0, Number(body.equipmentCount) || 0) },
    });
    await this.audit.record({ userId: actor.id, action: "Tạo phòng học", module: "room", objectId: room.id, newValue: room });
    return { message: "Thêm phòng thành công.", room };
  }

  @Patch()
  async update(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const current = await this.prisma.room.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Không tìm thấy phòng học.");
    const code = requiredText(body.code, "Mã phòng").toUpperCase();
    const name = requiredText(body.name, "Tên phòng");
    const building = requiredText(body.building, "Tòa nhà");
    const floor = requiredText(body.floor, "Tầng");
    const type = requiredText(body.type, "Loại phòng");
    const status = requiredText(body.status, "Trạng thái");
    const capacity = Number(body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) throw new BadRequestException("Sức chứa phải là số nguyên lớn hơn 0.");
    if (!ROOM_STATUSES.includes(status)) throw new BadRequestException("Trạng thái phòng không hợp lệ.");
    const duplicate = await this.prisma.room.findFirst({ where: { code, NOT: { id } } });
    if (duplicate) throw new ConflictException("Mã phòng đã tồn tại.");
    const room = await this.prisma.room.update({ where: { id }, data: { code, name, building, floor, type, capacity, status } });
    await this.audit.record({ userId: actor.id, action: "Cập nhật phòng học", module: "room", objectId: id, oldValue: current, newValue: room });
    return { message: "Cập nhật phòng học thành công.", room };
  }

  @Delete()
  async remove(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const room = await this.prisma.room.findUnique({ where: { id }, include: { _count: { select: { equipments: true, bookings: true, incidents: true } } } });
    if (!room) throw new NotFoundException("Không tìm thấy phòng học.");
    if (room._count.equipments || room._count.bookings || room._count.incidents) throw new ConflictException("Không thể xóa phòng đang có dữ liệu liên quan.");
    await this.prisma.room.delete({ where: { id } });
    await this.audit.record({ userId: actor.id, action: "Xóa phòng học", module: "room", objectId: id, oldValue: room });
    return { message: `Đã xóa phòng ${room.code}.` };
  }
}
