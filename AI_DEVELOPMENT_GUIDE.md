# AI Development Guide - AI Quest Engine

File này dành cho Codex hoặc các model AI khác khi tiếp tục phát triển dự án.

## Mục tiêu hệ thống

AI Quest Engine là hệ thống tổ chức ngoại khóa Toán/STEM theo đội. Mỗi lớp là một đội, đăng nhập để giải lần lượt các cửa thử thách. Học sinh được phép dùng AI thoải mái; đề thi cần buộc các em biết hỏi, kiểm chứng, phản biện và mô hình hóa.

## Chuẩn ra đề bắt buộc

- Vì đề có thể dùng chung cho khối 10, 11, 12, ưu tiên kiến thức phổ thông nền tảng: số học, đại số, hàm số cơ bản, hình học trực quan, thống kê đơn giản, tổ hợp/xác suất cơ bản, dữ liệu, tối ưu bằng lập luận.
- Tránh đưa kiến thức vượt tầm khối 10-11 như xác suất có điều kiện, Bayes, định thức/ma trận, giải tích nặng, thuật toán chuyên sâu, trừ khi đề đã cung cấp hướng dẫn đủ để học sinh khám phá được ngay trong cửa đó.
- Câu khó nên khó ở mô hình hóa, kiểm chứng AI, chọn chiến lược, phát hiện lỗi, hoặc tạo sản phẩm; không khó bằng ký hiệu lạ.
- Mỗi câu phải có đáp án/khóa chuẩn trong `DAP_AN_VA_GIAI_THICH.md` và trong script sinh CSV tương ứng.

## Kiến trúc chính

- Next.js App Router nằm trong `app/`.
- Supabase lưu dữ liệu, migration nằm trong `supabase/migrations/`.
- Bảo mật phiên nằm ở `lib/security/session.ts`.
- Luồng đăng nhập/nộp khóa nằm ở `lib/game.ts`, `app/login/actions.ts`, `app/play/actions.ts`.
- Import CSV nằm ở `lib/csv-import.ts`.
- Trang admin nằm ở `app/admin/page.tsx` và `app/admin/actions.ts`.
- Trang HDSD tĩnh nằm ở `public/huong-dan-admin.html`.

## Format CSV bắt buộc

Không đổi format này nếu chưa sửa importer và HDSD:

```csv
teams.csv: season_id,team_id,team_name,password
challenges.csv: season_id,door,title,mission,file_url,difficulty,module,is_boss
answers.csv: season_id,team_id,door,key
```

Đáp án trong `answers.csv` là khóa thô; hệ thống tự hash khi import.

## Bộ đề hiện có

- Bộ 1: `de-thi/toan-ai-quest-01/`
- Bộ 2 nâng cao: `de-thi/toan-ai-quest-02/`
- Bộ 3 Nexus: `de-thi/toan-ai-quest-03/`
- Bộ 4 Product Quest: `de-thi/toan-ai-quest-04/`
- Đáp án/giải thích bộ 2: `de-thi/toan-ai-quest-02/DAP_AN_VA_GIAI_THICH.md`

Script sinh CSV:

```bash
pnpm tsx scripts/generate-math-ai-season.ts --season <SEASON_ID> --classes de-thi/toan-ai-quest-01/classes.example.txt --out tmp/math-ai-quest-01
pnpm tsx scripts/generate-math-ai-season-02.ts --season <SEASON_ID> --classes de-thi/toan-ai-quest-02/classes.example.txt --out tmp/math-ai-quest-02
pnpm tsx scripts/generate-math-ai-season-03.ts --season <SEASON_ID> --classes de-thi/toan-ai-quest-03/classes.example.txt --out tmp/math-ai-quest-03
pnpm tsx scripts/generate-math-ai-season-04.ts --season <SEASON_ID> --classes de-thi/toan-ai-quest-04/classes.example.txt --out tmp/math-ai-quest-04
```

## Product Quest và Gallery

Bộ 4 dùng các cửa có module/tên chứa `San pham` để kích hoạt form nộp sản phẩm trong `/play`.

Sản phẩm học tập được lưu ở bảng `product_submissions` và xem tại `/gallery`.

Migration liên quan:

```text
supabase/migrations/20260705000001_product_submissions.sql
```

## Quy mô lớp

File mẫu bộ 2 đang dùng 48 lớp:

- `10A1` đến `10A16`
- `11B1` đến `11B16`
- `12C1` đến `12C16`

Nếu mỗi năm chỉ thi 1 hoặc 2 khối, tạo file classes riêng rồi truyền vào `--classes`.

## Mật khẩu và một thiết bị

Mỗi dòng lớp có thể ở dạng:

```txt
10A1
10A1,Đội 10A1,MatKhauRieng
```

Nếu chỉ ghi mã lớp, script tự tạo mật khẩu `pass<MÃ LỚP>`, ví dụ `pass10A1`.

Hệ thống chặn 2 thiết bị bằng các cột:

- `teams.active_session_token`
- `teams.active_session_at`

Migration liên quan:

```text
supabase/migrations/20260704000001_team_single_session.sql
```

Nếu học sinh kẹt phiên, admin có nút `Mở khóa` ở bảng đội.

## Nguyên tắc ra đề Toán AI

Đề tốt trong dự án này không nên chỉ là câu tính toán hỏi AI một lần. Mỗi cửa nên có ít nhất một trong các yếu tố:

- AI dễ sai nếu không kiểm chứng.
- Có dữ liệu nhiễu hoặc điều kiện ẩn.
- Cần mô hình hóa tình huống thực tế.
- Cần so sánh nhiều cách giải.
- Cần kiểm tra lại bằng tính tay, bảng, modulo, hoặc lập luận.

Với 120 phút, 30 cửa là hợp lý. 10 cửa đầu tạo nhịp, 10 cửa giữa phân hóa, 10 cửa cuối tạo top.

## Quy tắc sửa giao diện

- Giữ palette hiện có: `ink`, `panel`, `line`, `circuit`, `signal`, `warning`.
- Không làm giao diện kiểu HTML thô; luôn kiểm tra CSS đã load.
- Không thêm quá nhiều màu rực riêng lẻ.
- Trang công cụ/admin nên gọn, dễ scan, không biến thành landing page.
- Sau khi sửa frontend, mở `http://localhost:3000/login`, `/admin`, `/display` để xem nhanh.

## Kiểm tra bắt buộc trước khi bàn giao

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Nếu có sửa migration, nhắc người dùng chạy SQL migration mới trong Supabase.
