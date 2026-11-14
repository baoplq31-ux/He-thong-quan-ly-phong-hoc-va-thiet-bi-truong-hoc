export type View =
  | "dashboard"
  | "rooms"
  | "equipment"
  | "bookings"
  | "borrowings"
  | "incidents"
  | "reports"
  | "users"
  | "maintenance"
  | "audit-logs";

export type RoomStatus =
  | "Đang trống"
  | "Đang sử dụng"
  | "Bảo trì"
  | "Tạm khóa"
  | "Ngừng sử dụng";

export interface Room {
  id: number;
  code: string;
  name: string;
  building: string;
  floor: string;
  type: string;
  capacity: number;
  status: RoomStatus;
  equipmentCount: number;
}

export type EquipmentStatus =
  | "Tốt"
  | "Cần kiểm tra"
  | "Hỏng";

export interface Equipment {
  id: number;
  code: string;
  name: string;
  type: string;
  room: string;
  quantity: number;
  availableQuantity?: number;
  status: EquipmentStatus;
  lastChecked: string;
}

export type BookingStatus =
  | "Đã duyệt"
  | "Chờ duyệt"
  | "Từ chối"
  | "Đã hủy"
  | "Đã hoàn thành";

export interface Booking {
  id: number;
  date: string;
  time: string;
  room: string;
  course: string;
  person: string;
  status: BookingStatus;
  userId?: number | null;
  attendeeCount?: number;
  note?: string | null;
  rejectionReason?: string | null;
  approvedById?: number | null;
  approvedAt?: string | null;
}

export type IncidentSeverity =
  | "Thấp"
  | "Trung bình"
  | "Khẩn cấp";

export type IncidentStatus =
  | "Mới báo"
  | "Đang xử lý"
  | "Đã xử lý";

export interface Incident {
  id: number;
  title: string;
  location: string;
  reportedBy: string;
  time: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
}

export type UserRole =
  | "Quản trị viên"
  | "Cán bộ thiết bị"
  | "Giảng viên"
  | "Sinh viên";

export type UserStatus =
  | "Hoạt động"
  | "Đã khóa";

export interface SystemUser {
  id: number;
  code: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
}