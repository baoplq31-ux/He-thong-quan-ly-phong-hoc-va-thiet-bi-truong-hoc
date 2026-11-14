"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuditLog = {
  id: number;
  action: string;
  module: string;
  objectId: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: {
    id: number;
    code: string;
    name: string;
  } | null;
};

function prettyValue(value: string | null) {
  if (!value) {
    return "-";
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          data?: AuditLog[];
          message?: string;
        };
        if (!response.ok) {
          throw new Error(result.message ?? "Không thể tải nhật ký.");
        }
        setLogs(result.data ?? []);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Không thể tải nhật ký.";
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Nhật ký hệ thống</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hiển thị tối đa 200 thay đổi gần nhất.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thao tác</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Đang tải nhật ký...
            </p>
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có bản ghi nhật ký.
            </p>
          ) : (
            logs.map((log) => (
              <details key={log.id} className="rounded-lg border p-4">
                <summary className="cursor-pointer">
                  <span className="font-medium">{log.action}</span>
                  <Badge variant="outline" className="ml-2">
                    {log.module}
                  </Badge>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {log.user
                      ? `${log.user.name} (${log.user.code})`
                      : "Tài khoản đã xóa"}
                    {" · "}
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                    {log.objectId ? ` · #${log.objectId}` : ""}
                  </span>
                </summary>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      Trước
                    </p>
                    <pre className="overflow-auto rounded bg-slate-50 p-2 text-xs">
                      {prettyValue(log.oldValue)}
                    </pre>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      Sau
                    </p>
                    <pre className="overflow-auto rounded bg-slate-50 p-2 text-xs">
                      {prettyValue(log.newValue)}
                    </pre>
                  </div>
                </div>
              </details>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
