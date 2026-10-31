export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function readBody(request: Request) {
  const body: unknown = await request.json().catch(() => {
    throw new ApiError("Nội dung JSON không hợp lệ.");
  });

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw new ApiError("Dữ liệu gửi lên không hợp lệ.");
  }

  return body as Record<string, unknown>;
}

export function requiredText(
  value: unknown,
  label: string,
) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`${label} không được để trống.`);
  }

  return value.trim();
}

export function positiveId(value: unknown) {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    throw new ApiError("ID không hợp lệ.");
  }

  return value;
}

export function bookingDate(value: unknown) {
  const date = requiredText(value, "Ngày đặt");
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);

  if (!match) {
    throw new ApiError(
      "Ngày đặt phải có dạng DD/MM/YYYY.",
    );
  }

  const parsed = new Date(
    `${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`,
  );

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== Number(match[3]) ||
    parsed.getUTCMonth() + 1 !== Number(match[2]) ||
    parsed.getUTCDate() !== Number(match[1])
  ) {
    throw new ApiError("Ngày đặt không tồn tại.");
  }

  return date;
}

export function bookingTime(value: unknown) {
  const time = requiredText(value, "Khung giờ");

  const match =
    /^([01]\d|2[0-3]):([0-5]\d)\s*[-–—]\s*([01]\d|2[0-3]):([0-5]\d)$/.exec(
      time,
    );

  if (!match) {
    throw new ApiError(
      "Khung giờ phải có dạng HH:mm–HH:mm.",
    );
  }

  const start =
    Number(match[1]) * 60 + Number(match[2]);

  const end =
    Number(match[3]) * 60 + Number(match[4]);

  if (start >= end) {
    throw new ApiError(
      "Giờ kết thúc phải sau giờ bắt đầu.",
    );
  }

  return {
    start,
    end,
    text: `${match[1]}:${match[2]}–${match[3]}:${match[4]}`,
  };
}

export function assertNoOverlap(
  rows: { time: string }[],
  time: string,
) {
  const slot = bookingTime(time);

  const conflict = rows.some((row) => {
    const existing = bookingTime(row.time);

    return (
      slot.start < existing.end &&
      slot.end > existing.start
    );
  });

  if (conflict) {
    throw new ApiError(
      "Phòng đã có lịch trùng giờ.",
      409,
    );
  }
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { message: error.message },
      { status: error.status },
    );
  }

  const code =
    error &&
    typeof error === "object" &&
    "code" in error
      ? error.code
      : "";

  if (code === "P2002") {
    return Response.json(
      { message: "Mã hoặc email đã tồn tại." },
      { status: 409 },
    );
  }

  if (code === "P2025") {
    return Response.json(
      {
        message:
          "Không tìm thấy dữ liệu cần cập nhật.",
      },
      { status: 404 },
    );
  }

  if (code === "P2034") {
    return Response.json(
      {
        message:
          "Dữ liệu vừa thay đổi. Hãy thử lại thao tác.",
      },
      { status: 409 },
    );
  }

  console.error("API write error:", error);

  return Response.json(
    { message: "Không thể lưu dữ liệu." },
    { status: 500 },
  );
}