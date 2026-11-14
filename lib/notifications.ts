import { prisma } from "@/lib/prisma";

type NotificationType =
  | "booking"
  | "borrowing"
  | "incident"
  | "equipment"
  | "system";

interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number;
  referenceType?:
    | "booking"
    | "borrowing"
    | "incident"
    | "equipment"
    | "system";
}

export async function createNotificationsForRoles(
  roles: string[],
  data: CreateNotificationInput,
) {
  const users = await prisma.systemUser.findMany({
    where: {
      role: {
        in: roles,
      },
      status: "Hoạt động",
    },
    select: {
      id: true,
    },
  });

  console.log(
    "[Notifications] Người nhận:",
    users.length,
    "roles:",
    roles,
  );

  if (users.length === 0) {
    console.warn(
      "[Notifications] Không tìm thấy người dùng phù hợp.",
    );

    return 0;
  }

  const result = await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title: data.title,
      message: data.message,
      type: data.type,
      referenceId: data.referenceId ?? null,
      referenceType: data.referenceType ?? null,
    })),
  });

  console.log(
    "[Notifications] Đã tạo:",
    result.count,
    "thông báo.",
  );

  return result.count;
}

export async function notifyNewBooking(
  bookingId: number,
  roomCode: string,
  date: string,
  time: string,
) {
  return createNotificationsForRoles(
    ["Quản trị viên", "Cán bộ thiết bị"],
    {
      title: "Đăng ký phòng mới",
      message: `Phòng ${roomCode} có lịch đăng ký mới vào ${date}, ${time} và đang chờ duyệt.`,
      type: "booking",
      referenceId: bookingId,
      referenceType: "booking",
    },
  );
}

export async function notifyNewBorrowing(
  borrowingId: number,
  borrowingCode: string,
  equipmentCode: string,
  equipmentName: string,
  borrowerName: string,
  quantity: number,
) {
  return createNotificationsForRoles(
    ["Quản trị viên", "Cán bộ thiết bị"],
    {
      title: "Yêu cầu mượn thiết bị mới",
      message: `${borrowerName} vừa gửi phiếu ${borrowingCode}, mượn ${quantity} ${equipmentName} (${equipmentCode}) và đang chờ duyệt.`,
      type: "borrowing",
      referenceId: borrowingId,
      referenceType: "borrowing",
    },
  );
}

export async function notifyNewIncident(
  incidentId: number,
  title: string,
  roomCode: string,
  severity: string,
) {
  return createNotificationsForRoles(
    ["Quản trị viên", "Cán bộ thiết bị"],
    {
      title: "Có sự cố mới",
      message: `${title} tại phòng ${roomCode}. Mức độ: ${severity}.`,
      type: "incident",
      referenceId: incidentId,
      referenceType: "incident",
    },
  );
}

export async function notifyEquipmentIssue(
  equipmentId: number,
  equipmentCode: string,
  equipmentName: string,
  status: string,
) {
  return createNotificationsForRoles(
    ["Quản trị viên", "Cán bộ thiết bị"],
    {
      title: "Thiết bị cần chú ý",
      message: `${equipmentCode} - ${equipmentName} đang ở trạng thái "${status}".`,
      type: "equipment",
      referenceId: equipmentId,
      referenceType: "equipment",
    },
  );
}