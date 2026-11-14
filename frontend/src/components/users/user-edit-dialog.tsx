"use client";

import { useState } from "react";
import { toast } from "sonner";

import type {
  SystemUser,
  UserRole,
} from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserEditDialogProps = {
  user: SystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: SystemUser) => Promise<boolean>;
};

const ROLES: UserRole[] = [
  "Quản trị viên",
  "Cán bộ thiết bị",
  "Giảng viên",
  "Sinh viên",
];

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: UserEditDialogProps) {
  const [code, setCode] = useState(() => user?.code ?? "");
  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [department, setDepartment] = useState(
    () => user?.department ?? "",
  );
  const [role, setRole] = useState<UserRole>(
    () => user?.role ?? "Sinh viên",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const trimmedEmail = email
      .trim()
      .toLowerCase();
    const trimmedDepartment =
      department.trim();

    if (!trimmedCode) {
      toast.error(
        "Vui lòng nhập mã người dùng.",
      );
      return;
    }

    if (!trimmedName) {
      toast.error(
        "Vui lòng nhập họ tên.",
      );
      return;
    }

    if (!trimmedEmail) {
      toast.error(
        "Vui lòng nhập email.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      toast.error(
        "Email không hợp lệ.",
      );
      return;
    }

    if (!trimmedDepartment) {
      toast.error(
        "Vui lòng nhập đơn vị.",
      );
      return;
    }

    setSaving(true);

    try {
      const saved = await onSave({
        ...user,
        code: trimmedCode,
        name: trimmedName,
        email: trimmedEmail,
        department: trimmedDepartment,
        role,
      });

      if (saved) {
        toast.success(
          "Đã cập nhật người dùng.",
        );

        onOpenChange(false);
      }
    } catch {
      toast.error(
        "Không thể cập nhật người dùng.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDialogChange(
    value: boolean,
  ) {
    if (saving) {
      return;
    }

    onOpenChange(value);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogChange}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            Chỉnh sửa người dùng
          </DialogTitle>

          <DialogDescription>
            Cập nhật thông tin và vai trò tài
            khoản.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-edit-code">
                Mã người dùng
              </Label>

              <Input
                id="user-edit-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                placeholder="VD: GV001"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-edit-name">
                Họ tên
              </Label>

              <Input
                id="user-edit-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Nguyễn Văn A"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-edit-email">
              Email
            </Label>

            <Input
              id="user-edit-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@school.edu.vn"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-edit-department">
              Đơn vị
            </Label>

            <Input
              id="user-edit-department"
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value,
                )
              }
              placeholder="Khoa Công nghệ thông tin"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-edit-role">
              Vai trò
            </Label>

            <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as UserRole)
              }
              disabled={saving}
            >
              <SelectTrigger
                id="user-edit-role"
                className="w-full"
              >
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>

              <SelectContent>
                {ROLES.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">
              Trạng thái tài khoản
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {user?.status ?? "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Sử dụng nút Khóa / Mở khóa ở danh
              sách để thay đổi trạng thái.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}