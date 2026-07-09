@AGENTS.md

# Ghi chú riêng cho Claude Code

Toàn bộ tài liệu dự án nằm trong [AGENTS.md](AGENTS.md) (được include ở trên) — nguồn sự thật duy nhất, tránh trùng lặp nội dung giữa 2 file. Khi cập nhật tài liệu, **sửa AGENTS.md**, không viết lại vào đây.

Nhắc nhanh những điểm hay quên:

- **Next.js 16 khác bản bạn biết** — đọc `node_modules/next/dist/docs/` trước khi viết code Next (chạy `npm install` trước nếu chưa có).
- Sau mỗi thay đổi: `npx tsc --noEmit` → `npm run build` → `npm run lint` phải 0 errors.
- UI: mọi kích thước dùng `clamp()` + đơn vị `cqw/cqh` (stage là CSS container). Không thêm px cố định cho layout.
- Âm thanh: gọi qua `audioManager`, không `new Audio()` trực tiếp.
- localStorage: đọc trong lazy initializer/`useState(() => ...)` hoặc event handler — không setState đồng bộ trong `useEffect`.
- Kiểm tra UI tối thiểu 3 kích thước: 375×812, 812×375, 1280×720 (dùng dev server + resize).
- Không commit khi user chưa yêu cầu. Không xoá dead-code components khi chưa hỏi.
