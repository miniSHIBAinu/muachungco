import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Mua Chung Co – Mã Giảm Giá Mua Chung",
  description: "Tạo và tham gia các deal mua chung để nhận mã giảm giá tốt nhất. Càng nhiều người, giảm càng sâu!",
  keywords: ["mua chung", "deal", "giảm giá", "voucher", "zalo"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://muachungco.vercel.app",
    title: "Mua Chung Co – Trải nghiệm Mua Chung Đỉnh Cao",
    description: "Cùng nhau tham gia để đánh sập giá sản phẩm yêu thích. Chốt đơn nhận mã giảm giá cực khủng!",
    siteName: "Mua Chung Co",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mua Chung Co – Trải nghiệm Mua Chung Đỉnh Cao",
    description: "Cùng nhau tham gia để đánh sập giá sản phẩm yêu thích. Chốt đơn nhận mã giảm giá cực khủng!",
  }
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
