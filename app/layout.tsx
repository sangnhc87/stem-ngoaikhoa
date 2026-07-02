import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Quest Engine",
  description: "Nền tảng thi STEM theo mùa cho trường phổ thông"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
