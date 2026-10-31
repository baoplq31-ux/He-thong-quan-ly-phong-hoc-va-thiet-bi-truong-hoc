"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { LoginView } from "@/components/auth/login-view";
import { BookingsView } from "@/components/bookings/bookings-view";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EquipmentView } from "@/components/equipment/equipment-view";
import { IncidentsView } from "@/components/incidents/incidents-view";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ReportsView } from "@/components/reports/reports-view";
import { RoomsView } from "@/components/rooms/rooms-view";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UsersView } from "@/components/users/users-view";
import {
  canAccessView,
  canApproveBookings,
  canManageFacilities,
  canProcessIncidents,
} from "@/lib/permissions";
import type {
  Booking,
  BookingStatus,
  Equipment,
  Incident,
  IncidentStatus,
  Room,
  SystemUser,
  UserStatus,
  View,
} from "@/types";

type DataResponse = {
  rooms: Room[];
  equipment: Equipment[];
  bookings: Booking[];
  incidents: Incident[];
  users: SystemUser[];
  message?: string;
};

type LoginResponse = {
  user?: SystemUser;
  message?: string;
};

type ApiMessage = {
  message?: string;
};

export function AppShell() {
  const [isCheckingSession, setIsCheckingSession] =
    useState(true);

  const [activeView, setActiveView] =
    useState<View>("dashboard");

  const [search, setSearch] = useState("");

  const [currentUser, setCurrentUser] =
    useState<SystemUser | null>(null);

  const [roomList, setRoomList] =
    useState<Room[]>([]);

  const [equipmentList, setEquipmentList] =
    useState<Equipment[]>([]);

  const [bookingList, setBookingList] =
    useState<Booking[]>([]);

  const [incidentList, setIncidentList] =
    useState<Incident[]>([]);

  const [userList, setUserList] =
    useState<SystemUser[]>([]);

  const [isLoadingData, setIsLoadingData] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const sessionVersion = useRef(0);

  function clearClientState() {
    sessionVersion.current += 1;
    setCurrentUser(null);
    setActiveView("dashboard");
    setSearch("");
    setLoadError(null);
    setIsLoadingData(false);
    setRoomList([]);
    setEquipmentList([]);
    setBookingList([]);
    setIncidentList([]);
    setUserList([]);
  }

  const loadData = useCallback(
    async (showFullScreen = true) => {
      const version = sessionVersion.current;

      if (showFullScreen) {
        setIsLoadingData(true);
        setLoadError(null);
      }

      try {
        const response = await fetch("/api/data", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const result =
          (await response.json()) as DataResponse;

        if (version !== sessionVersion.current) {
          return false;
        }

        if (!response.ok) {
          throw new Error(
            result.message ?? "Không thể tải dữ liệu",
          );
        }

        setRoomList(result.rooms);
        setEquipmentList(result.equipment);
        setBookingList(result.bookings);
        setIncidentList(result.incidents);
        setUserList(result.users);
        setLoadError(null);

        return true;
      } catch (error) {
        if (version !== sessionVersion.current) {
          return false;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Không thể kết nối tới máy chủ";

        if (showFullScreen) {
          setLoadError(message);
          toast.error(message);
        }

        return false;
      } finally {
        if (
          showFullScreen &&
          version === sessionVersion.current
        ) {
          setIsLoadingData(false);
        }
      }
    },
    [],
  );

  async function sendMutation(
    url: string,
    options: RequestInit,
  ): Promise<boolean> {
    const version = sessionVersion.current;

    try {
      const headers = new Headers(options.headers);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...options,
        credentials: options.credentials ?? "include",
        headers,
      });

      const result =
        (await response.json().catch(() => ({}))) as ApiMessage;

      if (version !== sessionVersion.current) {
        return false;
      }

      if (!response.ok) {
        toast.error(result.message ?? "Không thể lưu dữ liệu");
        return false;
      }

      const refreshed = await loadData(false);

      if (version !== sessionVersion.current) {
        return false;
      }

      if (!refreshed) {
        toast.warning(
          "Dữ liệu đã được lưu nhưng danh sách chưa cập nhật. Vui lòng tải lại trang.",
        );
      }

      return true;
    } catch {
      if (version === sessionVersion.current) {
        toast.error("Không thể kết nối tới máy chủ");
      }
      return false;
    }
  }

  useEffect(() => {
    if (currentUser) {
      void loadData();
    }

    return () => {
      sessionVersion.current += 1;
    };
  }, [currentUser, loadData]);

  async function handleLogin(
    loginName: string,
    password: string,
  ) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          loginName,
          password,
        }),
      });

      const result =
        (await response.json()) as LoginResponse;

      if (!response.ok || !result.user) {
        toast.error(
          result.message ??
            "Đăng nhập không thành công",
        );

        return false;
      }

      setIsLoadingData(true);
      setCurrentUser(result.user);
      setActiveView("dashboard");
      setSearch("");

      toast.success(
        `Xin chào ${result.user.name}`,
      );

      return true;
    } catch {
      toast.error(
        "Không thể kết nối tới máy chủ đăng nhập",
      );

      return false;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as LoginResponse;

        if (!cancelled && data.user) {
          setIsLoadingData(true);
          setCurrentUser(data.user);
        }
      } catch {
        // Người dùng sẽ được đưa về màn hình đăng nhập.
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const result =
          (await response.json().catch(() => ({}))) as ApiMessage;

        throw new Error(
          result.message ?? "Không thể đăng xuất. Vui lòng thử lại.",
        );
      }

      clearClientState();
      toast.success("Đã đăng xuất");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể kết nối tới máy chủ đăng xuất",
      );
    }
  }

  function handleViewChange(view: View) {
    if (
      currentUser &&
      !canAccessView(currentUser.role, view)
    ) {
      toast.error(
        "Bạn không có quyền truy cập chức năng này",
      );

      return;
    }

    setActiveView(view);
    setSearch("");
  }

  async function handleAddRoom(room: Room): Promise<boolean> {
    return sendMutation("/api/rooms", {
      method: "POST",
      body: JSON.stringify(room),
    });
  }

  const handleUpdateEquipment = async (
  equipment: Equipment,
) => {
  return sendMutation("/api/equipment", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });
};

