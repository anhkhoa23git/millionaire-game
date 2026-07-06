<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Millionaire Game — Tài liệu dự án

## 1. Tổng quan

- **Game**: Mô phỏng gameshow "Ai là triệu phú" (Who Wants to Be a Millionaire) — trả lời chuỗi câu hỏi trắc nghiệm 4 đáp án, tiền thưởng tăng dần, 3 quyền trợ giúp, có mốc an toàn.
- **Đối tượng**: Chơi giải trí cá nhân, tổ chức mini-game cho lớp học/sự kiện/team-building (vì vậy có tính năng tự soạn bộ câu hỏi).
- **Kiến trúc**: Single-page app **thuần client** — không backend, không database. Toàn bộ game là 1 trang ([app/page.tsx](app/page.tsx)) hoạt động như state machine điều khiển ~15 màn hình. Dữ liệu người dùng lưu `localStorage`.

## 2. Công nghệ

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| Next.js | 16.2.9 | App Router, build bằng Turbopack |
| React | 19.2.4 | Client components toàn bộ phần game |
| TypeScript | ^5 | `strict: true` |
| Tailwind CSS | v4 | Qua `@tailwindcss/postcss`; trộn với inline style + CSS variables |
| ESLint | ^9 | Flat config, `eslint-config-next` |
| Web Audio API | — | SFX tổng hợp trong code, không cần file |
| `z-ai-web-dev-sdk` | ^0.0.18 | **Không dùng ở đâu** — tàn dư scaffold, có thể gỡ |

Không có thư viện UI, state manager, hay test framework nào khác.

## 3. Cấu trúc thư mục

```
app/
  page.tsx          # ❗ TRUNG TÂM: state machine toàn game, điều phối mọi màn hình
  layout.tsx        # Root layout, font Geist, metadata
  globals.css       # Design tokens (--gold, --navy...), .game-stage, utility classes,
                    # keyframes animation, container queries responsive
lib/millionaire/    # Logic thuần, không JSX — dễ test/tái dùng
  questions.ts      # DEFAULT_QUESTIONS (bộ đề mặc định) + type Question + formatMoney
  questionStore.ts  # CRUD câu hỏi ↔ localStorage, validate, export/import JSON
  prize.ts          # ❗ buildPrizeLadder(n): thang tiền + safe havens TỰ SINH theo số câu;
                    # computeWinnings(): nguồn sự thật duy nhất cho tiền thưởng
  history.ts        # Ghi/đọc lịch sử lượt chơi (localStorage, max 100 records)
  settings.ts       # Cài đặt (timer, volume) + timeLimitForLevel()
  audio.ts          # AudioManager singleton: SFX Web Audio + phát nhạc file
  lifelines.ts      # 3 lifelines + giả lập poll khán giả
  skip.ts           # Hệ thống skip trung tâm: màn hình đăng ký handler cho đoạn
                    # đang chạy; Space/nút SKIP kích hoạt (one-shot + cooldown 400ms)
  state.ts          # Types: ScreenId, ContestantInfo, AnswerState
components/millionaire/
  GameplayScreen.tsx    # ❗ Màn chơi chính: câu hỏi, đáp án, lifelines, timer, reveal
  AnswerBox.tsx         # 1 ô đáp án (states: default/selected/correct/wrong/disabled)
  LifelinesBar.tsx      # 3 nút trợ giúp
  CountdownTimer.tsx    # Đồng hồ SVG đếm ngược
  MoneyLadder.tsx       # Thang tiền (nhận ladder qua props)
  MenuScreen.tsx        # Menu chính
  CustomizeScreen.tsx   # Quản lý bộ câu hỏi + QuestionEditor.tsx (form 1 câu)
  HistoryScreen.tsx     # Bảng lịch sử + thống kê
  SettingsModal.tsx     # Modal cài đặt
  SkipControls.tsx      # UI skip toàn cục: phím Space + nút góc + hint (render 1 lần trong page.tsx)
  IntroductionScreen.tsx # Animation giới thiệu thang tiền trước khi chơi
  EndScreen.tsx         # 3 màn kết: win / lose / walk_away
  # Màn phụ trong luồng intro: WelcomeScreen, ContestantIntroScreen, ContestantForm,
  # VideoPlaceholder, OutroScreen, ReturnButton, SafeHavenFrame, MillionaireLogo, Khung1Frame
  # ⚠️ DEAD CODE (không được import, giữ lại tham khảo): BaroqueFrame, GoldFrameComponent,
  # StageReveal, TransitionBackground, welcomeintroscreen
public/               # Ảnh nền, icons lifeline, video mp4, nhạc mp3/ogg
```

