# Hướng dẫn cài đặt AI Quest Engine cho giáo viên

Tài liệu này dành cho giáo viên không chuyên lập trình. Nếu có bước nào liên quan đến Terminal hoặc GitHub, thầy/cô có thể nhờ giáo viên Tin học hoặc bộ phận IT hỗ trợ trong lần đầu.

## 1. Tạo project Supabase

Supabase là nơi lưu dữ liệu cuộc thi: mùa thi, đội, thử thách, đáp án đã hash và nhật ký nộp bài.

1. Vào `https://supabase.com`.
2. Đăng nhập hoặc tạo tài khoản.
3. Bấm `New project`.
4. Chọn tổ chức hoặc tạo tổ chức mới.
5. Nhập tên project, ví dụ `ai-quest-engine`.
6. Tạo mật khẩu database mạnh và lưu lại ở nơi an toàn.
7. Chọn region gần Việt Nam nhất nếu có.
8. Bấm tạo project và chờ Supabase khởi tạo xong.

Sau khi project tạo xong, vào `Project Settings` -> `API` để lấy:

- `Project URL`: dùng cho `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key`: dùng cho `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key`: dùng cho `SUPABASE_SERVICE_ROLE_KEY`

Không gửi `service_role key` cho học sinh.

## 2. Chạy SQL migration

Migration là đoạn SQL tạo bảng dữ liệu, rule bảo mật, bucket lưu file và hàm kiểm tra đáp án.

1. Mở Supabase project.
2. Vào `SQL Editor`.
3. Bấm `New query`.
4. Mở file `supabase/migrations/20260702000000_initial_schema.sql` trong mã nguồn.
5. Sao chép toàn bộ nội dung file đó.
6. Dán vào Supabase SQL Editor.
7. Bấm `Run`.
8. Nếu chạy thành công, Supabase sẽ tạo các bảng `seasons`, `teams`, `challenges`, `answers`, `submissions`, `files` và bucket `challenge-files`.

Nếu báo lỗi, không chạy lại nhiều lần vội. Đọc phần “Lỗi thường gặp” ở cuối tài liệu.

## 3. Tạo project Vercel

Vercel là nơi đưa website lên Internet.

1. Vào `https://vercel.com`.
2. Đăng nhập bằng GitHub.
3. Bấm `Add New` -> `Project`.
4. Chọn repository chứa mã nguồn AI Quest Engine.
5. Vercel thường tự nhận framework là `Next.js`.
6. Giữ build command mặc định là `pnpm build`.
7. Chưa bấm deploy nếu chưa nhập environment variables ở bước tiếp theo.

Trong `Project Settings`, nên chọn Node.js version là `22.x` nếu Vercel cho chọn.

## 4. Thiết lập environment variables

Environment variables là các “chìa khóa” để website kết nối Supabase và bảo vệ phiên đăng nhập.

Trong Vercel project, vào `Settings` -> `Environment Variables`, thêm các biến sau:

| Tên biến | Giá trị cần nhập |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL trong Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key trong Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key trong Supabase |
| `SUPABASE_STORAGE_BUCKET` | `challenge-files` |
| `ADMIN_PASSWORD` | Mật khẩu giáo viên tự đặt |
| `SESSION_SECRET` | Chuỗi bí mật ít nhất 32 ký tự |
| `ANSWER_HASH_SECRET` | Chuỗi bí mật khác, ít nhất 32 ký tự |
| `IP_HASH_SECRET` | Chuỗi bí mật khác, ít nhất 32 ký tự |
| `NEXT_PUBLIC_APP_URL` | Địa chỉ website Vercel sau khi deploy |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` |

Gợi ý tạo secret: dùng chuỗi dài, ngẫu nhiên, không dùng tên trường, ngày sinh, số điện thoại hoặc mật khẩu quen thuộc.

Ví dụ secret hợp lệ:

```text
aqe-2026-8XqT9pLm3VnR7sK2cD4hY6zB1wE5uJ
```

Không đặt `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `ANSWER_HASH_SECRET`, `IP_HASH_SECRET` với tiền tố `NEXT_PUBLIC_`.

## 5. Chạy local trên máy tính

Chạy local dùng để thử trước khi deploy hoặc trước ngày thi.

1. Cài Node.js bản 22 từ `https://nodejs.org`.
2. Mở thư mục mã nguồn trên máy.
3. Tạo file `.env.local` bằng cách sao chép `.env.example`.
4. Điền đủ các biến môi trường giống bước 4.
5. Mở Terminal trong thư mục mã nguồn.
6. Chạy lần lượt:

```bash
corepack enable
corepack prepare pnpm@10.12.1 --activate
pnpm install
pnpm dev
```

