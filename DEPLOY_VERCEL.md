# Deploy AI Quest Engine lên Vercel

Tài liệu này dành cho giáo viên. Làm lần lượt từng bước, không cần tự đoán.

## 1. Đưa mã nguồn lên GitHub

Nếu repo này chưa nằm trên GitHub:

1. Tạo tài khoản GitHub tại `https://github.com`.
2. Tạo repository mới, ví dụ `ai-quest-engine`.
3. Mở Terminal trong thư mục repo:

```bash
cd /Users/admin/stem-ngoaikhoa
git add .
git commit -m "Prepare AI Quest Engine deployment"
git branch -M main
git remote add origin https://github.com/TAI_KHOAN_CUA_THAY_CO/ai-quest-engine.git
git push -u origin main
```

Nếu repo đã có remote GitHub, chỉ cần:

```bash
git add .
git commit -m "Prepare AI Quest Engine deployment"
git push
```

## 2. Tạo project trên Vercel

1. Vào `https://vercel.com`.
2. Đăng nhập bằng GitHub.
3. Bấm `Add New` -> `Project`.
4. Chọn repository `ai-quest-engine`.
5. Vercel sẽ nhận framework là `Next.js`.
6. Build command dùng:

```bash
pnpm build
```

7. Install command dùng:

```bash
pnpm install
```

8. Chưa deploy nếu chưa nhập environment variables.

## 3. Dán environment variables vào Vercel

Trong Vercel project, vào:

```text
Settings -> Environment Variables
```

Thêm đủ các biến sau:

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

Giá trị gợi ý:

```text
SUPABASE_STORAGE_BUCKET=challenge-files
ENABLE_EXPERIMENTAL_COREPACK=1
```

Các biến lấy từ Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Các biến tự đặt:

```text
ADMIN_PASSWORD
SESSION_SECRET
ANSWER_HASH_SECRET
IP_HASH_SECRET
```

Secret nên dài ít nhất 32 ký tự.

Không chia sẻ `SUPABASE_SERVICE_ROLE_KEY` cho học sinh.

## 4. Đặt NEXT_PUBLIC_APP_URL

Ở lần deploy đầu tiên, nếu chưa biết URL Vercel, có thể tạm đặt:

```text
NEXT_PUBLIC_APP_URL=https://ten-project-tam.vercel.app
```

Sau khi Vercel deploy xong, copy URL production thật, ví dụ:

```text
https://ai-quest-engine.vercel.app
```

Quay lại:

```text
Settings -> Environment Variables
```

Sửa:

```text
NEXT_PUBLIC_APP_URL=https://ai-quest-engine.vercel.app
```

Sau đó redeploy.

## 5. Deploy

1. Trong Vercel project, bấm `Deploy`.
2. Chờ build hoàn tất.
3. Nếu build thành công, Vercel sẽ hiện link production.

Nếu vừa sửa environment variables:

1. Vào tab `Deployments`.
2. Chọn deployment mới nhất.
3. Bấm dấu ba chấm.
4. Chọn `Redeploy`.

## 6. Kiểm tra production links

Thay `https://your-project.vercel.app` bằng URL thật.

```text
https://your-project.vercel.app/login
https://your-project.vercel.app/admin
https://your-project.vercel.app/leaderboard
https://your-project.vercel.app/display
```

Kiểm tra:

1. `/login` mở được.
2. `/admin` đăng nhập được bằng `ADMIN_PASSWORD`.
3. Trong `/admin`, thấy mùa thi đã seed hoặc đã import.
4. Chuyển mùa thi sang `Đang mở`.
5. Đội mẫu `T01 / 123456` đăng nhập được nếu đã chạy `pnpm seed`.
6. Nộp sai khóa thì bị báo sai.
7. Nộp đúng khóa test thì mở cửa tiếp theo.
8. `/leaderboard` cập nhật.
9. `/display` hiển thị tốt trên máy chiếu.

## 7. Lỗi thường gặp

### Build báo thiếu environment variable

Vào Vercel `Settings -> Environment Variables` và kiểm tra đã nhập đủ biến chưa.

### pnpm không chạy trên Vercel

Kiểm tra biến:

```text
ENABLE_EXPERIMENTAL_COREPACK=1
```

### Website mở được nhưng đăng nhập lỗi

Kiểm tra:

- Đã chạy SQL migration chưa.
- Đã chạy `pnpm seed` hoặc import đội chưa.
- Supabase URL/key trong Vercel có đúng project không.

### Admin không đăng nhập được

Kiểm tra `ADMIN_PASSWORD` trong Vercel. Sau khi sửa biến môi trường, cần redeploy.

### Đội nộp khóa nhưng bị báo cuộc thi chưa mở

Vào `/admin`, chọn đúng mùa thi và bấm `Đang mở`.

### Không tải được file thử thách

Kiểm tra migration đã tạo bucket `challenge-files` chưa và `SUPABASE_STORAGE_BUCKET=challenge-files`.
