import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";

import { PrismaClient, type Room } from "../generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ?? "file:./dev.db";

const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Đang xóa dữ liệu cũ...");

  await prisma.incident.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.systemUser.deleteMany();

  console.log("Đang tạo phòng học...");

  await prisma.room.createMany({
    data: [
      {
        id: 1,
        code: "A101",
        name: "Phòng học A101",
        building: "Khu A",
        floor: "Tầng 1",
        type: "Phòng lý thuyết",
        capacity: 60,
        status: "Đang sử dụng",
        equipmentCount: 1,
      },
      {
        id: 2,
        code: "A102",
        name: "Phòng học A102",
        building: "Khu A",
        floor: "Tầng 1",
        type: "Phòng lý thuyết",
        capacity: 50,
        status: "Đang trống",
        equipmentCount: 2,
      },
      {
        id: 3,
        code: "A203",
        name: "Phòng máy A203",
        building: "Khu A",
        floor: "Tầng 2",
        type: "Phòng máy tính",
        capacity: 40,
        status: "Đang sử dụng",
        equipmentCount: 40,
      },
      {
        id: 4,
        code: "B201",
        name: "Phòng học B201",
        building: "Khu B",
        floor: "Tầng 2",
        type: "Phòng lý thuyết",
        capacity: 50,
        status: "Đang trống",
        equipmentCount: 2,
      },
      {
        id: 5,
        code: "B305",
        name: "Phòng Lab B305",
        building: "Khu B",
        floor: "Tầng 3",
        type: "Phòng thực hành mạng",
        capacity: 35,
        status: "Bảo trì",
        equipmentCount: 1,
      },
      {
        id: 6,
        code: "C101",
        name: "Phòng ngoại ngữ C101",
        building: "Khu C",
        floor: "Tầng 1",
        type: "Phòng ngoại ngữ",
        capacity: 45,
        status: "Đang sử dụng",
        equipmentCount: 45,
      },
      {
        id: 7,
        code: "C202",
        name: "Phòng họp C202",
        building: "Khu C",
        floor: "Tầng 2",
        type: "Phòng họp",
        capacity: 30,
        status: "Đang trống",
        equipmentCount: 2,
      },
      {
        id: 8,
        code: "D101",
        name: "Hội trường D101",
        building: "Khu D",
        floor: "Tầng 1",
        type: "Hội trường",
        capacity: 200,
        status: "Đang trống",
        equipmentCount: 0,
      },
    ],
  });

const roomRecords: Room[] = await prisma.room.findMany();

const roomIds = new Map<string, number>(
  roomRecords.map((room): [string, number] => [
    room.code,
    room.id,
  ]),
);

