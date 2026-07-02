# Chạy AI Quest Engine

Đây là file chính thầy/cô nên mở trước tiên.

## Step 1

```bash
pnpm install
```

## Step 2

```bash
cp .env.example .env.local
```

Nếu file `.env.local` đã tồn tại thì không cần chạy lại bước này.

## Step 3

Fill `.env.local`

Thầy/cô cần điền các thông tin lấy từ Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Và tự đặt:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `ANSWER_HASH_SECRET`
- `IP_HASH_SECRET`

Các secret nên dài ít nhất 32 ký tự.

## Step 4

```bash
pnpm setup:supabase
```

Lệnh này sẽ chỉ đúng file SQL cần copy vào Supabase.

## Step 5

Run SQL migration in Supabase

Vào Supabase `SQL Editor`, copy toàn bộ file:

```text
supabase/migrations/20260702000000_initial_schema.sql
```

Dán vào SQL Editor và bấm `Run`.

## Step 6

```bash
pnpm seed
```

Lệnh này tạo dữ liệu mẫu:

- 1 mùa thi mẫu
- 3 đội mẫu
- 5 thử thách mẫu
- khóa đáp án mẫu để test

Khóa test sẽ được ghi vào:

```text
test-keys-output.txt
```

## Step 7

```bash
pnpm dev
```

## Step 8

Open http://localhost:3000/login

## Step 9

Test admin and team login

Trang admin:

```text
http://localhost:3000/admin
```

Đăng nhập bằng `ADMIN_PASSWORD`.

Đội mẫu:

```text
T01 / 123456
T02 / 123456
T03 / 123456
```

Trong admin, đổi mùa thi sang `Đang mở` trước khi nộp khóa.

## Bộ đề Toán AI có sẵn

Dự án hiện có 4 bộ đề:

- Bộ 1: `de-thi/toan-ai-quest-01/`
- Bộ 2 nâng cao: `de-thi/toan-ai-quest-02/`
- Bộ 3 Nexus: `de-thi/toan-ai-quest-03/`
- Bộ 4 AI Product Quest: `de-thi/toan-ai-quest-04/`

File xem trực tiếp câu hỏi:

- `de-thi/toan-ai-quest-01/DE_BAI.md`
- `de-thi/toan-ai-quest-02/DE_BAI.md`
- `de-thi/toan-ai-quest-03/DE_BAI.md`
- `de-thi/toan-ai-quest-04/DE_BAI.md`

Bộ 2 đã có danh sách 48 lớp:

- `10A1` đến `10A16`
- `11B1` đến `11B16`
- `12C1` đến `12C16`

Tạo CSV bộ 2:

```bash
pnpm tsx scripts/generate-math-ai-season-02.ts \
  --season <SEASON_ID> \
  --classes de-thi/toan-ai-quest-02/classes.example.txt \
  --out tmp/math-ai-quest-02
```

Sau đó vào `/admin`, import theo thứ tự:

1. `tmp/math-ai-quest-02/teams.csv`
2. `tmp/math-ai-quest-02/challenges.csv`
3. `tmp/math-ai-quest-02/answers.csv`

Đáp án và giải thích cho BTC:

```text
de-thi/toan-ai-quest-01/DAP_AN_VA_GIAI_THICH.md
de-thi/toan-ai-quest-02/DAP_AN_VA_GIAI_THICH.md
de-thi/toan-ai-quest-03/DAP_AN_VA_GIAI_THICH.md
de-thi/toan-ai-quest-04/DAP_AN_VA_GIAI_THICH.md
```

Tạo CSV bộ 4 AI Product Quest:

```bash
pnpm tsx scripts/generate-math-ai-season-04.ts \
  --season <SEASON_ID> \
  --classes de-thi/toan-ai-quest-04/classes.example.txt \
  --out tmp/math-ai-quest-04
```

Bộ 4 có 5 cửa sản phẩm. Học sinh nộp sản phẩm trong trang `/play`, sản phẩm sẽ hiện ở:

```text
http://localhost:3000/gallery
```

## Mật khẩu lớp và chặn 2 thiết bị

Nếu file lớp chỉ có mã lớp như `10A1`, script tự tạo mật khẩu `pass10A1`.

Nếu muốn đặt mật khẩu riêng, ghi mỗi dòng:

```text
10A1,Đội 10A1,MatKhauRieng
```

Hệ thống đã có cơ chế mỗi đội chỉ đăng nhập trên 1 thiết bị. Nếu thiết bị thứ hai đăng nhập cùng tài khoản, hệ thống sẽ báo đội đang đăng nhập ở thiết bị khác.

Nếu học sinh đóng tab/tắt máy mà không bấm `Thoát`, vào `/admin`, bảng đội, bấm `Mở khóa`.

Để dùng tính năng này trên Supabase, chạy thêm migration:

```text
supabase/migrations/20260704000001_team_single_session.sql
supabase/migrations/20260705000001_product_submissions.sql
```

## Cho AI khác tiếp tục phát triển

Khi nhờ model AI khác làm tiếp dự án, yêu cầu đọc file:

```text
AI_DEVELOPMENT_GUIDE.md
```

Prompt gợi ý:

```text
Bạn đang phát triển tiếp dự án AI Quest Engine. Trước khi sửa code, hãy đọc AI_DEVELOPMENT_GUIDE.md, CHAY_HE_THONG.md và các file trong de-thi/. Không đổi format CSV nếu chưa cập nhật importer và HDSD. Sau khi sửa phải chạy pnpm lint, pnpm typecheck, pnpm build.
```

## Step 10

Deploy to Vercel using DEPLOY_VERCEL.md

Mở file:

```text
DEPLOY_VERCEL.md
```

và làm theo từng bước.

## Lệnh kiểm tra nhanh

```bash
pnpm setup:local
pnpm lint
pnpm build
pnpm test:flow
```
