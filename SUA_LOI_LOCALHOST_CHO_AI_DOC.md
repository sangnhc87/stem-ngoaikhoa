# Sửa lỗi không mở được http://localhost:3000/login

File này dành cho giáo viên hoặc AI/Codex đọc lại sau này để làm tiếp.

## Tình trạng đã kiểm tra

Ngày 02/07/2026, lỗi không mở được:

```text
http://localhost:3000/login
```

Nguyên nhân lúc đó:

```text
Không có dev server nào đang chạy ở port 3000.
.env.local cũng chưa tồn tại.
```

Sau khi chạy:

```bash
pnpm dev
```

Next.js đã báo:

```text
Local: http://localhost:3000
Ready
```

Và kiểm tra:

```bash
curl -I http://localhost:3000/login
```

trả về:

```text
HTTP/1.1 200 OK
```

Nghĩa là trang `/login` đã mở được.

## Cách mở website local

Mở Terminal và chạy:

```bash
cd /Users/admin/stem-ngoaikhoa
pnpm dev
```

Khi thấy dòng:

```text
Ready
Local: http://localhost:3000
```

thì mở trình duyệt:

```text
http://localhost:3000/login
```

Không được tắt Terminal đang chạy `pnpm dev`. Nếu tắt Terminal hoặc bấm `Ctrl+C`, website local sẽ dừng.

## Nếu vẫn không mở được

### 1. Kiểm tra server có chạy không

```bash
lsof -iTCP:3000 -sTCP:LISTEN -Pn
```

Nếu không có dòng nào hiện ra, nghĩa là server chưa chạy. Chạy lại:

```bash
pnpm dev
```

### 2. Nếu port 3000 bị chiếm

Nếu lệnh `pnpm dev` báo port 3000 đang bận, Next.js có thể tự chuyển sang port khác, ví dụ:

```text
http://localhost:3001
```

Hãy mở đúng URL mà Terminal in ra.

### 3. Nếu thiếu pnpm

Chạy:

```bash
corepack enable
corepack prepare pnpm@10.12.1 --activate
pnpm install
```

Sau đó chạy lại:

```bash
pnpm dev
```

### 4. Nếu trang mở được nhưng đăng nhập không được

Đây là lỗi khác với lỗi không mở được localhost.

Đăng nhập cần Supabase. Kiểm tra:

```bash
test -f .env.local && echo "co env" || echo "thieu env"
```

Nếu thiếu `.env.local`, chạy:

```bash
cp .env.example .env.local
```

Sau đó điền các biến Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
ADMIN_PASSWORD
SESSION_SECRET
ANSWER_HASH_SECRET
IP_HASH_SECRET
NEXT_PUBLIC_APP_URL
ENABLE_EXPERIMENTAL_COREPACK
```

Rồi chạy:

```bash
pnpm setup:supabase
pnpm seed
pnpm test:flow
pnpm dev
```

## Việc AI/Codex cần làm nếu giáo viên hỏi tiếp

1. Không đoán. Kiểm tra server trước:

```bash
lsof -iTCP:3000 -sTCP:LISTEN -Pn
```

2. Nếu chưa chạy, bật server:

```bash
pnpm dev
```

3. Chờ dòng `Ready`.

4. Kiểm tra:

```bash
curl -I http://localhost:3000/login
```

5. Nếu HTTP 200, báo giáo viên mở:

```text
http://localhost:3000/login
```

6. Nếu đăng nhập lỗi, kiểm tra `.env.local`, Supabase migration và seed data.

## Các file hướng dẫn liên quan

- `CHAY_HE_THONG.md`: lệnh chạy từ đầu.
- `HUONG_DAN_GIAO_VIEN.md`: hướng dẫn chi tiết cho giáo viên.
- `DEPLOY_VERCEL.md`: deploy lên Vercel.
- `NGAY_THI_CHECKLIST.md`: việc cần làm trong ngày thi.
