# CampusShare – Hướng dẫn cấu hình & triển khai

> **Chạy thử:** mở file `site/index.html` bằng trình duyệt (Chrome/Edge). Tài khoản quản trị duy nhất: `admin` / `admin123`.
>
> ⚠️ **Bảo mật:** mật khẩu admin nằm trong `site/js/config.js` (phía trình duyệt) nên ai xem mã cũng thấy, và dữ liệu chỉ lưu trên từng trình duyệt. Trước khi dùng thật cho cả trường, hãy chuyển sang Firebase Authentication + Firestore theo hướng dẫn bên dưới.

## Cấu trúc thư mục

```
campusshare/
├── site/                  ← Toàn bộ website (kéo thả thư mục này lên Netlify / GitHub Pages)
│   ├── index.html         ← Khung trang, nạp các file CSS và JS
│   ├── css/
│   │   ├── theme.css      ← Màu sắc: chế độ tối (mặc định) và sáng
│   │   ├── base.css       ← Nền tảng: khung trang, nút, form, thẻ, popup
│   │   ├── components.css ← Ảnh, animation, FAQ
│   │   └── pages.css      ← Giao diện từng trang (kho đồ, đăng nhập, chat, thông báo)
│   └── js/                ← Mã chạy theo thứ tự nạp trong index.html
│       ├── config.js      ← Tài khoản admin, danh mục, ảnh nền đăng nhập
│       ├── state.js       ← Biến trạng thái toàn cục
│       ├── utils.js       ← Tiện ích: toast, popup, ảnh, logo, avatar, theme
│       ├── storage.js     ← Lưu/đọc dữ liệu (localStorage) → CHỖ SẼ THAY bằng Firebase
│       ├── router.js      ← Điều hướng và vẽ khung trang
│       ├── auth.js        ← Đăng nhập, đăng ký, quên mật khẩu, giữ đăng nhập
│       ├── market.js      ← Kho đồ dùng, đăng/sửa/xóa bài, ảnh, báo cáo
│       ├── borrow.js      ← Mượn trả, giao dịch, QR, đánh giá
│       ├── needs.js       ← Nhu cầu của tôi, gợi ý thông minh
│       ├── notifications.js ← Thông báo, chuông đỏ, âm thanh
│       ├── social.js      ← Hồ sơ, kết bạn, tin nhắn, trạng thái online
│       ├── pages.js       ← Trang chủ, giới thiệu, điều khoản, liên hệ, dashboard, Green Impact, quản trị
│       ├── events.js      ← Lắng nghe sự kiện (đồng bộ giữa các tab)
│       └── main.js        ← Điểm khởi động
├── dist/index.html        ← Bản gộp 1 file (tạo bằng tools/build_single_file.py)
├── tools/build_single_file.py
├── firestore.rules  storage.rules  .env.example
└── README.md
```

**Muốn sửa gì thì mở file nào:**
- Đổi màu, kiểu chữ → `css/theme.css`, `css/base.css`
- Đổi mật khẩu admin, danh mục đồ dùng → `js/config.js`
- Sửa trang Kho đồ dùng → `js/market.js` và `css/pages.css`
- Sửa tin nhắn, kết bạn → `js/social.js`
- Nối Firebase → thay các hàm trong `js/storage.js` và đăng nhập trong `js/auth.js`

> Mỗi file JS là một "lát cắt" chức năng và dùng chung biến toàn cục (không dùng import), nên **thứ tự nạp trong `index.html` quan trọng**: không đổi thứ tự các thẻ `<script>`.

## 1. Cài đặt
```bash
npm create vite@latest campusshare -- --template react-ts
cd campusshare
npm i react-router-dom firebase react-hook-form zod @hookform/resolvers lucide-react framer-motion recharts sonner qrcode.react html5-qrcode
npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
cp .env.example .env
npm run dev
```
Không có `.env` => Demo Mode (dữ liệu mẫu, không lưu lên Firebase).

## 2. Cấu hình Firebase từ đầu
1. Vào console.firebase.google.com > Add project.
2. Build > Authentication > Sign-in method: bật **Email/Password**.
3. Build > Firestore Database > Create (chọn region gần Việt Nam, ví dụ `asia-southeast1`).
4. Build > Storage > Get started.
5. Project settings > Add app (Web) > chép config vào `.env`.
6. Nâng cấp gói Blaze nếu cần dùng Cloud Functions.

## 3. Deploy rules
```bash
npm i -g firebase-tools && firebase login && firebase init   # chọn Firestore, Storage, Functions, Hosting
firebase deploy --only firestore:rules,storage
```

## 4. Phân quyền (quan trọng)
`role` và `schoolId` nằm trong **custom claims**, chỉ đặt bằng Admin SDK trong Cloud Functions hoặc script chạy trên máy bạn:
```js
admin.auth().setCustomUserClaims(uid, { role: 'admin', schoolId: 'lequydon' });
```
Tạo Super Admin đầu tiên bằng script này, không bao giờ qua frontend.

## 5. Cloud Functions cần viết (các rule đang chặn ghi từ client)
`approveRequest`, `rejectRequest`, `confirmHandover(token)`, `confirmReturn`, `awardPoints`, `markOverdue` (scheduled), `matchNeeds` (trigger khi tạo item).
Mỗi hàm phải kiểm tra: người gọi là người tham gia, trạng thái hợp lệ, token QR đúng/chưa dùng/chưa hết hạn.

## 6. Deploy
- Firebase Hosting: `npm run build && firebase deploy --only hosting`
- Vercel: import repo, thêm các biến `VITE_FIREBASE_*`, Framework = Vite.

## Giới hạn hiện tại
Rules và tài liệu đã sẵn sàng; Cloud Functions và bản React/TS đầy đủ chưa được viết. Rules chưa được kiểm thử bằng Firebase Emulator.