**Luồng màn hình** (ScreenId trong `state.ts`):
`menu → intro_video → welcome → contestant_intro → contestant_form → transition_video → introduction → gameplay → end_win|end_lose|end_walk_away → outro → menu`. Ngoài luồng: `customize`, `history` (vào từ menu).

## 4. Cài đặt & chạy

```bash
npm install        # bắt buộc trước tiên (docs Next.js cũng nằm trong node_modules)
npm run dev        # dev server tại http://localhost:3000
npm run build      # production build (Turbopack)
npm start          # chạy bản build
npm run lint       # ESLint (hiện 0 errors, ~17 warnings từ dead code cũ)
npx tsc --noEmit   # typecheck riêng
```

- Không có test tự động — kiểm thử bằng cách chơi thật trên browser.
- Deploy: static-friendly (route `/` prerender), hợp với Vercel hoặc bất kỳ Node host nào.
- Không có `.env` — không secret, không API key.

## 5. Code convention

- **Component**: PascalCase, 1 file/component, named export (không default trừ `page.tsx`). Bắt đầu bằng `"use client"` (toàn bộ game là client component).
- **Logic thuần** để trong `lib/millionaire/` — không import React trong đó.
- **Styling**: Tailwind class cho layout cơ bản + inline `style` cho giá trị động/phức tạp + tokens trong `globals.css`. Dùng biến CSS (`var(--gold)`) thay vì hard-code màu mới.
- **Responsive**: KHÔNG dùng px cố định cho kích thước layout. Stage (`.game-stage`) là CSS container (`container-type: size`) — mọi kích thước bên trong dùng `clamp(min, Xcqw/cqh, max)`. Grid/flex thay absolute positioning (trừ overlay/modal).
- **Audio**: mọi âm thanh đi qua `audioManager` (lib/millionaire/audio.ts) — không `new Audio()` rải rác.
- **localStorage**: chỉ đọc/ghi phía client; key có version (`millionaire.questions.v1`). Đọc trong lazy initializer của `useState` hoặc event handler — KHÔNG setState đồng bộ trong `useEffect` (ESLint chặn).
- **setTimeout trong animation**: đăng ký vào mảng ref và clear trong cleanup (xem `schedule()` trong GameplayScreen).
- Ngôn ngữ UI: tiếng Anh cho khung game, tiếng Việt cho nội dung câu hỏi + màn Customize.

## 6. Quyết định thiết kế quan trọng

| Quyết định | Lý do |
|---|---|
| Thang tiền tự sinh (`buildPrizeLadder`) thay vì hard-code | Bộ câu hỏi thay đổi số lượng tự do (3–30 câu); safe havens tự đặt ở 1/3, 2/3, câu cuối. Trước đây hard-code 15 câu gây bug crash khi thắng |
| `computeWinnings()` là nguồn duy nhất tính thưởng | Trước đây 3 handler tự tính riêng → lệch nhau. Mọi thay đổi luật thưởng chỉ sửa 1 chỗ |
| SFX tổng hợp Web Audio thay vì file | Không có sẵn file SFX; đổi sang file thật sau này chỉ cần sửa `audio.ts` |
| localStorage thay vì backend | App offline-first, không cần server; export/import JSON để chia sẻ bộ đề |
| Container queries (cqw/cqh) thay vì media queries | Kích thước tính theo **stage** chứ không theo viewport → stage 16:9 letterbox trên desktop vẫn scale đúng; portrait stage chiếm trọn màn hình |
| State machine phẳng trong page.tsx thay vì router | Chuyển màn có animation phối hợp (logo bay, fade) cần state chung; URL routing không có giá trị cho game 1 phiên |
| `key={currentLevel}` trên GameplayScreen | Remount mỗi câu → timer/selected answer tự reset, không cần effect reset |

