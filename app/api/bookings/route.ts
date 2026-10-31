import { NextResponse } from "next/server";

import {
  FACILITY_MANAGER_ROLES,
  requireApiUser,
} from "@/lib/api-auth";

import {
  ApiError,
  apiError,
  positiveId,
  readBody,
  requiredText,
} from "@/lib/api-write";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const BOOKING_STATUSES: readonly string[] = [
  "Chờ duyệt",
  "Đã duyệt",
  "Từ chối",
];

type TimeRange = {
  start: number;
  end: number;
};

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
          not: "Từ chối",
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

    const date = requiredText(body.date, "Ngày đặt");
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

    if (room.status === "Bảo trì") {
      throw new ApiError(
        "Không thể đặt phòng đang bảo trì.",
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
        person,
        status: "Chờ duyệt",
        roomId: room.id,
      },
      include: {
        room: true,
      },
    });

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

export async function PATCH(request: Request) {
  const auth = await requireApiUser(
    FACILITY_MANAGER_ROLES,
  );

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

      if (!BOOKING_STATUSES.includes(status)) {
        throw new ApiError(
          "Trạng thái lịch đặt không hợp lệ.",
        );
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status,
        },
        include: {
          room: true,
        },
      });

      return NextResponse.json({
        message: "Cập nhật trạng thái thành công.",
        booking: mapBooking(booking),
      });
    }

    /*
     * Nếu có date, time, room... thì đây là
     * thao tác chỉnh sửa toàn bộ lịch đặt.
     */
    const date = requiredText(body.date, "Ngày đặt");
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

    if (room.status === "Bảo trì") {
      throw new ApiError(
        "Không thể đặt phòng đang bảo trì.",
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
        roomId: room.id,

        // Chỉnh sửa lịch sẽ cần duyệt lại.
        status: "Chờ duyệt",
      },
      include: {
        room: true,
      },
    });

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
      },
    });

    if (!booking) {
      throw new ApiError(
        "Không tìm thấy lịch đặt phòng.",
        404,
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Đã xóa lịch đặt “${booking.course}”.`,
    });
  } catch (error) {
    return apiError(error);
  }
}