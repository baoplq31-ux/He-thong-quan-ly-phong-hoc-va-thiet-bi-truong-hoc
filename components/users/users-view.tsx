"use client";

import { useMemo, useState } from "react";
import {
  CircleCheckBig,
  Lock,
  SearchX,
  Shield,
  Unlock,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { UserFormDialog } from "./user-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  SystemUser,
  UserRole,
  UserStatus,
} from "@/types";

type UsersViewProps = {
  users: SystemUser[];
  search: string;
  currentUserId: number;
  onAddUser: (user: SystemUser) => void;
  onUpdateStatus: (
    id: number,
    status: UserStatus,
  ) => void;
};

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | UserStatus;

function getRoleClass(role: UserRole) {
  switch (role) {
    case "Quản trị viên":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "Cán bộ thiết bị":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Giảng viên":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Sinh viên":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getStatusClass(status: UserStatus) {
  return status === "Hoạt động"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
}

export function UsersView({
  users,
  search,
  currentUserId,
  onAddUser,
  onUpdateStatus,
}: UsersViewProps) {
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        user.status === statusFilter;

      const matchesSearch =
        !keyword ||
        [
          user.code,
          user.name,
          user.email,
          user.role,
          user.department,
          user.status,
        ].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      return (
        matchesRole &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [roleFilter, search, statusFilter, users]);

  const activeUsers = users.filter(
    (user) => user.status === "Hoạt động",
  ).length;

  const lockedUsers = users.filter(
    (user) => user.status === "Đã khóa",
  ).length;

  const administrators = users.filter(
    (user) => user.role === "Quản trị viên",
  ).length;

  const summaries = [
    {
      title: "Tổng người dùng",
      value: users.length,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Đang hoạt động",
      value: activeUsers,
      icon: CircleCheckBig,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Quản trị viên",
      value: administrators,
      icon: Shield,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Tài khoản khóa",
      value: lockedUsers,
      icon: Lock,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  const rolePermissions = [
    {
      role: "Quản trị viên" as UserRole,
      permissions: [
        "Toàn quyền hệ thống",
        "Quản lý người dùng",
        "Xem báo cáo",
      ],
    },
    {
      role: "Cán bộ thiết bị" as UserRole,
      permissions: [
        "Quản lý phòng",
        "Quản lý thiết bị",
        "Xử lý sự cố",
      ],
    },
    {
      role: "Giảng viên" as UserRole,
      permissions: [
        "Đặt phòng",
        "Xem lịch sử dụng",
        "Báo sự cố",
      ],
    },
    {
      role: "Sinh viên" as UserRole,
      permissions: [
        "Xem phòng học",
        "Xem lịch",
        "Báo sự cố",
      ],
    },
  ];

  function toggleUserStatus(user: SystemUser) {
    if (user.id === currentUserId) {
      toast.error("Bạn không thể khóa tài khoản đang đăng nhập");
      return;
    }

    const newStatus: UserStatus =
      user.status === "Hoạt động"
        ? "Đã khóa"
        : "Hoạt động";

    onUpdateStatus(user.id, newStatus);

    toast.success(
      newStatus === "Đã khóa"
        ? `Đã khóa tài khoản ${user.code}`
        : `Đã mở khóa tài khoản ${user.code}`,
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Quản lý người dùng
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản, trạng thái và vai trò.
          </p>
        </div>

        <UserFormDialog
          users={users}
          onAddUser={onAddUser}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <p className="text-2xl font-semibold">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <CardTitle>Danh sách người dùng</CardTitle>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as RoleFilter)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Tất cả vai trò
                </SelectItem>
                <SelectItem value="Quản trị viên">
                  Quản trị viên
                </SelectItem>
                <SelectItem value="Cán bộ thiết bị">
                  Cán bộ thiết bị
                </SelectItem>
                <SelectItem value="Giảng viên">
                  Giảng viên
                </SelectItem>
                <SelectItem value="Sinh viên">
                  Sinh viên
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as StatusFilter)
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Tất cả trạng thái
                </SelectItem>
                <SelectItem value="Hoạt động">
                  Hoạt động
                </SelectItem>
                <SelectItem value="Đã khóa">
                  Đã khóa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Đăng nhập gần nhất</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.code}
                    </TableCell>

                    <TableCell className="min-w-60">
                      <p className="font-medium text-slate-950">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.email}
                      </p>
                    </TableCell>

                    <TableCell className="min-w-48">
                      {user.department}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleClass(user.role)}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="min-w-40 text-slate-500">
                      {user.lastLogin}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusClass(
                          user.status,
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={user.id === currentUserId}
                        onClick={() =>
                          toggleUserStatus(user)
                        }
                      >
                        {user.id === currentUserId ? (
                          <>
                            <Shield className="size-3.5" />
                            Đang dùng
                          </>
                        ) : user.status === "Hoạt động" ? (
                          <>
                            <Lock className="size-3.5" />
                            Khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="size-3.5" />
                            Mở khóa
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-52">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <SearchX className="size-8" />
                        <p>
                          Không tìm thấy người dùng phù hợp
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phân quyền theo vai trò</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rolePermissions.map((item) => (
            <div
              key={item.role}
              className="rounded-xl border border-slate-200 p-4"
            >
              <Badge
                variant="outline"
                className={getRoleClass(item.role)}
              >
                {item.role}
              </Badge>

              <ul className="mt-4 space-y-2">
                {item.permissions.map((permission) => (
                  <li
                    key={permission}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
