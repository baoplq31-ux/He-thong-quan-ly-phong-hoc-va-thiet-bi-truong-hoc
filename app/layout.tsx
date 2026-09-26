import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EduFacility | Quản lý phòng học và thiết bị",
  description:
    "Hệ thống quản lý phòng học, thiết bị và lịch sử dụng trong trường học.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}