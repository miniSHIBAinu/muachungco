import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Mua Chung Co – Mã Giảm Giá Mua Chung",
  description: "Tạo và tham gia các deal mua chung để nhận mã giảm giá tốt nhất. Càng nhiều người, giảm càng sâu!",
  keywords: ["mua chung", "deal", "giảm giá", "voucher"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="app-container">
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
