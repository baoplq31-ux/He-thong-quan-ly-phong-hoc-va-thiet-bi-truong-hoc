
"use client";

import {
  Bell,
  CheckCheck,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { viewInformation } from "@/data/navigation";
import type { View } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  referenceId: number | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
}

interface AppHeaderProps {
  activeView: View;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onViewChange: (view: View) => void;
}

export function AppHeader({
  activeView,
  search,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onViewChange
}: AppHeaderProps) {
  const information = viewInformation[activeView];

  function handleNotificationClick(
    notification: NotificationItem,
  ) {
    console.log(
      "[Notification] referenceType:",
      notification.referenceType,
    );

    console.log(
      "[Notification] onViewChange:",
      typeof onViewChange,
    );

    if (notification.referenceType?.toLowerCase() === "booking") {
      onViewChange("bookings");
    } else if (
      notification.referenceType?.toLowerCase() === "borrowing"
    ) {
      onViewChange("borrowings");
    } else if (
      notification.referenceType?.toLowerCase() === "incident"
    ) {
      onViewChange("incidents");
    } else if (
      notification.referenceType?.toLowerCase() === "equipment"
    ) {
      onViewChange("equipment");
    }

    if (!notification.isRead) {
      void markNotificationAsRead(notification.id);
    }

    setShowNotifications(false);
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);
    useState(false);

  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState(false);
  const [deletingNotificationId, setDeletingNotificationId] =
    useState<number | null>(null);
  const [isDeletingReadNotifications, setIsDeletingReadNotifications] =
    useState(false);

  async function loadNotifications() {
  setIsLoadingNotifications(true);

  try {
    const response = await fetch(
      "/api/notifications",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  } catch (error) {
    console.error(
      "Không thể tải thông báo:",
      error,
    );
  } finally {
    setIsLoadingNotifications(false);
  }
}
  useEffect(() => {
    let active = true;

    async function loadInitialNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!active) {
          return;
        }

        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } catch (error) {
        if (active) {
          console.error("Không thể tải thông báo:", error);
        }
      }
    }

    void loadInitialNotifications();
    return () => {
      active = false;
    };
  }, []);

 async function markNotificationAsRead(
  notificationId: number,
) {
  try {
    const response = await fetch(
      "/api/notifications",
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: notificationId,
        }),
      },
    );

    if (!response.ok) {
      return;
    }

    await loadNotifications();
  } catch (error) {
    console.error(
      "Không thể đánh dấu thông báo:",
      error,
    );
  }
}

async function markAllNotificationsAsRead() {
  try {
    const response = await fetch(
      "/api/notifications",
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAll: true,
        }),
      },
    );

    if (!response.ok) {
      return;
    }
    await loadNotifications();
  } catch (error) {
    console.error(
      "Không thể đánh dấu tất cả thông báo:",
      error,
    );
  }
}

  async function deleteNotification(notificationId: number) {
    if (deletingNotificationId !== null) return;
    setDeletingNotificationId(notificationId);
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        toast.error(result.message ?? "Không thể xóa thông báo.");
        return;
      }
      toast.success("Đã xóa thông báo.");
      await loadNotifications();
    } catch (error) {
      console.error("Không thể xóa thông báo:", error);
      toast.error("Không thể kết nối tới máy chủ.");
    } finally {
      setDeletingNotificationId(null);
    }
  }

  async function deleteReadNotifications() {
    if (
      isDeletingReadNotifications ||
      !notifications.some((notification) => notification.isRead)
    ) {
      return;
    }
    if (!window.confirm("Xóa tất cả thông báo đã đọc của bạn?")) return;

    setIsDeletingReadNotifications(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteRead: true }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        toast.error(result.message ?? "Không thể xóa thông báo đã đọc.");
        return;
      }
      toast.success(result.message ?? "Đã xóa thông báo đã đọc.");
      await loadNotifications();
    } catch (error) {
      console.error("Không thể xóa thông báo đã đọc:", error);
      toast.error("Không thể kết nối tới máy chủ.");
    } finally {
      setIsDeletingReadNotifications(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-7">
      <SidebarTrigger className="size-9 rounded-xl text-slate-600 md:hidden" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 md:text-base">
          {information.title}
        </p>

        <p className="hidden truncate text-xs text-slate-500 sm:block">
          {information.description}
        </p>
      </div>

      <div className="relative hidden w-full max-w-[330px] sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Tìm phòng, thiết bị..."
          className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 shadow-none"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 rounded-xl"
        aria-label="Làm mới dữ liệu"
        title="Làm mới dữ liệu"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={`size-[18px] ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
      </Button>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-10 rounded-xl"
          aria-label="Thông báo"
          title="Thông báo"
          onClick={() => {
            setShowNotifications(
              (current) => !current,
            );

            if (!showNotifications) {
              loadNotifications();
            }
          }}
        >
          <Bell className="size-[18px]" />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </Button>

        {showNotifications && (
          <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">
                  Thông báo
                </p>

                <p className="text-xs text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} thông báo chưa đọc`
                    : "Không có thông báo mới"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {notifications.some((notification) => notification.isRead) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive"
                    disabled={isDeletingReadNotifications}
                    onClick={() => void deleteReadNotifications()}
                  >
                    <Trash2 className="mr-1 size-4" />
                    Xóa đã đọc
                  </Button>
                )}
                {unreadCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={markAllNotificationsAsRead}
                  >
                    <CheckCheck className="mr-1 size-4" />
                    Đã đọc hết
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Đang tải thông báo...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Không có thông báo
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-2 border-b border-slate-100 px-3 py-2 ${
                      notification.isRead ? "bg-white" : "bg-teal-50/60"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 py-1 text-left transition hover:bg-slate-50"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="flex gap-3">
                        <span
                          className={`mt-1 size-2 shrink-0 rounded-full ${
                            notification.isRead ? "bg-slate-300" : "bg-rose-500"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900">
                            {notification.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-600">
                            {notification.message}
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-400">
                            {new Date(notification.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </span>
                      </span>
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0 text-slate-500 hover:text-destructive"
                      title="Xóa thông báo"
                      aria-label={`Xóa thông báo: ${notification.title}`}
                      disabled={deletingNotificationId !== null}
                      onClick={() => void deleteNotification(notification.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
