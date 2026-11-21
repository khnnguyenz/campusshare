# CampusShare

Nền tảng chia sẻ đồ dùng học tập cho học sinh THPT.

> **Chạy thử ngay:** mở file `site/index.html` bằng Chrome/Edge. Khi chưa điền Firebase, website lưu dữ liệu **trên trình duyệt của bạn** (chỉ để thử, người khác không thấy). Điền Firebase theo hướng dẫn bên dưới để lưu dữ liệu dùng chung cho cả trường.

## Cấu trúc thư mục

```
campusshare/
├── docs/                     ← Toàn bộ website
│   ├── index.html
│   ├── css/  theme.css · base.css · components.css · pages.css
│   └── js/
│       ├── firebase-config.js ← ★ BẠN ĐIỀN thông tin Firebase vào file này
│       ├── firebase.js        ← Nối Firebase: đăng nhập, lưu dữ liệu, cập nhật trực tiếp
│       ├── config.js          ← Danh mục đồ dùng, ảnh nền đăng nhập
│       ├── state.js · utils.js · storage.js · router.js
│       ├── auth.js · market.js · borrow.js · needs.js
│       ├── notifications.js · social.js · pages.js · events.js · main.js
├── dist/index.html           ← Bản gộp 1 file (tạo bằng tools/build_single_file.py)
├── tools/build_single_file.py
├── firestore.rules           ← Luật bảo mật dán vào Firebase
└── README.md
```

> Các file JS dùng chung biến toàn cục (không dùng import), nên **đừng đổi thứ tự các thẻ `<script>`** trong `index.html`.

## Nối Firebase (làm từng bước, không cần biết lập trình)

**Bước 1 – Tạo dự án.** Vào console.firebase.google.com, đăng nhập Google → **Create a project / Add project** → đặt tên `campusshare` → tắt Google Analytics → Create. Dùng gói **Spark (miễn phí)**, không cần thẻ.

**Bước 2 – Bật đăng nhập.** Menu trái **Build → Authentication → Get started → Sign-in method → Email/Password → bật Enable → Save**.

**Bước 3 – Tạo cơ sở dữ liệu.** **Build → Firestore Database → Create database** → giữ `(default)` → chọn vị trí `asia-southeast1` (Singapore) → chọn **Production mode** → Create.

**Bước 4 – Dán luật bảo mật.** Trong Firestore, mở tab **Rules**, xóa hết nội dung cũ, mở file `firestore.rules` trong thư mục này, copy toàn bộ rồi dán vào → bấm **Publish**.

**Bước 5 – Lấy thông tin kết nối.** Bấm bánh răng ⚙ → **Project settings** → kéo xuống **Your apps** → bấm biểu tượng web **`</>`** → đặt tên bất kỳ → **Register app**. Màn hình hiện đoạn `const firebaseConfig = { apiKey: "...", authDomain: "...", ... }`. Giữ trang này mở.

**Bước 6 – Điền vào website.** Mở file `site/js/firebase-config.js`, thay các dấu `''` bằng giá trị tương ứng (giữ nguyên dấu nháy). Ví dụ:
```js
const FIREBASE_CONFIG={apiKey:'AIza...',authDomain:'campusshare-xxxx.firebaseapp.com',projectId:'campusshare-xxxx',storageBucket:'campusshare-xxxx.appspot.com',messagingSenderId:'123456',appId:'1:123456:web:abc'};
```
Nếu website đã nằm trên GitHub: mở file này trên GitHub → bấm biểu tượng bút chì ✏ → sửa → **Commit changes**. Đợi 1–2 phút để GitHub Pages cập nhật.

**Bước 7 – Cho phép tên miền.** Firebase → **Authentication → Settings → Authorized domains → Add domain** → nhập tên miền trang của bạn (ví dụ `tenban.github.io`). Thiếu bước này đăng nhập sẽ báo lỗi.

**Bước 8 – Tạo tài khoản admin.**
1. Firebase → **Authentication → Users → Add user**: email `admin@campusshare.app`, mật khẩu do bạn chọn (tối thiểu 6 ký tự, hãy chọn mật khẩu mạnh).
2. Mở website, ở trang đăng nhập nhập `admin` và mật khẩu vừa tạo (website tự hiểu `admin` là `admin@campusshare.app`).
3. Vào **Firestore Database → Data → users**, bấm vào tài khoản vừa xuất hiện, sửa trường `role` từ `student` thành `super` → Update.
4. Đăng xuất rồi đăng nhập lại: bạn có quyền quản trị.

**Cách đăng nhập:** học sinh đăng ký bằng email hoặc số điện thoại (10 số) rồi đăng nhập bằng đúng thông tin đó. Số điện thoại chỉ dùng làm tên đăng nhập, không gửi SMS.

## Chế độ Firebase lưu những gì

Tài khoản và hồ sơ, bài đăng (kèm ảnh), yêu cầu mượn/trả, đánh giá, thông báo, bạn bè, tin nhắn, nhu cầu, báo cáo, trạng thái online. Dữ liệu cập nhật trực tiếp giữa các máy.

**Ảnh** được thu nhỏ rồi lưu thẳng trong Firestore (không dùng Firebase Storage vì Storage yêu cầu gói trả phí). Tổng ảnh mỗi bài giới hạn khoảng 900 KB.

## Giới hạn cần biết (gói miễn phí, không dùng Cloud Functions)

- Các kiểm tra như "chỉ hai bên được xác nhận giao dịch", điểm Green Points, mã QR… chạy ở trình duyệt, luật Firestore chỉ chặn được một phần. Một người rành kỹ thuật có thể gian lận điểm hoặc đọc mã QR của giao dịch (yêu cầu mượn đọc được với mọi tài khoản đã đăng nhập). Phù hợp để thử nghiệm trong một trường; muốn chặt chẽ hơn cần Cloud Functions (gói Blaze).
- Hạn mức miễn phí Firestore khoảng 50.000 lượt đọc và 20.000 lượt ghi mỗi ngày; trường nhỏ dùng thử là đủ, trường lớn có thể hết hạn mức giữa ngày.
- Quên mật khẩu chỉ gửi email thật cho tài khoản đăng ký bằng email; tài khoản số điện thoại cần admin hỗ trợ.
- Mã nguồn kết nối Firebase đã được kiểm thử với một Firebase giả lập, **chưa chạy thử với Firebase thật**. Nếu gặp lỗi, mở trang, bấm F12 → tab Console, chụp màn hình các dòng đỏ gửi lại để được sửa.

**Muốn sửa gì thì mở file nào:** màu sắc → `css/theme.css`; danh mục đồ dùng → `js/config.js`; trang Kho đồ dùng → `js/market.js` + `css/pages.css`; kết bạn/tin nhắn → `js/social.js`; kết nối dữ liệu → `js/firebase.js`.
