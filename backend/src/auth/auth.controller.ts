import { compare, hash } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { PrismaService } from "../prisma.service.js";
import {
  ADMIN_ROLES,
  hashSessionToken,
  requireUser,
  SESSION_COOKIE_NAME,
} from "../common/auth.js";
import { AuditService } from "../common/audit.js";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Post("login")
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const loginName = typeof body?.loginName === "string" ? body.loginName.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!loginName || !password) {
      throw new HttpException("Vui lòng nhập tài khoản và mật khẩu.", HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.systemUser.findFirst({
      where: {
        OR: [
          { email: loginName.toLowerCase() },
          { code: loginName.toUpperCase() },
        ],
      },
    });
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new HttpException("Tài khoản hoặc mật khẩu không chính xác.", HttpStatus.UNAUTHORIZED);
    }
    if (user.status !== "Hoạt động") {
      throw new HttpException("Tài khoản này đã bị khóa.", HttpStatus.FORBIDDEN);
    }

    const now = new Date();
    const lastLogin = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);
    await this.prisma.systemUser.update({ where: { id: user.id }, data: { lastLogin } });
    const token = randomBytes(32).toString("hex");
    await this.prisma.session.create({
      data: {
        tokenHash: createHash("sha256").update(token).digest("hex"),
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
      },
    });
    response.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000,
    });
    return {
      message: "Đăng nhập thành công.",
      user: this.publicUser(user, lastLogin),
    };
  }

  @Get("me")
  async me(@Req() request: Request) {
    const user = await requireUser(request, this.prisma);
    return { user: this.publicUser(user, user.lastLogin ?? "Chưa đăng nhập") };
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (token) {
      await this.prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    }
    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return { message: "Đăng xuất thành công." };
  }

  @Post("change-password")
  async resetPassword(@Req() request: Request, @Body() body: any) {
    const actor = await requireUser(request, this.prisma, ADMIN_ROLES);
    const userId = Number(body?.userId);
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpException("Tài khoản cần đặt lại mật khẩu không hợp lệ.", HttpStatus.BAD_REQUEST);
    }
    if (newPassword.length < 8 || newPassword.length > 128 || newPassword !== confirmPassword) {
      throw new HttpException("Mật khẩu phải dài 8–128 ký tự và xác nhận phải khớp.", HttpStatus.BAD_REQUEST);
    }
    const target = await this.prisma.systemUser.findUnique({ where: { id: userId } });
    if (!target) throw new HttpException("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
    await this.prisma.$transaction([
      this.prisma.systemUser.update({ where: { id: userId }, data: { passwordHash: await hash(newPassword, 12) } }),
      this.prisma.session.deleteMany({ where: { userId } }),
    ]);
    if (actor.id === userId) {
      const token = randomBytes(32).toString("hex");
      await this.prisma.session.create({
        data: { tokenHash: hashSessionToken(token), userId, expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000) },
      });
      // This endpoint is normally used for another account; self-reset is intentionally not exposed in the UI.
    }
    await this.audit.record({
      userId: actor.id,
      action: "Quản trị đặt lại mật khẩu",
      module: "auth",
      objectId: userId,
      newValue: { targetUserCode: target.code },
    });
    return { message: `Đã đặt lại mật khẩu cho tài khoản ${target.code}.` };
  }

  private publicUser(user: any, lastLogin: string) {
    return {
      id: String(user.id),
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      lastLogin,
    };
  }
}