## 7. Tính năng

**Đã hoàn thành:**
- Luồng chơi đầy đủ: intro → nhập tên → thang tiền → chơi → kết thúc (win/lose/walk away/timeout)
- 3 lifelines: 50:50, Ask the Audience (poll giả lập), Double Dip — **50:50 và Double Dip không dùng chung trong 1 câu** (bị chặn kèm thông báo, không tiêu hao quyền)
- Nút Return giữa gameplay = "về menu" có confirm, huỷ lượt chơi hiện tại (các màn khác lùi 1 bước như cũ)
- Tự soạn bộ câu hỏi (CRUD + export/import JSON, 3–30 câu)
- Thang tiền + safe havens động theo số câu
- Lịch sử lượt chơi + thống kê
- Đếm ngược có phạt (tắt được), cài đặt volume
- SFX Web Audio + hiệu ứng hồi hộp (dim/spotlight/shake/flash)
- Responsive desktop/tablet/mobile, portrait + landscape; phím tắt A-D/Enter/Esc
- Skip (Space/nút SKIP): tua nhanh video (mute + 16×), fast-forward animation thang tiền, bỏ qua reveal kết quả — mỗi lần chỉ skip đúng đoạn đang chạy, không skip được lúc chờ trả lời

**Backlog / chưa làm:**
- Thay SFX tổng hợp bằng file âm thanh thật
- Nhạc nền gameplay theo mức câu hỏi (kiểu bản gốc)
- Lifeline "Phone a Friend" (đã có type `phoneGuess` trong GameState nhưng chưa dùng)
- Dọn dead code components + audio không dùng (`0702.mp3`, `laddereal.mp3`)
- Test tự động (chưa có framework)
- i18n hoàn chỉnh (hiện trộn Anh/Việt)

## 8. Ràng buộc & lưu ý

- **Browser**: cần hỗ trợ container query units (Chrome 105+, Safari 16+, Firefox 110+). Web Audio cần user gesture đầu tiên (autoplay policy) — audioManager tự xử lý.
- **Tên file asset**: server deploy phân biệt hoa/thường — đã từng gặp bug 404 audio. Giữ tên file lowercase khi thêm mới. File `icons/Main Logo Cropped.png` có dấu cách (tồn tại từ đầu, đừng đổi tên nếu không sửa hết tham chiếu).
- **Hydration**: route `/` prerender static; mọi giá trị đọc từ localStorage phải không ảnh hưởng HTML render đầu tiên của màn menu.
- **Hiệu năng**: animation chỉ dùng `transform`/`opacity`; tránh animate thuộc tính gây reflow. Confetti/light-rays là CSS thuần.
- **Đáp án nằm trong bundle client** — người chơi mở DevTools xem được. Chấp nhận được cho game giải trí; đừng dùng cho thi cử nghiêm túc.

## 9. Hướng dẫn cho AI coding assistant

**Được tự do sửa (không cần hỏi):**
- Sửa bug, refactor nhỏ, thêm animation/style theo design system có sẵn
- Thêm câu hỏi mặc định, chỉnh SFX trong `audio.ts`
- Cập nhật tài liệu này khi code thay đổi

**Phải hỏi trước khi:**
- Thêm dependency mới (dự án cố ý giữ zero-dependency ngoài Next/React/Tailwind)
- Đổi cấu trúc thư mục, đổi format dữ liệu localStorage (cần migration — user đã có dữ liệu)
- Xoá dead code components (user muốn giữ tham khảo)
- Thêm backend/API/analytics (thay đổi bản chất offline-first)
- Đổi luật chơi (số lifeline, cách tính thưởng)

**Quy trình bắt buộc:**
1. `npm install` nếu chưa có `node_modules`, đọc docs Next.js bundled khi đụng API Next.
2. Sau khi sửa: `npx tsc --noEmit` + `npm run build` + `npm run lint` phải sạch lỗi (warnings từ dead code cũ chấp nhận được).
3. Thay đổi UI: kiểm tra tối thiểu ở 375×812 (portrait), 812×375 (landscape), 1280×720.
4. Không commit khi chưa được yêu cầu.
