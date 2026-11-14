import { BadRequestException, Controller, Delete, ForbiddenException, Get, Post, Patch, Body, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuditService } from "../common/audit.js";
import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { notifyRoles } from "../common/notifications.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

const SEVERITIES = ["Thấp", "Trung bình", "Khẩn cấp"];
const STATUSES = ["Mới báo", "Đang xử lý", "Đã xử lý"];

@Controller("api/incidents")
export class IncidentsController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const user = await requireUser(req, this.prisma);
    const title = requiredText(body.title, "Nội dung sự cố");
    const roomCode = requiredText(body.location, "Phòng xảy ra sự cố").toUpperCase();
    const severity = requiredText(body.severity, "Mức độ");
    if (!SEVERITIES.includes(severity)) throw new BadRequestException("Mức độ sự cố không hợp lệ.");
    const room = await this.prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) throw new BadRequestException(`Không tìm thấy phòng ${roomCode}.`);
    const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
    const incident = await this.prisma.incident.create({ data: { title, roomId: room.id, reportedBy: user.name, reportedById: user.id, time, severity, status: "Mới báo" } });
    await this.audit.record({ userId: user.id, action: "Tạo báo cáo sự cố", module: "incident", objectId: incident.id, newValue: incident });
    await notifyRoles(this.prisma, [...FACILITY_MANAGER_ROLES], { title: "Sự cố mới", message: `${room.code}: ${title}`, type: "incident", referenceType: "incident", referenceId: incident.id });
    return { success: true, message: "Đã ghi nhận sự cố.", data: incident };
  }

  @Patch()
  async update(@Req() req: Request, @Body() body: any) {
    const user = await requireUser(req, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const current = await this.prisma.incident.findUnique({ where: { id } });
    if (!current) throw new BadRequestException("Không tìm thấy sự cố.");
    let data: any;
    if (body.status !== undefined && body.title === undefined && body.location === undefined && body.reportedBy === undefined && body.severity === undefined) {
      if (!STATUSES.includes(body.status)) throw new BadRequestException("Trạng thái sự cố không hợp lệ.");
      data = { status: body.status };
    } else {
      const severity = requiredText(body.severity, "Mức độ");
      if (!SEVERITIES.includes(severity)) throw new BadRequestException("Mức độ sự cố không hợp lệ.");
      const roomCode = requiredText(body.location, "Phòng xảy ra sự cố").toUpperCase();
      const room = await this.prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) throw new BadRequestException(`Không tìm thấy phòng ${roomCode}.`);
      data = { title: requiredText(body.title, "Nội dung sự cố"), roomId: room.id, reportedBy: requiredText(body.reportedBy, "Người báo sự cố"), severity };
    }
    const updated = await this.prisma.incident.update({ where: { id }, data });
    await this.audit.record({ userId: user.id, action: "Cập nhật sự cố", module: "incident", objectId: id, oldValue: current, newValue: updated });
    return { success: true, message: "Đã cập nhật sự cố.", data: updated };
  }

  @Delete()
  async remove(@Req() req: Request, @Body() body: any) {
    const user = await requireUser(req, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const current = await this.prisma.incident.findUnique({ where: { id } });
    if (!current) throw new BadRequestException("Không tìm thấy sự cố.");
    await this.prisma.incident.delete({ where: { id } });
    await this.audit.record({ userId: user.id, action: "Xóa sự cố", module: "incident", objectId: id, oldValue: current });
    return { success: true, message: "Đã xóa sự cố." };
  }
}