7. Mở trình duyệt vào `http://localhost:3000`.

Các đường dẫn cần kiểm tra:

- `http://localhost:3000/login`
- `http://localhost:3000/admin`
- `http://localhost:3000/leaderboard`
- `http://localhost:3000/display`

## 6. Deploy lên Vercel

Sau khi đã nhập environment variables:

1. Vào Vercel project.
2. Bấm `Deploy` hoặc push code mới lên GitHub.
3. Chờ build hoàn tất.
4. Khi Vercel báo thành công, mở link production.
5. Vào `/admin` để đăng nhập bằng `ADMIN_PASSWORD`.
6. Cập nhật `NEXT_PUBLIC_APP_URL` trong Vercel thành đúng link production nếu trước đó chưa có.
7. Deploy lại một lần nữa nếu vừa sửa `NEXT_PUBLIC_APP_URL`.

## 7. Tạo mùa thi mới

1. Vào `https://ten-website-cua-thay-co.vercel.app/admin`.
2. Nhập mật khẩu quản trị.
3. Ở khối `Tạo mùa thi`, nhập:
   - Tên mùa thi, ví dụ `AI Quest 2026`
   - Năm, ví dụ `2026`
   - Chủ đề, ví dụ `Giải cứu Phòng thí nghiệm STEM`
4. Bấm `Tạo mùa`.
5. Mùa mới ban đầu ở trạng thái `Nháp`, học sinh chưa nộp bài được.

## 8. Import đội

Chuẩn bị file `teams.csv` bằng Excel hoặc Google Sheets, sau đó tải xuống dạng CSV.

Cột bắt buộc:

```csv
season_id,team_id,team_name,password
```

Ví dụ:

```csv
season_id,team_id,team_name,password
id-mua-thi,T01,10A1,123456
id-mua-thi,T02,10A2,123456
```

Cách lấy `season_id`: vào `/admin`, chọn mùa thi, copy ID mùa thi từ URL sau `season_id=`.

Trong `/admin`:

1. Tìm khối `Import đội`.
2. Chọn file `teams.csv`.
3. Bấm `Xem trước`.
4. Nếu không có lỗi, chọn lại file và bấm `Nhập dữ liệu`.

Mật khẩu đội sẽ được hash trước khi lưu. Preview không hiển thị mật khẩu thật.

## 9. Import thử thách

Chuẩn bị file `challenges.csv`.

Cột bắt buộc:

```csv
season_id,door,title,mission,file_url,difficulty,module,is_boss
```

Ví dụ:

```csv
season_id,door,title,mission,file_url,difficulty,module,is_boss
id-mua-thi,1,Tín hiệu đầu tiên,Hãy giải mã thông điệp đầu tiên,,1,Khởi động,false
id-mua-thi,2,Mạch an toàn,Hãy tìm tổ hợp logic đúng,,2,Logic,false
```

Ghi chú:

- `door` là số cửa: 1, 2, 3...
- `file_url` có thể để trống nếu chưa có file.
- `is_boss` dùng `true` cho cửa cuối hoặc thử thách đặc biệt, còn lại dùng `false`.
- Nếu cần tải file đề lên, có thể tạo thử thách trước rồi dùng nút tải file trong bảng thử thách.

Trong `/admin`:

1. Tìm khối `Import thử thách`.
2. Chọn file CSV.
3. Bấm `Xem trước`.
4. Nếu không có lỗi, chọn lại file và bấm `Nhập dữ liệu`.

## 10. Import đáp án

Chỉ import đáp án sau khi đã import đội và thử thách.

Chuẩn bị file `answers.csv`.

Cột bắt buộc:

```csv
season_id,team_id,door,key
```

Ví dụ:

```csv
season_id,team_id,door,key
id-mua-thi,T01,1,KHOA-RIENG-CUA-T01-CUA-1
id-mua-thi,T02,1,KHOA-RIENG-CUA-T02-CUA-1
```

Trong `/admin`:

1. Tìm khối `Import đáp án`.
2. Chọn file CSV.
3. Bấm `Xem trước`.
4. Nếu không có lỗi, chọn lại file và bấm `Nhập dữ liệu`.

Đáp án thật không được lưu dạng chữ thường. Hệ thống hash đáp án trước khi lưu. Preview cũng không hiển thị khóa thật.

## 11. Mở và đóng cuộc thi

Trong `/admin`, chọn đúng mùa thi.

- Bấm `Nháp`: dùng khi đang chuẩn bị, đội chưa nộp được.
- Bấm `Đang mở`: bắt đầu cho học sinh nộp khóa.
- Bấm `Đã đóng`: kết thúc cuộc thi, mọi lượt nộp mới bị chặn và vẫn được ghi log.

