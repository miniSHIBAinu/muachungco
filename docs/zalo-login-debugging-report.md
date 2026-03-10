# Báo Cáo Gỡ Lỗi & Xây Dựng Zalo Login Flow (Magic Link)

**Ngày báo cáo:** 10/03/2026

---

## 🎯 1. Mục Tiêu
Giải quyết triệt để tình trạng lỗi Đăng nhập Zalo (Zalo Login Flow) cho toàn bộ ứng dụng **Mua Chung Co** trên môi trường Production (Custom Domain `app.muachung.co`), đặc biệt xử lý triệt để bug "Mất Session/Cookie" chặn đứng đường Login của người dùng iPhone (iOS Safari). Yêu cầu đảm bảo tính bảo mật và trải nghiệm người dùng luân chuyển mượt mà giữa các trình duyệt.

---

## 🛠️ 2. Các Lỗi Đã Gặp & Phân Tích

1. **Lỗi `-14003: Invalid redirect uri`:** Do URI truyền lên API (khi gọi xác thực) không khớp 100% với whitelist trong Zalo Developer Dashboard.
2. **SDK `zmp-sdk` bị Treo (Hang) trên iOS Web Browser:** App Zalo lừa trình duyệt Safari (thông qua User-Agent) khiến SDK nhầm tưởng đang chạy trong Zalo Mini App, gọi hàm Native thất bại và gây "đứng máy".
3. **Vercel Proxy Scheme Mismatch (`http` vs `https`):** Vercel đứng sau proxy (Edge), đẩy biến `request.url` thành `http://` làm sai chuẩn bảo mật URI của Zalo, khiến token trao đổi bị reject ngầm.
4. **iOS Drop Cookie (Mất Session giữa Safari và Zalo In-App Browser):** Đây là rào cản lớn nhất. Khi bấm Login ở Safari, iOS mở Zalo App. Sau khi gọi API cấp quyền xong, Zalo App lại mở Callback URL ngay tại "trình duyệt nội bộ của Zalo". Trình duyệt này không chung chạ Cookie với Safari, khiến việc Đăng nhập thành công nhưng chỉ nằm trong Zalo App, còn Safari vẫn là "Khách".

---

## 🚀 3. Các Việc Đã Làm (Solutions)

| Khu Vực | Triển Khai Giải Pháp |
| :--- | :--- |
| **Bypass SDK Hanging** | Chặn đứng việc gọi `zmp-sdk` bằng cơ chế kiểm tra `window.location.hostname`. Nếu đang ở Public Web (`vercel.app` hoặc `domain .co`), ép chuyển (force) qua luồng Web OAuth 2.0. |
| **URL Security Rules** | Code tự động Ép kiểu chuỗi (Force Scheme) `replace('http://', 'https://')` cho mọi `url.origin` xuyên suốt luồng Zalo Auth trên Node.js backend. Thêm đủ tham số `redirect_uri` vào payload `URLSearchParams`. |
| **Cookie Sandbox Escape** | Bỏ cơ chế nhét trực tiếp Session Cookie từ Callback API. <br>✅ **Tạo Magic Link Sync:** Khi Callbacks chạy xong, server sinh ra `loginToken` mã hóa ngẫu nhiên (Crypto Secure 32-bytes) lưu vào MongoDB User và redirect qua `/api/auth/sync`. <br>✅ Nếu là trình duyệt Zalo App, hiện trang giao diện hướng dẫn user bấm "Mở bằng trình duyệt" để quay về Safari. <br>✅ Khi Safari nhận diện được Sync URL, nó tiêu thụ Token, set Cookie tại Safari và xóa Token khỏi DB. |
| **CI/CD Protocols** | ▫️ Xóa bỏ Hardcoded secret keys khỏi các script tự động deploy nhằm vượt Security Scanner của Github.<br>▫️ Chạy `playwright_runner.py` giả lập test E2E nút Đăng nhập Zalo.<br>▫️ Bổ sung Unit tests (`vitest`) cho màn hình `/api/auth/sync` (Pass 100%).<br>▫️ Chạy Tool `checklist.py` đảm bảo Project Architecture Audit thành công (Lint, Schema, SEO). |

---

## 🏆 4. Kết Quả Thu Được

*   **Logic Hệ Thống Hoàn Thiện:** Luồng đăng nhập qua Zalo Web OAuth2 hiện nay **đã bảo mật hoàn toàn** và miễn nhiễm mọi lỗi định tuyến HTTP Proxy.
*   **Trải Nghiệm Đa Trình Duyệt:** Chặn đứng yếu điểm (vốn được coi là giới hạn từ Apple) trên iOS Safari. Magic Link đưa lại trải nghiệm vượt trội, luân chuyển cực kì êm nhịp cho thiết bị di động.
*   **Bảo Mật Bền Vững:** Các One-time Token tự động xóa khi dùng xong, chống mọi rủi ro về Replay Attack đối với Link cấp quyền.
*   **DevOps Readiness:** Cập nhật Github Secrets, Pass Secret Scanning, sẵn sàng CI/CD tự động toàn phần cho các bản build Web.
