import { NextResponse } from "next/server";

import {
  FACILITY_MANAGER_ROLES,
  requireApiUser,
} from "@/lib/api-auth";

import { notifyNewBooking } from "@/lib/notifications";
import { recordAudit } from "@/lib/audit";
import {
  ApiError,
  apiError,
  bookingDate,
  positiveId,
  readBody,
  requiredText,
} from "@/lib/api-write";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TimeRange = {
  start: number;
  end: number;
};

const UNBOOKABLE_ROOM_STATUSES = [
  "Bảo trì",
  "Tạm khóa",
  "Ngừng sử dụng",
];

function parseTimeRange(value: string): TimeRange {
  const match = value.match(
    /^([01]\d|2[0-3]):([0-5]\d)\s*[-–—]\s*([01]\d|2[0-3]):([0-5]\d)$/,
  );

  if (!match) {
    throw new ApiError(
      "Khung giờ phải có dạng 07:00 - 09:00.",
    );
  }

  const start =
    Number(match[1]) * 60 + Number(match[2]);

  const end =
    Number(match[3]) * 60 + Number(match[4]);

  if (start >= end) {
    throw new ApiError(
      "Giờ kết thúc phải lớn hơn giờ bắt đầu.",
    );
  }

  return { start, end };
}

function rangesOverlap(
  first: TimeRange,
  second: TimeRange,
) {
  return (
    first.start < second.end &&
    first.end > second.start
  );
}

async function checkBookingConflict({
  roomId,
  date,
  time,
  excludeId,
}: {
  roomId: number;
  date: string;
  time: string;
  excludeId?: number;
}) {
  const requestedRange = parseTimeRange(time);

  const existingBookings =
    await prisma.booking.findMany({
      where: {
        roomId,
        date,
        status: {
          notIn: ["Từ chối", "Đã hủy", "Đã hoàn thành"],
        },
        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },
      select: {
        id: true,
        time: true,
      },
    });

  const conflictingBooking =
    existingBookings.find((booking) => {
      try {
        return rangesOverlap(
          requestedRange,
          parseTimeRange(booking.time),
        );
      } catch {
        return false;
      }
    });

  if (conflictingBooking) {
    throw new ApiError(
      "Phòng đã có lịch đặt trùng khung giờ này.",
      409,
    );
  }
}

function mapBooking(booking: {
  id: number;
  date: string;
  time: string;
  course: string;
  person: string;
  status: string;
  room: {
    code: string;
  };
}) {
  return {
    id: booking.id,
    date: booking.date,
    time: booking.time,
    room: booking.room.code,
    course: booking.course,
    person: booking.person,
    status: booking.status,
  };
}

