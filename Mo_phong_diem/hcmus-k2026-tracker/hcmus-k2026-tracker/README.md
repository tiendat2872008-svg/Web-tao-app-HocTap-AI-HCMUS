# Quản Lý Tiến Độ Học Tập Cá Nhân K2026 (HCMUS – Nhóm 07)

Ứng dụng web đơn trang (**Single Page Application – SPA**) chuẩn **Offline-first** và **Responsive** (Laptop + Điện thoại), không phụ thuộc CDN hay mạng Internet.

## Cấu trúc thư mục
- `index.html`: Khung giao diện 4 khu vực (Sticky Header, Segmented Tabs, Bento Dashboard, Main Workspace).
- `css/variables.css`: Hệ thống biến màu Light/Dark Mode đạt chuẩn tương phản WCAG 2.1 AA.
- `css/styles.css`: Styling cho Bento Grid, Bảng học phần (Inline Editing), Mô phỏng điểm (CN-07) và Lưới Thời khóa biểu (CN-06).
- `css/responsive.css`: Điểm ngắt giao diện Laptop/Tablet/Mobile, thẻ học phần dọc, TKB theo ngày và ngăn kéo Bộ lọc (Bottom Sheet).
- `js/data.js`: Danh mục học phần mẫu K2026 (138 TC + 3 môn điều kiện phụ) và hàm quy đổi điểm hệ 10/4.
- `js/storage.js`: Lưu tự động vào `localStorage`, Xuất/Nhập `student_k2026.json` và thông báo Toast.
- `js/dashboard.js`: Thống kê Bento Grid, 4 khối kiến thức và Ma trận học phần.
- `js/whatif.js`: Chức năng CN-07 (Mô phỏng điểm Sandbox, tính điểm mục tiêu, thước đo tính khả thi).
- `js/schedule.js`: Chức năng CN-06 (Kế hoạch học kỳ, quy đổi giờ thực tế Nguyễn Văn Cừ / Linh Trung, phát hiện trùng ca & xung đột chuyển cơ sở).
- `js/app.js`: Điều phối sự kiện, chuyển Tab, Dark/Light Mode và Responsive Drawer.

## Cách chạy thử
1. Giải nén tệp `hcmus-k2026-tracker.zip`.
2. Mở trực tiếp tệp `index.html` bằng trình duyệt (Chrome, Edge, Safari, Firefox) — không cần cài server, chạy được cả khi ngắt Wi-Fi.
3. Nhấn `F12` → bật **Toggle Device Toolbar** để kiểm thử giao diện Responsive trên điện thoại (`< 768px`).