const handleDeleteEquipment = async (id: number) => {
  return sendMutation("/api/equipment", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
};

  const handleUpdateRoom = async (
    room: Room,
  ): Promise<boolean> => {
    return sendMutation("/api/rooms", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    });
  };

  const handleDeleteRoom = async (
    id: Room["id"],
  ): Promise<boolean> => {
    return sendMutation("/api/rooms", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  };

  async function handleAddEquipment(
    equipment: Equipment,
  ): Promise<boolean> {
    return sendMutation("/api/equipment", {
      method: "POST",
      body: JSON.stringify(equipment),
    });
  }

  async function handleAddBooking(
    booking: Booking,
  ): Promise<boolean> {
    return sendMutation("/api/bookings", {
      method: "POST",
      body: JSON.stringify(booking),
    });
  }

  async function handleUpdateBookingStatus(
    id: number,
    status: BookingStatus,
  ): Promise<boolean> {
    return sendMutation("/api/bookings", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
  }

  async function handleUpdateBooking(
  booking: Booking,
): Promise<boolean> {
  return sendMutation("/api/bookings", {
    method: "PATCH",
    body: JSON.stringify(booking),
  });
}

async function handleDeleteBooking(
  id: Booking["id"],
): Promise<boolean> {
  return sendMutation("/api/bookings", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

  async function handleAddIncident(
    incident: Incident,
  ): Promise<boolean> {
    return sendMutation("/api/incidents", {
      method: "POST",
      body: JSON.stringify(incident),
    });
  }

  async function handleUpdateIncidentStatus(
    id: number,
    status: IncidentStatus,
  ): Promise<boolean> {
    return sendMutation("/api/incidents", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
  }

  async function handleUpdateIncident(
  incident: Incident,
): Promise<boolean> {
  return sendMutation("/api/incidents", {
    method: "PATCH",
    body: JSON.stringify({
      id: incident.id,
      title: incident.title,
      location: incident.location,
      reportedBy: incident.reportedBy,
      severity: incident.severity,
    }),
  });
}

async function handleDeleteIncident(
  id: Incident["id"],
): Promise<boolean> {
  return sendMutation("/api/incidents", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

  async function handleAddUser(
    user: SystemUser,
  ): Promise<boolean> {
    return sendMutation("/api/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async function handleUpdateUserStatus(
    id: number,
    status: UserStatus,
  ): Promise<boolean> {
    return sendMutation("/api/users", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
  }

  const canManage =
    currentUser !== null &&
    canManageFacilities(currentUser.role);

  const canApprove =
    currentUser !== null &&
    canApproveBookings(currentUser.role);

  const canProcess =
    currentUser !== null &&
    canProcessIncidents(currentUser.role);

  function renderContent() {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardOverview
            rooms={roomList}
            equipment={equipmentList}
            bookings={bookingList}
            incidents={incidentList}
            onViewChange={handleViewChange}
          />
        );

      case "rooms":
        return (
          <RoomsView
            rooms={roomList}
            search={search}
            canManage={canManage}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        );

      case "equipment":
        return (
          <EquipmentView
            equipment={equipmentList}
            rooms={roomList}
            search={search}
            canManage={canManage}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        );

      case "bookings":
        return (
          <BookingsView
            bookings={bookingList}
            rooms={roomList}
            search={search}
            canApprove={canApprove}
            onAddBooking={handleAddBooking}
            onUpdateStatus={handleUpdateBookingStatus}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        );

      case "incidents":
        return (
          <IncidentsView
            incidents={incidentList}
            rooms={roomList}
            search={search}
            canProcess={canProcess}
            onAddIncident={handleAddIncident}
            onUpdateStatus={handleUpdateIncidentStatus}
            onUpdateIncident={handleUpdateIncident}
            onDeleteIncident={handleDeleteIncident}
          />
        );

      case "reports":
        return (
          <ReportsView
            rooms={roomList}
            equipment={equipmentList}
            bookings={bookingList}
            incidents={incidentList}
          />
        );

      case "users":
        return (
          <UsersView
            users={userList}
            search={search}
            currentUserId={
              currentUser?.id ?? 0
            }
            onAddUser={handleAddUser}
            onUpdateStatus={
              handleUpdateUserStatus
            }
          />
        );

      default:
        return null;
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginView onLogin={handleLogin} />

        <Toaster
          richColors
          position="top-right"
        />
      </>
    );
  }

  if (isLoadingData) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
          <LoaderCircle className="size-10 animate-spin text-blue-600" />

          <p className="mt-4 font-medium text-slate-700">
            Đang tải dữ liệu từ database...
          </p>
        </div>

        <Toaster
          richColors
          position="top-right"
        />
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
          <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              Không thể tải dữ liệu
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {loadError}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Button
                className="gap-2"
                onClick={() => void loadData(true)}
              >
                <RefreshCw className="size-4" />
                Thử lại
              </Button>

              <Button
                variant="outline"
                onClick={() => void handleLogout()}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        <Toaster
          richColors
          position="top-right"
        />
      </>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView={activeView}
        currentUser={currentUser}
        onViewChange={handleViewChange}
        onLogout={() => void handleLogout()}
      />

      <SidebarInset>
        <AppHeader
          activeView={activeView}
          search={search}
          onSearchChange={setSearch}
        />

        <main className="flex-1 bg-slate-50 p-4 md:p-6">
          {renderContent()}
        </main>
      </SidebarInset>

      <Toaster
        richColors
        position="top-right"
      />
    </SidebarProvider>
  );
}
