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