Không mở cuộc thi trước khi đã kiểm tra đủ đội, thử thách và đáp án.

## 12. Việc cần làm trong ngày thi

Trước giờ thi:

1. Mở `/admin`, kiểm tra đúng mùa thi.
2. Kiểm tra số đội.
3. Kiểm tra số thử thách.
4. Kiểm tra đã import đáp án.
5. Cho 1 đội test đăng nhập thử.
6. Đặt mùa thi về `Nháp` sau khi test.
7. Mở `/display` trên máy chiếu.
8. Mở `/leaderboard` trên máy giáo viên nếu cần theo dõi riêng.

Khi bắt đầu:

1. Vào `/admin`.
2. Chọn mùa thi.
3. Bấm `Đang mở`.
4. Thông báo học sinh đăng nhập tại `/login`.

Trong lúc thi:

1. Theo dõi `/display` trên máy chiếu.
2. Theo dõi `Nhật ký nộp bài` trong `/admin`.
3. Xem mục `Đội cần chú ý` nếu đội nào sai quá nhiều.
4. Nếu cần tạm dừng, chuyển mùa thi về `Nháp` hoặc `Đã đóng`.

Khi kết thúc:

1. Bấm `Đã đóng`.
2. Không reset mùa thi cho đến khi đã lưu kết quả.
3. Chụp hoặc xuất bảng xếp hạng nếu cần báo cáo.

## 13. Lỗi thường gặp và cách xử lý

`Missing required environment variable`

- Nguyên nhân: thiếu biến môi trường.
- Cách xử lý: kiểm tra lại `.env.local` khi chạy local hoặc Vercel `Settings` -> `Environment Variables`.

`Mã đội hoặc mật khẩu không đúng`

- Nguyên nhân: nhập sai mã đội, sai mật khẩu hoặc import nhầm file đội.
- Cách xử lý: kiểm tra `teams.csv`, tạo lại đội nếu cần.

`Cuộc thi chưa mở hoặc đã đóng`

- Nguyên nhân: mùa thi đang ở `Nháp` hoặc `Đã đóng`.
- Cách xử lý: vào `/admin`, chọn mùa thi và bấm `Đang mở`.

`Chưa có đáp án cho đội và cửa này`

- Nguyên nhân: thiếu dòng trong `answers.csv`.
- Cách xử lý: bổ sung đúng `season_id`, `team_id`, `door`, `key`, rồi import lại.

`Dữ liệu đã tồn tại`

- Nguyên nhân: CSV có đội/cửa/đáp án đã nhập trước đó.
- Cách xử lý: xóa dòng trùng khỏi CSV hoặc tạo mùa thi mới nếu muốn nhập lại từ đầu.

`CSV thiếu cột bắt buộc`

- Nguyên nhân: tên cột sai hoặc thiếu.
- Cách xử lý: dùng đúng tên cột trong các mẫu ở trên, viết thường và có dấu gạch dưới.

`Đáp án tham chiếu đội chưa tồn tại`

- Nguyên nhân: import đáp án trước khi import đội, hoặc `team_id` trong answers.csv sai.
- Cách xử lý: import đội trước, sau đó kiểm tra lại `team_id`.

`Đáp án tham chiếu cửa chưa tồn tại`

- Nguyên nhân: import đáp án trước khi import thử thách, hoặc số `door` sai.
- Cách xử lý: import thử thách trước, sau đó kiểm tra lại số cửa.

Vercel build thất bại

- Nguyên nhân thường gặp: thiếu environment variables, Node version quá cũ hoặc chưa bật Corepack.
- Cách xử lý: kiểm tra Vercel environment variables, chọn Node.js 22.x nếu có, thêm `ENABLE_EXPERIMENTAL_COREPACK=1`.

Supabase báo lỗi khi chạy SQL

- Nguyên nhân thường gặp: đã chạy một phần migration trước đó hoặc copy thiếu SQL.
- Cách xử lý: nếu là project mới, tạo project Supabase mới và chạy lại đầy đủ SQL. Nếu là project đang dùng thật, không xóa dữ liệu; nhờ người có kỹ thuật kiểm tra.

Học sinh nộp liên tục bị báo chờ 3 giây

- Nguyên nhân: hệ thống có rate limit để tránh spam.
- Cách xử lý: yêu cầu đội chờ ít nhất 3 giây giữa các lượt nộp.

## Tài liệu chính thức

- Supabase SQL Editor và database: `https://supabase.com/docs/guides/database/overview`
- Supabase migrations: `https://supabase.com/docs/guides/deployment/database-migrations`
- Vercel environment variables: `https://vercel.com/docs/environment-variables`
- Next.js trên Vercel: `https://vercel.com/docs/frameworks/full-stack/nextjs`
