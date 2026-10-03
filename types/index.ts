export type View =
  | "dashboard"
  | "rooms"
  | "equipment"
  | "bookings"
  | "incidents"
  | "reports"
  | "users";

export type RoomStatus =
  | "Đang trống"
  | "Đang sử dụng"
  | "Bảo trì";

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
  status: EquipmentStatus;
  lastChecked: string;
}

export type BookingStatus =
  | "Đã duyệt"
  | "Chờ duyệt"
  | "Từ chối";

export interface Booking {
  id: number;
  date: string;
  time: string;
  room: string;
  course: string;
  person: string;
  status: BookingStatus;
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