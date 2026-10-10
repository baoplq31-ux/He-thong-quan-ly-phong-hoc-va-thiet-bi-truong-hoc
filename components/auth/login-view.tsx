"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  SystemUser,
  UserRole,
} from "@/types";

type LoginViewProps = {
  users: SystemUser[];
  onLogin: (user: SystemUser) => void;
};

const DEMO_PASSWORD = "123456";

const demoRoles: UserRole[] = [
  "Quản trị viên",
  "Cán bộ thiết bị",
  "Giảng viên",
  "Sinh viên",
];

export function LoginView({
  users,
  onLogin,
}: LoginViewProps) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const demoAccounts = demoRoles
    .map((role) =>
      users.find(
        (user) =>
          user.role === role &&
          user.status === "Hoạt động",
      ),
    )
    .filter(
      (user): user is SystemUser =>
        user !== undefined,
    );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedLogin = loginName
      .trim()
      .toLowerCase();

    if (!normalizedLogin || !password) {
      toast.error(
        "Vui lòng nhập tài khoản và mật khẩu",
      );
      return;
    }

    const account = users.find(
      (user) =>
        user.email.toLowerCase() === normalizedLogin ||
        user.code.toLowerCase() === normalizedLogin,
    );

    if (!account) {
      toast.error("Tài khoản không tồn tại");
      return;
    }

    if (account.status === "Đã khóa") {
      toast.error("Tài khoản này đã bị khóa");
      return;
    }

    if (password !== DEMO_PASSWORD) {
      toast.error("Mật khẩu không chính xác");
      return;
    }

    onLogin(account);
    toast.success(`Xin chào ${account.name}`);
  }

  function selectDemoAccount(user: SystemUser) {
    setLoginName(user.email);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-20 size-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 size-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600">
            <Building2 className="size-6" />
          </div>

          <div>
            <p className="text-xl font-semibold">
              EduFacility
            </p>
            <p className="text-sm text-slate-400">
              Quản lý cơ sở vật chất
            </p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck className="size-7 text-blue-400" />
          </div>

          <h1 className="text-4xl font-semibold leading-tight">
            Quản lý phòng học và thiết bị trong một hệ thống
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Theo dõi phòng học, thiết bị, lịch đăng ký,
            sự cố và báo cáo thống kê theo từng vai trò.
          </p>
        </div>

        <p className="relative text-sm text-slate-500">
          Đồ án hệ thống thông tin · EduFacility 2026
        </p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-lg">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Building2 className="size-5" />
            </div>

            <div>
              <p className="font-semibold">EduFacility</p>
              <p className="text-xs text-slate-500">
                Quản lý cơ sở vật chất
              </p>
            </div>
          </div>

          <Card className="border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <CardTitle className="text-2xl">
                Đăng nhập hệ thống
              </CardTitle>

              <CardDescription>
                Nhập email hoặc mã người dùng để tiếp tục.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-name">
                    Email hoặc mã người dùng
                  </Label>

                  <Input
                    id="login-name"
                    placeholder="QT001 hoặc email"
                    autoComplete="username"
                    value={loginName}
                    onChange={(event) =>
                      setLoginName(event.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mật khẩu
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      className="pr-11"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                >
                  Đăng nhập
                </Button>
              </form>

              <div className="mt-7 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Tài khoản dùng thử
                  </p>

                  <p className="text-xs text-slate-500">
                    Mật khẩu:{" "}
                    <span className="font-semibold">
                      123456
                    </span>
                  </p>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {demoAccounts.map((user) => (
                    <Button
                      key={user.id}
                      type="button"
                      variant="outline"
                      className="h-auto justify-start px-3 py-2 text-left"
                      onClick={() =>
                        selectDemoAccount(user)
                      }
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {user.role}
                        </span>
                        <span className="block truncate text-xs font-normal text-slate-500">
                          {user.code}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}