function getRoomId(code: string): number {
  const id = roomIds.get(code);

  if (id === undefined) {
    throw new Error(`Không tìm thấy phòng ${code}`);
  }

  return id;
}

  console.log("Đang tạo thiết bị...");

  await prisma.equipment.createMany({
    data: [
      {
        id: 1,
        code: "TB-001",
        name: "Máy chiếu Epson EB-X06",
        type: "Máy chiếu",
        roomId: getRoomId("A101"),
        quantity: 1,
        status: "Tốt",
        lastChecked: "25/09/2026",
      },
      {
        id: 2,
        code: "TB-014",
        name: "Máy tính Dell OptiPlex",
        type: "Máy tính",
        roomId: getRoomId("A203"),
        quantity: 40,
        status: "Tốt",
        lastChecked: "23/09/2026",
      },
      {
        id: 3,
        code: "TB-028",
        name: "Điều hòa Daikin 2HP",
        type: "Điều hòa",
        roomId: getRoomId("B201"),
        quantity: 2,
        status: "Cần kiểm tra",
        lastChecked: "20/09/2026",
      },
      {
        id: 4,
        code: "TB-033",
        name: "Switch Cisco 24 cổng",
        type: "Thiết bị mạng",
        roomId: getRoomId("B305"),
        quantity: 1,
        status: "Hỏng",
        lastChecked: "18/09/2026",
      },
      {
        id: 5,
        code: "TB-041",
        name: "Micro không dây",
        type: "Thiết bị âm thanh",
        roomId: getRoomId("A102"),
        quantity: 2,
        status: "Tốt",
        lastChecked: "22/09/2026",
      },
      {
        id: 6,
        code: "TB-052",
        name: "Bộ tai nghe ngoại ngữ",
        type: "Thiết bị ngoại ngữ",
        roomId: getRoomId("C101"),
        quantity: 45,
        status: "Cần kiểm tra",
        lastChecked: "19/09/2026",
      },
      {
        id: 7,
        code: "TB-067",
        name: "Màn hình tương tác 65 inch",
        type: "Màn hình tương tác",
        roomId: getRoomId("C202"),
        quantity: 2,
        status: "Tốt",
        lastChecked: "24/09/2026",
      },
    ],
  });

  console.log("Đang tạo lịch đặt phòng...");

  await prisma.booking.createMany({
    data: [
      {
        id: 1,
        date: "26/09/2026",
        time: "07:00–09:00",
        roomId: getRoomId("A101"),
        course: "Thiết kế hệ thống thông tin",
        person: "Nguyễn Minh Anh",
        status: "Đã duyệt",
      },
      {
        id: 2,
        date: "26/09/2026",
        time: "09:15–11:15",
        roomId: getRoomId("A203"),
        course: "Lập trình Web",
        person: "Trần Quốc Huy",
        status: "Đã duyệt",
      },
      {
        id: 3,
        date: "26/09/2026",
        time: "13:00–15:00",
        roomId: getRoomId("C101"),
        course: "Sinh hoạt khoa CNTT",
        person: "Lê Thu Hà",
        status: "Đã duyệt",
      },
      {
        id: 4,
        date: "28/09/2026",
        time: "07:00–09:00",
        roomId: getRoomId("B201"),
        course: "Cơ sở dữ liệu",
        person: "Phạm Hoàng Nam",
        status: "Chờ duyệt",
      },
      {
        id: 5,
        date: "28/09/2026",
        time: "13:00–15:00",
        roomId: getRoomId("A102"),
        course: "Kỹ năng mềm",
        person: "Võ Thanh Thảo",
        status: "Chờ duyệt",
      },
      {
        id: 6,
        date: "29/09/2026",
        time: "09:15–11:15",
        roomId: getRoomId("C202"),
        course: "Hội thảo tuyển dụng",
        person: "Đặng Quốc Minh",
        status: "Từ chối",
      },
    ],
  });

  console.log("Đang tạo sự cố...");

  await prisma.incident.createMany({
    data: [
      {
        id: 1,
        title: "Máy chiếu không nhận tín hiệu",
        roomId: getRoomId("A101"),
        reportedBy: "Nguyễn Minh Anh",
        time: "26/09/2026 08:10",
        severity: "Trung bình",
        status: "Mới báo",
      },
      {
        id: 2,
        title: "Mất kết nối mạng phòng Lab",
        roomId: getRoomId("B305"),
        reportedBy: "Trần Quốc Huy",
        time: "26/09/2026 09:30",
        severity: "Khẩn cấp",
        status: "Đang xử lý",
      },
      {
        id: 3,
        title: "Điều hòa phát tiếng ồn",
        roomId: getRoomId("B201"),
        reportedBy: "Lê Thu Hà",
        time: "25/09/2026 14:20",
        severity: "Thấp",
        status: "Mới báo",
      },
      {
        id: 4,
        title: "Tai nghe không phát âm thanh",
        roomId: getRoomId("C101"),
        reportedBy: "Phạm Quốc Bảo",
        time: "24/09/2026 10:15",
        severity: "Trung bình",
        status: "Đã xử lý",
      },
    ],
  });

  console.log("Đang tạo người dùng...");

  const passwordHash = await hash("123456", 10);

  await prisma.systemUser.createMany({
    data: [
      {
        id: 1,
        code: "QT001",
        name: "Nguyễn Văn Quản",
        email: "quan.admin@edufacility.edu.vn",
        passwordHash,
        role: "Quản trị viên",
        department: "Phòng Công nghệ thông tin",
        status: "Hoạt động",
        lastLogin: null,
      },
      {
        id: 2,
        code: "TB001",
        name: "Trần Minh Khoa",
        email: "khoa.thietbi@edufacility.edu.vn",
        passwordHash,
        role: "Cán bộ thiết bị",
        department: "Phòng Quản trị thiết bị",
        status: "Hoạt động",
        lastLogin: null,
      },
      {
        id: 3,
        code: "GV001",
        name: "Lê Thu Hà",
        email: "ha.le@edufacility.edu.vn",
        passwordHash,
        role: "Giảng viên",
        department: "Khoa Công nghệ thông tin",
        status: "Hoạt động",
        lastLogin: null,
      },
      {
        id: 4,
        code: "GV002",
        name: "Nguyễn Minh Anh",
        email: "anh.nguyen@edufacility.edu.vn",
        passwordHash,
        role: "Giảng viên",
        department: "Khoa Kinh tế",
        status: "Hoạt động",
        lastLogin: null,
      },
      {
        id: 5,
        code: "SV001",
        name: "Phạm Quốc Bảo",
        email: "bao.pham@edufacility.edu.vn",
        passwordHash,
        role: "Sinh viên",
        department: "Khoa Công nghệ thông tin",
        status: "Hoạt động",
        lastLogin: null,
      },
      {
        id: 6,
        code: "SV002",
        name: "Võ Hoàng Nam",
        email: "nam.vo@edufacility.edu.vn",
        passwordHash,
        role: "Sinh viên",
        department: "Khoa Cơ khí",
        status: "Đã khóa",
        lastLogin: null,
      },
    ],
  });

  console.log("Tạo dữ liệu mẫu thành công.");
  console.log("Mật khẩu demo: 123456");
}

main()
  .catch((error) => {
    console.error("Lỗi seed database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });