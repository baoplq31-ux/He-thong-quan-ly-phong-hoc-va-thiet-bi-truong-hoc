"use client";

import { useState } from "react";

import { ReportsView } from "@/components/reports/reports-view";
import { BookingsView } from "@/components/bookings/bookings-view";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EquipmentView } from "@/components/equipment/equipment-view";
import { IncidentsView } from "@/components/incidents/incidents-view";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RoomsView } from "@/components/rooms/rooms-view";
import { UsersView } from "@/components/users/users-view";

import { toast } from "sonner";

import { LoginView } from "@/components/auth/login-view";

import {
  canAccessView,
  canApproveBookings,
  canManageFacilities,
  canProcessIncidents,
} from "@/lib/permissions";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { Toaster } from "@/components/ui/sonner";

import {
  bookings as initialBookings,
  equipment as initialEquipment,
  incidents as initialIncidents,
  rooms as initialRooms,
  users as initialUsers,
} from "@/data/mock-data";

import { viewInformation } from "@/data/navigation";

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

export function AppShell() {
  // Trang đang được chọn
  const [activeView, setActiveView] =
    useState<View>("dashboard");

  // Ô tìm kiếm
  const [search, setSearch] =
    useState("");

  // Danh sách phòng
  const [roomList, setRoomList] =
    useState<Room[]>(initialRooms);

  // Danh sách thiết bị
  const [equipmentList, setEquipmentList] =
    useState<Equipment[]>(initialEquipment);

  // Danh sách đăng ký phòng
  const [bookingList, setBookingList] =
    useState<Booking[]>(initialBookings);

  // Danh sách sự cố
  const [incidentList, setIncidentList] =
    useState<Incident[]>(initialIncidents);

  // Danh sách người dùng
  const [userList, setUserList] =
    useState<SystemUser[]>(initialUsers);

  // Người dùng hiện tại
  const [currentUser, setCurrentUser] =
  useState<SystemUser | null>(null);

  // =============================
  // CHUYỂN TRANG
  // =============================

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

  // =============================
  // PHÒNG
  // =============================

  function handleAddRoom(room: Room) {
    setRoomList((current) => [
      room,
      ...current,
    ]);
  }

  // =============================
  // THIẾT BỊ
  // =============================

  function handleAddEquipment(
    equipment: Equipment,
  ) {
    setEquipmentList((current) => [
      equipment,
      ...current,
    ]);
  }

  // =============================
  // ĐẶT PHÒNG
  // =============================

  function handleAddBooking(
    booking: Booking,
  ) {
    setBookingList((current) => [
      booking,
      ...current,
    ]);
  }

  function handleUpdateBookingStatus(
    id: number,
    status: BookingStatus,
  ) {
    setBookingList((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status,
            }
          : booking,
      ),
    );
  }

  // =============================
  // SỰ CỐ
  // =============================

  function handleAddIncident(
    incident: Incident,
  ) {
    setIncidentList((current) => [
      incident,
      ...current,
    ]);
  }

  function handleUpdateIncidentStatus(
    id: number,
    status: IncidentStatus,
  ) {
    setIncidentList((current) =>
      current.map((incident) =>
        incident.id === id
          ? {
              ...incident,
              status,
            }
          : incident,
      ),
    );
  }

  // =============================
  // NGƯỜI DÙNG
  // =============================

  function handleAddUser(user: SystemUser) {
    setUserList((current) => [
      user,
      ...current,
    ]);
  }

  function handleUpdateUserStatus(
    id: number,
    status: UserStatus,
  ) {
    setUserList((current) =>
      current.map((user) =>
        user.id === id
    ? { ...user, status }
    : user,
      ),
    );
  }

  // =============================
  // XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT
  // =============================
  function handleLogin(user: SystemUser) {
    const loginTime = new Intl.DateTimeFormat(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    ).format(new Date());

    const loggedInUser: SystemUser = {
      ...user,
      lastLogin: loginTime,
    };

    setUserList((current) =>
      current.map((item) =>
        item.id === user.id
          ? loggedInUser
          : item,
        ),
      );

    setCurrentUser(loggedInUser);
    setActiveView("dashboard");
    setSearch("");
  }
  
  function handleLogout() {
    setCurrentUser(null);
    setActiveView("dashboard");
    setSearch("");
    toast.success("Đã đăng xuất");
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

  // =============================
  // NỘI DUNG TỪNG TRANG
  // =============================

  function renderContent() {
    console.log(
      "activeView hiện tại:",
      activeView,
    );

    switch (activeView) {
      // =========================
      // DASHBOARD
      // =========================

      case "dashboard":
        return (
          <DashboardOverview
            rooms={roomList}
            equipment={equipmentList}
            bookings={bookingList}
            incidents={incidentList}
            onViewChange={
              handleViewChange
            }
          />
        );

      // =========================
      // PHÒNG HỌC
      // =========================

      case "rooms":
  return (
    <RoomsView
      rooms={roomList}
      search={search}
      onAddRoom={handleAddRoom}
      canManage={canManage}
    />
  );

      // =========================
      // THIẾT BỊ
      // =========================

      case "equipment":
  return (
    <EquipmentView
      equipment={equipmentList}
      rooms={roomList}
      search={search}
      onAddEquipment={handleAddEquipment}
      canManage={canManage}
    />
  );

      // =========================
      // LỊCH ĐẶT PHÒNG
      // =========================

      case "bookings":
  return (
    <BookingsView
      bookings={bookingList}
      rooms={roomList}
      search={search}
      onAddBooking={handleAddBooking}
      onUpdateStatus={handleUpdateBookingStatus}
      canApprove={canApprove}
    />
  );

      // =========================
      // SỰ CỐ & SỬA CHỮA
      // =========================

      case "incidents":
  return (
    <IncidentsView
      incidents={incidentList}
      rooms={roomList}
      search={search}
      onAddIncident={handleAddIncident}
      onUpdateStatus={handleUpdateIncidentStatus}
      canProcess={canProcess}
    />
  );

      // =========================
      // BÁO CÁO THỐNG KÊ
      // =========================

      case "reports":
        return (
        <ReportsView
        rooms={roomList}
        equipment={equipmentList}
        bookings={bookingList}
        incidents={incidentList}
        />
      );

      // =========================
      // NGƯỜI DÙNG
      // =========================
      case "users":
  return (
    <UsersView
      users={userList}
      search={search}
      currentUserId={currentUser?.id ?? 0}
      onAddUser={handleAddUser}
      onUpdateStatus={handleUpdateUserStatus}
    />
  );

      // =========================
      // CÁC TRANG CHƯA LÀM
      // =========================

      default: {
        const information =
          viewInformation[
            activeView as keyof typeof viewInformation
          ] ?? {
            title: "Trang chưa khả dụng",
            description:
              "Chức năng này sẽ được xây dựng ở bước tiếp theo.",
          };
      }
    }
  }

  if (!currentUser) {
  return (
    <>
      <LoginView
        users={userList}
        onLogin={handleLogin}
      />

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
        onViewChange={handleViewChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <SidebarInset>
        <AppHeader
          activeView={activeView}
          search={search}
          onSearchChange={
            setSearch
          }
        />

        <main className="min-h-screen flex-1 bg-slate-50 p-4 md:p-6">
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