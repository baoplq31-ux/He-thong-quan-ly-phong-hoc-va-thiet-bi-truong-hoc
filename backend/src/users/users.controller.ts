import { BadRequestException, ConflictException, Controller, Delete, Patch, Post, Body, Req } from "@nestjs/common";
import { hash } from "bcryptjs";
import type { Request } from "express";
import { AuditService } from "../common/audit.js";
import { ADMIN_ROLES, requireUser } from "../common/auth.js";
import { positiveId, requiredText } from "../common/validation.js";
import { PrismaService } from "../prisma.service.js";

const ROLES = ["Quản trị viên", "Cán bộ thiết bị", "Giảng viên", "Sinh viên"];
const STATUSES = ["Hoạt động", "Đã khóa"];
@Controller("api/users")
export class UsersController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}
  @Post() async create(@Req() req: Request, @Body() b: any) {
    const actor = await requireUser(req, this.prisma, ADMIN_ROLES);
    const code = requiredText(b.code, "Mã người dùng").toUpperCase(), name = requiredText(b.name, "Họ tên"), email = requiredText(b.email, "Email").toLowerCase(), role = requiredText(b.role, "Vai trò"), department = requiredText(b.department, "Đơn vị");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException("Email không hợp lệ.");
    if (!ROLES.includes(role)) throw new BadRequestException("Vai trò không hợp lệ.");
    const user = await this.prisma.systemUser.create({ data: { code, name, email, role, department, passwordHash: await hash("123456", 10), status: "Hoạt động" } });
    await this.audit.record({ userId: actor.id, action: "Tạo tài khoản", module: "user", objectId: user.id, newValue: { code, name, email, role, department } });
    return { success: true, message: "Đã thêm người dùng." };
  }
  @Patch() async update(@Req() req: Request, @Body() b: any) {
    const actor = await requireUser(req, this.prisma, ADMIN_ROLES), id = positiveId(b.id);
    const data: any = {};
    for (const key of ["code", "name", "email", "role", "department", "status"]) if (b[key] !== undefined) data[key] = requiredText(b[key], key).trim();
    if (data.code) data.code = data.code.toUpperCase(); if (data.email) data.email = data.email.toLowerCase();
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new BadRequestException("Email không hợp lệ.");
    if (data.role && !ROLES.includes(data.role)) throw new BadRequestException("Vai trò không hợp lệ.");
    if (data.status && !STATUSES.includes(data.status)) throw new BadRequestException("Trạng thái tài khoản không hợp lệ.");
    if (!Object.keys(data).length) throw new BadRequestException("Không có dữ liệu cần cập nhật.");
    if (id === actor.id && data.status === "Đã khóa") throw new BadRequestException("Bạn không thể khóa tài khoản đang đăng nhập.");
    const old = await this.prisma.systemUser.findUnique({ where: { id }, select: { code: true, name: true, email: true, role: true, department: true, status: true } });
    if (!old) throw new BadRequestException("Không tìm thấy người dùng.");
    const updated = await this.prisma.$transaction(async tx => { const item = await tx.systemUser.update({ where: { id }, data }); if (data.status === "Đã khóa") await tx.session.deleteMany({ where: { userId: id } }); return item; });
    await this.audit.record({ userId: actor.id, action: "Cập nhật tài khoản", module: "user", objectId: id, oldValue: old, newValue: data });
    return { success: true, message: "Đã cập nhật thông tin người dùng.", data: updated };
  }
  @Delete() async remove(@Req() req: Request, @Body() b: any) {
    const actor = await requireUser(req, this.prisma, ADMIN_ROLES), id = positiveId(b.id);
    if (id === actor.id) throw new BadRequestException("Bạn không thể xóa tài khoản đang đăng nhập.");
    const user = await this.prisma.systemUser.findUnique({ where: { id }, select: { code: true, name: true, email: true, role: true, department: true, status: true } });
    if (!user) throw new BadRequestException("Không tìm thấy người dùng.");
    try { await this.prisma.$transaction(async tx => { await tx.session.deleteMany({ where: { userId: id } }); await tx.systemUser.delete({ where: { id } }); }); }
    catch { throw new ConflictException("Không thể xóa người dùng đang được tham chiếu bởi dữ liệu hệ thống."); }
    await this.audit.record({ userId: actor.id, action: "Xóa tài khoản", module: "user", objectId: id, oldValue: user });
    return { success: true, message: "Đã xóa người dùng." };
  }
}