export async function POST(request: Request) {
  const auth = await requireApiUser();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);

    const date = bookingDate(body.date);
    const time = requiredText(body.time, "Khung giờ");
    const roomCode = requiredText(
      body.room,
      "Phòng",
    ).toUpperCase();
    const course = requiredText(
      body.course,
      "Môn học hoặc mục đích",
    );
    const person = requiredText(
      body.person,
      "Người đăng ký",
    );
    const attendeeCount = Number(body.attendeeCount ?? 1);
    const note =
      typeof body.note === "string" && body.note.trim()
        ? body.note.trim()
        : null;

    if (!Number.isInteger(attendeeCount) || attendeeCount < 1) {
      throw new ApiError("Số người tham dự phải là số nguyên lớn hơn 0.");
    }

    parseTimeRange(time);

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      throw new ApiError(
        "Không tìm thấy phòng được chọn.",
        404,
      );
    }

    if (UNBOOKABLE_ROOM_STATUSES.includes(room.status)) {
      throw new ApiError(
        `Không thể đặt phòng đang ở trạng thái "${room.status}".`,
        409,
      );
    }
    if (room.capacity < attendeeCount) {
      throw new ApiError(
        `Phòng chỉ có sức chứa ${room.capacity} người.`,
        409,
      );
    }

    await checkBookingConflict({
      roomId: room.id,
      date,
      time,
    });

    const booking = await prisma.booking.create({
      data: {
        date,
        time,
        course,
        person: auth.user.name || person,
        attendeeCount,
        note,
        status: "Chờ duyệt",
        roomId: room.id,
        userId: auth.user.id,
      },
      include: {
        room: true,
      },
    });

    try {
      await recordAudit({
        userId: auth.user.id,
        action: "Tạo yêu cầu đặt phòng",
        module: "booking",
        objectId: booking.id,
        newValue: {
          room: room.code,
          date,
          time,
          status: booking.status,
        },
      });
    } catch (auditError) {
      console.error("Không thể ghi audit đặt phòng:", auditError);
    }

    try {
      console.log("=== BẮT ĐẦU TẠO THÔNG BÁO BOOKING ===");

      console.log("Booking:", {
        id: booking.id,
        roomCode: room.code,
        date: booking.date,
        time: booking.time,
      });

      await notifyNewBooking(
        booking.id,
        room.code,
        booking.date,
        booking.time,
      );

      console.log("=== ĐÃ TẠO THÔNG BÁO BOOKING ===");
    } catch (error) {
      console.error(
        "=== LỖI TẠO THÔNG BÁO BOOKING ===",
        error,
      );
    }

    return NextResponse.json(
      {
        message: "Đã gửi yêu cầu đặt phòng.",
        booking: mapBooking(booking),
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const params = new URL(request.url).searchParams;
    const date = bookingDate(params.get("date"));
    const start = requiredText(params.get("start"), "Giờ bắt đầu");
    const end = requiredText(params.get("end"), "Giờ kết thúc");
    const attendeeCount = Number(params.get("attendeeCount"));
    const requestedRange = parseTimeRange(`${start}-${end}`);

    if (!Number.isInteger(attendeeCount) || attendeeCount < 1) {
      throw new ApiError("Số người tham dự không hợp lệ.");
    }

    const [rooms, bookings] = await Promise.all([
      prisma.room.findMany({
        where: {
          status: { notIn: UNBOOKABLE_ROOM_STATUSES },
          capacity: { gte: attendeeCount },
        },
        orderBy: [{ capacity: "asc" }, { code: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
          capacity: true,
          status: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          date,
          status: {
            notIn: ["Từ chối", "Đã hủy", "Đã hoàn thành"],
          },
        },
        select: {
          roomId: true,
          time: true,
        },
      }),
    ]);

    const busyRoomIds = new Set(
      bookings
        .filter((booking) => {
          try {
            return rangesOverlap(
              requestedRange,
              parseTimeRange(booking.time),
            );
          } catch {
            return false;
          }
        })
        .map((booking) => booking.roomId),
    );

    return NextResponse.json({
      data: rooms.filter((room) => !busyRoomIds.has(room.id)),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);
    const id = positiveId(body.id);

    const currentBooking =
      await prisma.booking.findUnique({
        where: { id },
      });

    if (!currentBooking) {
      throw new ApiError(
        "Không tìm thấy lịch đặt phòng.",
        404,
      );
    }

    const canManage = FACILITY_MANAGER_ROLES.includes(
      auth.user.role as (typeof FACILITY_MANAGER_ROLES)[number],
    );

    if (body.action === "cancel") {
      if (!canManage && currentBooking.userId !== auth.user.id) {
        throw new ApiError(
          "Bạn chỉ có thể hủy yêu cầu đặt phòng của mình.",
          403,
        );
      }
      if (
        currentBooking.status !== "Chờ duyệt" &&
        currentBooking.status !== "Đã duyệt"
      ) {
        throw new ApiError(
          "Chỉ yêu cầu đang chờ duyệt hoặc đã duyệt mới có thể hủy.",
          409,
        );
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status: "Đã hủy",
          cancelledAt: new Date(),
        },
      });

      try {
        await recordAudit({
          userId: auth.user.id,
          action: "Hủy yêu cầu đặt phòng",
          module: "booking",
          objectId: id,
          oldValue: { status: currentBooking.status },
          newValue: { status: updated.status },
        });
      } catch (auditError) {
        console.error("Không thể ghi audit hủy đặt phòng:", auditError);
      }

      return NextResponse.json({
        message: "Đã hủy yêu cầu đặt phòng.",
      });
    }

    if (!canManage) {
      throw new ApiError(
        "Bạn không có quyền cập nhật yêu cầu đặt phòng.",
        403,
      );
    }

    /*
     * Nếu chỉ gửi id và status thì đây là thao tác
     * duyệt hoặc từ chối lịch đặt.
     */
    if (
      body.status !== undefined &&
      body.date === undefined
    ) {
      const status = requiredText(
        body.status,
        "Trạng thái",
      );

      if (!["Đã duyệt", "Từ chối", "Đã hoàn thành"].includes(status)) {
        throw new ApiError(
          "Trạng thái chỉ có thể được cập nhật sang đã duyệt, từ chối hoặc hoàn thành. Hãy dùng thao tác hủy riêng.",
        );
      }

      if (
        (status === "Đã duyệt" || status === "Từ chối") &&
        currentBooking.status !== "Chờ duyệt"
      ) {
        throw new ApiError(
          "Chỉ yêu cầu đang chờ duyệt mới có thể được duyệt hoặc từ chối.",
          409,
        );
      }

      const rejectionReason =
        status === "Từ chối"
          ? requiredText(body.rejectionReason, "Lý do từ chối")
          : undefined;

      if (status === "Đã duyệt") {
        await checkBookingConflict({
          roomId: currentBooking.roomId,
          date: currentBooking.date,
          time: currentBooking.time,
          excludeId: id,
        });
      }
      if (
        status === "Đã hoàn thành" &&
        currentBooking.status !== "Đã duyệt"
      ) {
        throw new ApiError(
          "Chỉ yêu cầu đã duyệt mới có thể hoàn thành.",
          409,
        );
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status,
          ...(status === "Đã duyệt"
            ? {
                approvedById: auth.user.id,
                approvedAt: new Date(),
                rejectionReason: null,
              }
            : {}),
          ...(status === "Từ chối"
            ? {
                approvedById: auth.user.id,
                approvedAt: new Date(),
                rejectionReason,
              }
            : {}),
          ...(status === "Đã hoàn thành"
            ? { completedAt: new Date() }
            : {}),
        },
        include: {
          room: true,
        },
      });

      try {
        await recordAudit({
          userId: auth.user.id,
          action: `Cập nhật trạng thái đặt phòng: ${status}`,
          module: "booking",
          objectId: id,
          oldValue: { status: currentBooking.status },
          newValue: {
            status: booking.status,
            rejectionReason: booking.rejectionReason,
          },
        });
      } catch (auditError) {
        console.error("Không thể ghi audit trạng thái đặt phòng:", auditError);
      }

      return NextResponse.json({
        message: "Cập nhật trạng thái thành công.",
        booking: mapBooking(booking),
      });
    }

    /*
     * Nếu có date, time, room... thì đây là
     * thao tác chỉnh sửa toàn bộ lịch đặt.
     */
    const date = bookingDate(body.date);
    const time = requiredText(body.time, "Khung giờ");
    const roomCode = requiredText(
      body.room,
      "Phòng",
    ).toUpperCase();
    const course = requiredText(
      body.course,
      "Môn học hoặc mục đích",
    );
    const person = requiredText(
      body.person,
      "Người đăng ký",
    );
    const attendeeCount = Number(body.attendeeCount ?? currentBooking.attendeeCount);
    const note =
      typeof body.note === "string" && body.note.trim()
        ? body.note.trim()
        : null;
    if (!Number.isInteger(attendeeCount) || attendeeCount < 1) {
      throw new ApiError("Số người tham dự phải là số nguyên lớn hơn 0.");
    }

    parseTimeRange(time);

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      throw new ApiError(
        "Không tìm thấy phòng được chọn.",
        404,
      );
    }

    if (UNBOOKABLE_ROOM_STATUSES.includes(room.status)) {
      throw new ApiError(
        `Không thể đặt phòng đang ở trạng thái "${room.status}".`,
        409,
      );
    }
    if (room.capacity < attendeeCount) {
      throw new ApiError(
        `Phòng chỉ có sức chứa ${room.capacity} người.`,
        409,
      );
    }

    await checkBookingConflict({
      roomId: room.id,
      date,
      time,
      excludeId: id,
    });

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        date,
        time,
        course,
        person,
        attendeeCount,
        note,
        roomId: room.id,

        // Chỉnh sửa lịch sẽ cần duyệt lại.
        status: "Chờ duyệt",
        approvedById: null,
        approvedAt: null,
        rejectionReason: null,
      },
      include: {
        room: true,
      },
    });

    try {
      await recordAudit({
        userId: auth.user.id,
        action: "Sửa yêu cầu đặt phòng",
        module: "booking",
        objectId: id,
        oldValue: {
          date: currentBooking.date,
          time: currentBooking.time,
          roomId: currentBooking.roomId,
          status: currentBooking.status,
        },
        newValue: {
          date,
          time,
          roomId: room.id,
          status: booking.status,
        },
      });
    } catch (auditError) {
      console.error("Không thể ghi audit sửa đặt phòng:", auditError);
    }

    return NextResponse.json({
      message:
        "Đã cập nhật lịch đặt. Lịch cần được duyệt lại.",
      booking: mapBooking(booking),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser(
    FACILITY_MANAGER_ROLES,
  );

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);
    const id = positiveId(body.id);

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        course: true,
        date: true,
        time: true,
        status: true,
        room: { select: { code: true } },
      },
    });

    if (!booking) {
      throw new ApiError(
        "Không tìm thấy lịch đặt phòng.",
        404,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "Xóa yêu cầu đặt phòng",
          module: "booking",
          objectId: String(id),
          oldValue: JSON.stringify({
            course: booking.course,
            date: booking.date,
            time: booking.time,
            room: booking.room.code,
            status: booking.status,
          }),
        },
      });
    });

    return NextResponse.json({
      message: `Đã xóa lịch đặt “${booking.course}”.`,
    });
  } catch (error) {
    return apiError(error);
  }
}