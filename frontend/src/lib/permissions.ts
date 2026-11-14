import type {
  UserRole,
  View,
} from "@/types";

export const viewPermissions: Record<
  UserRole,
  View[]
> = {
  "Quản trị viên": [
    "dashboard",
    "rooms",
    "equipment",
    "bookings",
    "borrowings",
    "incidents",
    "reports",
    "users",
    "maintenance",
    "audit-logs",
  ],

  "Cán bộ thiết bị": [
    "dashboard",
    "rooms",
    "equipment",
    "bookings",
    "borrowings",
    "incidents",
    "reports",
    "maintenance",
  ],

  "Giảng viên": [
    "dashboard",
    "rooms",
    "bookings",
    "borrowings",
    "incidents",
  ],

  "Sinh viên": [
    "dashboard",
    "rooms",
    "bookings",
    "borrowings",
    "incidents",
  ],
};

export function canAccessView(
  role: UserRole,
  view: View,
) {
  return viewPermissions[role].includes(view);
}

export function canManageFacilities(
  role: UserRole,
) {
  return (
    role === "Quản trị viên" ||
    role === "Cán bộ thiết bị"
  );
}

export function canApproveBookings(
  role: UserRole,
) {
  return canManageFacilities(role);
}

export function canProcessIncidents(
  role: UserRole,
) {
  return canManageFacilities(role);
}