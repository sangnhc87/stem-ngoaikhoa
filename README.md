# AI Quest Engine

Nền tảng thi STEM theo mùa cho trường THPT Việt Nam. Mỗi lớp có một đội, thi qua các cửa tuần tự, nộp khóa riêng theo đội, ghi log toàn bộ lượt nộp và có bảng xếp hạng trực tiếp.

Giáo viên nên bắt đầu bằng `CHAY_HE_THONG.md`. Các tài liệu hỗ trợ:

- `HUONG_DAN_GIAO_VIEN.md`: hướng dẫn cài đặt chi tiết.
- `DEPLOY_VERCEL.md`: hướng dẫn deploy production.
- `NGAY_THI_CHECKLIST.md`: checklist vận hành trong ngày thi.

## Công nghệ

- Next.js 15 App Router, TypeScript, Tailwind CSS
- Supabase Postgres và Supabase Storage
- Supabase SSR/client helpers
- Server Actions cho đăng nhập, nộp khóa, quản trị và import CSV
- bcrypt cho mật khẩu đội
- HMAC-SHA256 có secret riêng cho khóa đáp án
- pnpm, Vercel

## Cấu hình môi trường

Tạo `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Các biến bắt buộc:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=challenge-files
ADMIN_PASSWORD=
SESSION_SECRET=
ANSWER_HASH_SECRET=
IP_HASH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_EXPERIMENTAL_COREPACK=1
```

`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `ANSWER_HASH_SECRET` và `IP_HASH_SECRET` chỉ được dùng ở server. Không đặt các secret này với tiền tố `NEXT_PUBLIC_`.

## Chạy local

```bash
corepack enable
corepack prepare pnpm@10.12.1 --activate
corepack pnpm install
corepack pnpm dev
```

Ứng dụng chạy tại `http://localhost:3000`.

## Supabase

1. Tạo project Supabase.
2. Chạy migration trong `supabase/migrations/20260702000000_initial_schema.sql` bằng Supabase CLI hoặc SQL Editor.
3. Kiểm tra bucket `challenge-files` đã được tạo.
4. Chạy seed:

```bash
corepack pnpm seed
```

Seed tạo mùa thi `AI Quest 2026: Giải cứu Phòng thí nghiệm STEM`, 3 đội `T01`, `T02`, `T03`, mật khẩu chung `123456`, 5 thử thách và khóa đáp án riêng theo đội/cửa. Khóa đáp án demo được sinh ngẫu nhiên và chỉ in ra terminal khi chạy seed; không dùng bộ seed cho cuộc thi thật.

Khóa test cũng được ghi vào file local `test-keys-output.txt`. File này đã nằm trong `.gitignore`.

## Luồng sử dụng

- `/login`: đội đăng nhập bằng mã đội và mật khẩu.
- `/play`: đội xem đúng cửa hiện tại, tải tệp nếu có và nộp khóa.
- `/leaderboard`: bảng xếp hạng công khai, tự cập nhật 10 giây.
- `/display`: màn hình trình chiếu top 15, tự cập nhật 5 giây.
- `/admin`: giáo viên đăng nhập bằng `ADMIN_PASSWORD`, quản lý mùa thi, đội, thử thách, tệp, import CSV, log và reset mùa thi.

## CSV import

`teams.csv`

```csv
season_id,team_id,team_name,password
```

`challenges.csv`

```csv
season_id,door,title,mission,file_url,difficulty,module,is_boss
```

`answers.csv`

```csv
season_id,team_id,door,key
```

Trang quản trị có nút xem trước trước khi nhập. Hệ thống kiểm tra cột bắt buộc, định dạng dữ liệu, trùng mã đội trong mùa, trùng số cửa trong mùa và trùng đáp án theo đội/cửa.

## Bảo mật

- Đáp án không được trả về frontend hoặc API công khai.
- Mỗi khóa nộp được chuẩn hóa bằng `trim()` và hash HMAC-SHA256 trước khi gửi xuống Postgres function.
- Postgres function `submit_key_attempt` khóa hàng đội bằng `for update`, kiểm tra trạng thái mùa thi, rate limit 3 giây, ghi log và cập nhật tiến độ trong cùng transaction.
- Mật khẩu đội được hash bằng bcrypt.
- RLS được bật cho các bảng chính; ứng dụng dùng service role trong server-only code.
- Public API leaderboard chỉ trả dữ liệu xếp hạng đã lọc.

## Deploy Vercel

1. Push source code lên GitHub.
2. Tạo project Vercel từ repo.
3. Chọn package manager `pnpm`.
4. Build command mặc định: `pnpm build`.
5. Thêm đầy đủ biến môi trường từ `.env.example` vào Vercel Project Settings.
6. Chạy migration Supabase trước khi mở cuộc thi.
7. Seed dữ liệu hoặc import CSV từ `/admin`.
8. Mở mùa thi trong `/admin` bằng trạng thái `Đang mở`.

## Checklist kiểm thử

1. Team login succeeds.
2. Wrong password fails.
3. Team sees only current door.
4. Wrong key logs wrong submission.
5. Correct key unlocks next door.
6. Competition CLOSED blocks submissions.
7. Leaderboard updates correctly.
8. Admin can import teams CSV.
9. Admin can import challenges CSV.
10. Admin can import answers CSV.
11. Answers are not visible in frontend source/network response.
12. Display leaderboard works on projector.
