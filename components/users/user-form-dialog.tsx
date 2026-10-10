"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type {
  SystemUser,
  UserRole,
} from "@/types";

type UserFormDialogProps = {
  users: SystemUser[];
  onAddUser: (user: SystemUser) => void;
};

type FormState = {
  code: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
};

function createInitialForm(): FormState {
  return {
    code: "",
    name: "",
    email: "",
    role: "Giảng viên",
    department: "",
  };
}

export function UserFormDialog({
  users,
  onAddUser,
}: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(
    createInitialForm(),
  );

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(createInitialForm());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = form.code.trim().toUpperCase();
    const normalizedEmail = form.email
      .trim()
      .toLowerCase();

    if (
      !normalizedCode ||
      !form.name.trim() ||
      !normalizedEmail ||
      !form.department.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      toast.error("Địa chỉ email không hợp lệ");
      return;
    }

    const duplicatedCode = users.some(
      (user) =>
        user.code.toLowerCase() ===
        normalizedCode.toLowerCase(),
    );

    if (duplicatedCode) {
      toast.error("Mã người dùng đã tồn tại");
      return;
    }

    const duplicatedEmail = users.some(
      (user) =>
        user.email.toLowerCase() === normalizedEmail,
    );

    if (duplicatedEmail) {
      toast.error("Email đã được sử dụng");
      return;
    }

    const nextId =
      users.length > 0
        ? Math.max(...users.map((user) => user.id)) + 1
        : 1;

    const newUser: SystemUser = {
      id: nextId,
      code: normalizedCode,
      name: form.name.trim(),
      email: normalizedEmail,
      role: form.role,
      department: form.department.trim(),
      status: "Hoạt động",
      lastLogin: "Chưa đăng nhập",
    };

    onAddUser(newUser);
    toast.success("Đã thêm người dùng mới");

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="size-4" />
            Thêm người dùng
          </Button>
        }
      />
        <Button className="gap-2">
          <Plus className="size-4" />
          Thêm người dùng
        </Button>
      

      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Thêm người dùng mới
            </DialogTitle>

            <DialogDescription>
              Tạo tài khoản và phân vai trò trong hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-code">
                Mã người dùng
              </Label>

              <Input
                id="user-code"
                placeholder="Ví dụ: GV003"
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-name">
                Họ và tên
              </Label>

              <Input
                id="user-name"
                placeholder="Nhập họ và tên"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="user-email">Email</Label>

              <Input
                id="user-email"
                type="email"
                placeholder="example@edufacility.edu.vn"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Vai trò</Label>

              <Select
                value={form.role}
                onValueChange={(value) =>
                  updateField("role", value as UserRole)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Đơn vị/Khoa
              </Label>

              <Input
                id="department"
                placeholder="Ví dụ: Khoa CNTT"
                value={form.department}
                onChange={(event) =>
                  updateField(
                    "department",
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>

            <Button type="submit">
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}