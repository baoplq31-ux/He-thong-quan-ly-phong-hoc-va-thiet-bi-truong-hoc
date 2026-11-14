"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

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
import type { SystemUser } from "@/types";

type ChangePasswordDialogProps = {
  user: SystemUser;
  onReset: (
    userId: number,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
};

export function ChangePasswordDialog({
  user,
  onReset,
}: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (await onReset(user.id, newPassword, confirmPassword)) {
        toast.success(`Đã đặt lại mật khẩu cho ${user.name}.`);
        setNewPassword("");
        setConfirmPassword("");
        setOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="outline"
        title={`Đặt lại mật khẩu: ${user.name}`}
        aria-label={`Đặt lại mật khẩu: ${user.name}`}
        onClick={() => setOpen(true)}
      >
        <KeyRound className="size-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isSaving) setOpen(nextOpen);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Đặt lại mật khẩu</DialogTitle>
              <DialogDescription>
                Quản trị viên đang đặt mật khẩu mới cho {user.name} ({user.code}).
                Các phiên đăng nhập hiện tại của tài khoản này sẽ bị thu hồi.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`new-password-${user.id}`}>Mật khẩu mới</Label>
                <Input
                  id={`new-password-${user.id}`}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={newPassword}
                  disabled={isSaving}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`confirm-password-${user.id}`}>
                  Xác nhận mật khẩu mới
                </Label>
                <Input
                  id={`confirm-password-${user.id}`}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  disabled={isSaving}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
