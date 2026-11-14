import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Body,
} from "@nestjs/common";
import type { Request } from "express";

import { AuditService } from "../common/audit.js";
import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { notifyRoles } from "../common/notifications.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

const UNBOOKABLE_ROOM_STATUSES = ["Bảo trì", "Tạm khóa", "Ngừng sử dụng"];
const EXCLUDED_BOOKING_STATUSES = ["Từ chối", "Đã hủy", "Đã hoàn thành"];

function parseDate(value: unknown) {
  const date = requiredText(value, "Ngày đặt");
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!match) throw new BadRequestException("Ngày đặt phải có dạng DD/MM/YYYY.");
  const parsed = new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== `${match[3]}-${match[2]}-${match[1]}`) {
    throw new BadRequestException("Ngày đặt không tồn tại.");
  }
  return date;
}

function parseTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)\s*[-–—]\s*([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) throw new BadRequestException("Khung giờ phải có dạng HH:mm–HH:mm.");
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  if (start >= end) throw new BadRequestException("Giờ kết thúc phải sau giờ bắt đầu.");
  return { start, end };
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }) {
  return a.start < b.end && a.end > b.start;
}

@Controller("api/bookings")
export class BookingsController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get()
  async availableRooms(@Req() request: Request, @Query() query: any) {
    await requireUser(request, this.prisma);
    const date = parseDate(query.date);
    const start = requiredText(query.start, "Giờ bắt đầu");
    const end = requiredText(query.end, "Giờ kết thúc");
    const range = parseTime(`${start}-${end}`);
    const attendeeCount = Number(query.attendeeCount);
    if (!Number.isInteger(attendeeCount) || attendeeCount < 1) throw new BadRequestException("Số người tham dự không hợp lệ.");
    const [rooms, bookings] = await Promise.all([
      this.prisma.room.findMany({ where: { status: { notIn: UNBOOKABLE_ROOM_STATUSES }, capacity: { gte: attendeeCount } }, orderBy: [{ capacity: "asc" }, { code: "asc" }] }),
      this.prisma.booking.findMany({ where: { date, status: { notIn: EXCLUDED_BOOKING_STATUSES } }, select: { roomId: true, time: true } }),
    ]);
    const busy = new Set(bookings.filter((item) => {
      try { return overlaps(range, parseTime(item.time)); } catch { return false; }
    }).map((item) => item.roomId));
    return { data: rooms.filter((room) => !busy.has(room.id)).map(({ id, code, name, capacity, status }) => ({ id, code, name, capacity, status })) };
  }

  @Post()
  async create(@Req() request: Request, @Body() body: any) {
    const user = await requireUser(request, this.prisma);
    const date = parseDate(body.date);
    const time = requiredText(body.time, "Khung giờ");
    parseTime(time);
    const roomCode = requiredText(body.room, "Phòng").toUpperCase();
    const course = requiredText(body.course, "Môn học hoặc mục đích");
    const attendeeCount = Number(body.attendeeCount ?? 1);
    if (!Number.isInteger(attendeeCount) || attendeeCount < 1) throw new BadRequestException("Số người tham dự không hợp lệ.");
    const room = await this.prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) throw new NotFoundException("Không tìm thấy phòng được chọn.");
    if (UNBOOKABLE_ROOM_STATUSES.includes(room.status)) throw new ConflictException(`Không thể đặt phòng đang ở trạng thái ${room.status}.`);
    if (room.capacity < attendeeCount) throw new ConflictException(`Phòng chỉ có sức chứa ${room.capacity} người.`);
    await this.assertNoConflict(room.id, date, time);
    const booking = await this.prisma.booking.create({
      data: {
        date, time, course, person: user.name,
        attendeeCount,
        note: typeof body.note === "string" && body.note.trim() ? body.note.trim() : null,
        status: "Chờ duyệt", roomId: room.id, userId: user.id,
      },
      include: { room: true },
    });
    await this.audit.record({ userId: user.id, action: "Tạo yêu cầu đặt phòng", module: "booking", objectId: booking.id, newValue: { room: room.code, date, time, status: booking.status } });
    await notifyRoles(this.prisma, [...FACILITY_MANAGER_ROLES], {
      title: "Yêu cầu đặt phòng mới",
      message: `${user.name} đăng ký ${room.code} ngày ${date}, ${time}.`,
      type: "booking",
      referenceType: "booking",
      referenceId: booking.id,
    });
    return { message: "Đã gửi yêu cầu đặt phòng.", booking: this.mapBooking(booking) };
  }

  @Patch()
  async update(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma);
    const id = positiveId(body.id);
    const current = await this.prisma.booking.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Không tìm thấy yêu cầu đặt phòng.");
    const canManage = FACILITY_MANAGER_ROLES.includes(actor.role as (typeof FACILITY_MANAGER_ROLES)[number]);

    if (body.action === "cancel") {
      if (!canManage && current.userId !== actor.id) throw new ForbiddenException("Bạn chỉ có thể hủy yêu cầu của mình.");
      if (!["Chờ duyệt", "Đã duyệt"].includes(current.status)) throw new ConflictException("Chỉ yêu cầu chờ duyệt hoặc đã duyệt mới có thể hủy.");
      const updated = await this.prisma.booking.update({ where: { id }, data: { status: "Đã hủy", cancelledAt: new Date() } });
      await this.audit.record({ userId: actor.id, action: "Hủy yêu cầu đặt phòng", module: "booking", objectId: id, oldValue: { status: current.status }, newValue: { status: updated.status } });
      return { message: "Đã hủy yêu cầu đặt phòng." };
    }
    if (!canManage) throw new ForbiddenException("Bạn không có quyền cập nhật yêu cầu đặt phòng.");

    if (body.status !== undefined && body.date === undefined) {
      const status = requiredText(body.status, "Trạng thái");
      if (!["Đã duyệt", "Từ chối", "Đã hoàn thành"].includes(status)) throw new BadRequestException("Trạng thái lịch đặt không hợp lệ.");
      if (["Đã duyệt", "Từ chối"].includes(status) && current.status !== "Chờ duyệt") throw new ConflictException("Chỉ yêu cầu đang chờ duyệt mới có thể được xử lý.");
      const rejectionReason = status === "Từ chối" ? requiredText(body.rejectionReason, "Lý do từ chối") : null;
      if (status === "Đã duyệt") await this.assertNoConflict(current.roomId, current.date, current.time, id);
      if (status === "Đã hoàn thành" && current.status !== "Đã duyệt") throw new ConflictException("Chỉ yêu cầu đã duyệt mới có thể hoàn thành.");
      const booking = await this.prisma.booking.update({
        where: { id },
        data: {
          status,
          ...(status === "Đã duyệt" || status === "Từ chối" ? { approvedById: actor.id, approvedAt: new Date() } : {}),
          rejectionReason: status === "Từ chối" ? rejectionReason : null,
          ...(status === "Đã hoàn thành" ? { completedAt: new Date() } : {}),
        },
        include: { room: true },
      });
      await this.audit.record({ userId: actor.id, action: `Cập nhật trạng thái đặt phòng: ${status}`, module: "booking", objectId: id, oldValue: { status: current.status }, newValue: { status: booking.status, rejectionReason: booking.rejectionReason } });
      return { message: "Cập nhật trạng thái thành công.", booking: this.mapBooking(booking) };
    }

    const date = parseDate(body.date);
    const time = requiredText(body.time, "Khung giờ");
    parseTime(time);
    const roomCode = requiredText(body.room, "Phòng").toUpperCase();
    const course = requiredText(body.course, "Môn học hoặc mục đích");
    const attendeeCount = Number(body.attendeeCount ?? current.attendeeCount);
    if (!Number.isInteger(attendeeCount) || attendeeCount < 1) throw new BadRequestException("Số người tham dự không hợp lệ.");
    const room = await this.prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) throw new NotFoundException("Không tìm thấy phòng được chọn.");
    if (UNBOOKABLE_ROOM_STATUSES.includes(room.status)) throw new ConflictException("Không thể đặt phòng đang bị khóa hoặc bảo trì.");
    if (room.capacity < attendeeCount) throw new ConflictException("Sức chứa phòng không đủ.");
    await this.assertNoConflict(room.id, date, time, id);
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { date, time, roomId: room.id, course, person: current.person, attendeeCount, note: body.note?.trim() || null, status: "Chờ duyệt", approvedById: null, approvedAt: null, rejectionReason: null },
      include: { room: true },
    });
    await this.audit.record({ userId: actor.id, action: "Sửa yêu cầu đặt phòng", module: "booking", objectId: id, oldValue: current, newValue: booking });
    return { message: "Đã cập nhật lịch đặt. Lịch cần được duyệt lại.", booking: this.mapBooking(booking) };
  }

  @Delete()
  async remove(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, FACILITY_MANAGER_ROLES);
    const id = positiveId(body.id);
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { room: true } });
    if (!booking) throw new NotFoundException("Không tìm thấy lịch đặt phòng.");
    await this.prisma.booking.delete({ where: { id } });
    await this.audit.record({ userId: actor.id, action: "Xóa yêu cầu đặt phòng", module: "booking", objectId: id, oldValue: booking });
    return { message: `Đã xóa lịch đặt “${booking.course}”.` };
  }

  private async assertNoConflict(roomId: number, date: string, time: string, excludeId?: number) {
    const requested = parseTime(time);
    const existing = await this.prisma.booking.findMany({
      where: { roomId, date, status: { notIn: EXCLUDED_BOOKING_STATUSES }, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { time: true },
    });
    for (const booking of existing) {
      try { if (overlaps(requested, parseTime(booking.time))) throw new ConflictException("Phòng đã có lịch đặt trùng khung giờ này."); } catch (error) { if (error instanceof ConflictException) throw error; }
    }
  }

  private mapBooking(booking: any) {
    return { id: booking.id, date: booking.date, time: booking.time, room: booking.room.code, course: booking.course, person: booking.person, status: booking.status };
  }
}
