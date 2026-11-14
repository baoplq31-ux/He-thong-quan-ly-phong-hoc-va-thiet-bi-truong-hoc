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
import { AuditLogsView } from "@/components/audit-logs/audit-logs-view";
import { BookingsView } from "@/components/bookings/bookings-view";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EquipmentView } from "@/components/equipment/equipment-view";
import { IncidentsView } from "@/components/incidents/incidents-view";
import { MaintenanceView } from "@/components/maintenance/maintenance-view";
import type { MaintenanceRecord } from "@/components/maintenance/types";
import BorrowingsView from "@/components/borrowings/borrowings-view";
import type {
  BorrowingRequest,
  EquipmentBorrowing,
} from "@/components/borrowings/types";
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

type LoadedData = {
  rooms: Room[];
  equipment: Equipment[];
  bookings: Booking[];
  incidents: Incident[];
  users: SystemUser[];
  borrowings: EquipmentBorrowing[];
  maintenance: MaintenanceRecord[];
};

type LoginResponse = {
  user?: SystemUser;
  message?: string;
};

type ApiMessage = {
  message?: string;
};

export function AppShell() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [activeView, setActiveView] = useState<View>("dashboard");

  const [search, setSearch] = useState("");

  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  const [roomList, setRoomList] = useState<Room[]>([]);

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  const [bookingList, setBookingList] = useState<Booking[]>([]);

  const [incidentList, setIncidentList] = useState<Incident[]>([]);

  const [userList, setUserList] = useState<SystemUser[]>([]);
  const [maintenanceList, setMaintenanceList] =
    useState<MaintenanceRecord[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const sessionVersion = useRef(0);

  const [borrowingList, setBorrowingList] = useState<EquipmentBorrowing[]>([]);

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
    setMaintenanceList([]);
    setBorrowingList([]);
  }

  const fetchData = useCallback(async (): Promise<LoadedData> => {
    const response = await fetch("/api/data", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });
    const result = (await response.json()) as DataResponse;

    if (!response.ok) {
      throw new Error(result.message ?? "Không thể tải dữ liệu");
    }

    const borrowingResponse = await fetch("/api/borrowings", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });
    const borrowingResult = (await borrowingResponse.json()) as {
      data?: EquipmentBorrowing[];
      message?: string;
    };

    if (!borrowingResponse.ok) {
      throw new Error(
        borrowingResult.message ??
          "Không thể tải dữ liệu mượn thiết bị",
      );
    }

    const maintenanceResponse = await fetch("/api/maintenance", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });
    let maintenanceData: MaintenanceRecord[] = [];

    if (maintenanceResponse.ok) {
      const maintenanceResult = (await maintenanceResponse.json()) as {
        data?: MaintenanceRecord[];
      };
      maintenanceData = maintenanceResult.data ?? [];
    } else if (maintenanceResponse.status !== 403) {
      const maintenanceResult = (await maintenanceResponse.json()) as {
        message?: string;
      };
      throw new Error(
        maintenanceResult.message ??
          "Không thể tải dữ liệu bảo trì thiết bị",
      );
    }

    return {
      rooms: result.rooms,
      equipment: result.equipment,
      bookings: result.bookings,
      incidents: result.incidents,
      users: result.users,
      borrowings: borrowingResult.data ?? [],
      maintenance: maintenanceData,
    };
  }, []);

  const loadData = useCallback(
    async (showFullScreen = true) => {
      const version = sessionVersion.current;
      if (showFullScreen) {
        setIsLoadingData(true);
        setLoadError(null);
      }

      try {
        const data = await fetchData();
        if (version !== sessionVersion.current) {
          return false;
        }

        setRoomList(data.rooms);
        setEquipmentList(data.equipment);
        setBookingList(data.bookings);
        setIncidentList(data.incidents);
        setUserList(data.users);
        setBorrowingList(data.borrowings);
        setMaintenanceList(data.maintenance);
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
    [fetchData],
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

  const createBorrowing = (request: BorrowingRequest) =>
    sendMutation("/api/borrowings", {
      method: "POST",
      body: JSON.stringify(request),
    });

  const updateBorrowing = (id: number, request: BorrowingRequest) =>
    sendMutation(`/api/borrowings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        action: "edit",
        ...request,
      }),
    });

  const deleteBorrowing = (id: number) =>
    sendMutation(`/api/borrowings/${id}`, {
      method: "DELETE",
    });

  const approveBorrowing = (id: number) =>
    sendMutation(`/api/borrowings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Đã duyệt" }),
    });

  const rejectBorrowing = (id: number) =>
    sendMutation(`/api/borrowings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Từ chối" }),
    });

  const startBorrowing = (id: number) =>
    sendMutation(`/api/borrowings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Đang mượn" }),
    });

  const returnBorrowing = (
    id: number,
    conditionAfter: string,
    returnNote: string,
  ) =>
    sendMutation(`/api/borrowings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "Đã trả",
        conditionAfter,
        returnNote,
      }),
    });

  const createMaintenance = (request: {
    equipmentId: number;
    quantity: number;
    type: string;
    issueDescription: string;
    startDate: string;
    content: string;
    assignedTo: string;
  }) =>
    sendMutation("/api/maintenance", {
      method: "POST",
      body: JSON.stringify(request),
    });

  const completeMaintenance = (
    id: number,
    result: {
      repairResult: string;
      conditionAfter: string;
      cost: number | null;
    },
  ) =>
    sendMutation(`/api/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(result),
    });

  async function handleRefreshData() {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      const refreshed = await loadData(false);

      if (refreshed) {
        toast.success("Đã cập nhật dữ liệu mới nhất");
      } else {
        toast.error("Không thể cập nhật dữ liệu");
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleRetryData() {
    void loadData(true);
  }

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let cancelled = false;
    const version = sessionVersion.current;

    async function loadInitialData() {
      try {
        const data = await fetchData();
        if (cancelled || version !== sessionVersion.current) {
          return;
        }

        setRoomList(data.rooms);
        setEquipmentList(data.equipment);
        setBookingList(data.bookings);
        setIncidentList(data.incidents);
        setUserList(data.users);
        setBorrowingList(data.borrowings);
        setMaintenanceList(data.maintenance);
        setLoadError(null);
      } catch (error) {
        if (cancelled || version !== sessionVersion.current) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Không thể kết nối tới máy chủ";
        setLoadError(message);
        toast.error(message);
      } finally {
        if (!cancelled && version === sessionVersion.current) {
          setIsLoadingData(false);
        }
      }
    }

    void loadInitialData();
    return () => {
      cancelled = true;
      sessionVersion.current += 1;
    };
  }, [currentUser, fetchData]);

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
    rejectionReason?: string,
  ): Promise<boolean> {
    return sendMutation("/api/bookings", {
      method: "PATCH",
      body: JSON.stringify({ id, status, rejectionReason }),
    });
  }

  async function handleCancelBooking(id: number): Promise<boolean> {
    return sendMutation("/api/bookings", {
      method: "PATCH",
      body: JSON.stringify({ id, action: "cancel" }),
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

  async function handleUpdateUser(
  user: SystemUser,
): Promise<boolean> {
  return sendMutation("/api/users", {
    method: "PATCH",
    body: JSON.stringify({
      id: user.id,
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    }),
  });
}

async function handleDeleteUser(
  id: SystemUser["id"],
): Promise<boolean> {
  return sendMutation("/api/users", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

  async function handleResetPassword(
    userId: number,
    newPassword: string,
    confirmPassword: string,
  ): Promise<boolean> {
    return sendMutation("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ userId, newPassword, confirmPassword }),
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
            currentUserId={currentUser?.id ?? 0}
            requesterName={currentUser?.name ?? ""}
            onCancelBooking={handleCancelBooking}
            onAddBooking={handleAddBooking}
            onUpdateStatus={handleUpdateBookingStatus}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        );

        case "borrowings":
          return (
            <BorrowingsView
              borrowings={borrowingList}
              equipment={equipmentList}
              currentUserId={currentUser?.id ?? 0}
              onRefresh={() => void loadData(false)}
              onCreateBorrowing={createBorrowing}
              onUpdateBorrowing={updateBorrowing}
              onDeleteBorrowing={deleteBorrowing}
              onApprove={approveBorrowing}
              onReject={rejectBorrowing}
              onStartBorrowing={startBorrowing}
              onReturn={returnBorrowing}
              canApprove={canApprove}
              canProcess={canProcess}
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
            onUpdateUser={handleUpdateUser}
            onUpdateStatus={handleUpdateUserStatus}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
          />
        );

      case "maintenance":
        return (
          <MaintenanceView
            equipment={equipmentList}
            records={maintenanceList}
            onCreate={createMaintenance}
            onComplete={completeMaintenance}
          />
        );

      case "audit-logs":
        return <AuditLogsView />;

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
                onClick={handleRetryData}
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
          onRefresh={() => void handleRefreshData()}
          isRefreshing={isRefreshing}
          onViewChange={handleViewChange}
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
