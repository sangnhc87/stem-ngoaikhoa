# Checklist ngày thi AI Quest Engine

## Trước cuộc thi

- Chạy thử local hoặc production ít nhất 1 ngày trước.
- Kiểm tra Supabase migration đã chạy thành công.
- Kiểm tra đã có mùa thi đúng.
- Kiểm tra đã import đủ đội.
- Kiểm tra đã import đủ thử thách.
- Kiểm tra đã import đủ đáp án.
- Kiểm tra file thử thách tải được.
- Kiểm tra `/leaderboard` và `/display`.
- In hoặc lưu danh sách tài khoản đội.
- Không để học sinh thấy file `answers.csv` hoặc `test-keys-output.txt`.

## 30 phút trước giờ thi

- Mở `/admin`.
- Đăng nhập bằng mật khẩu giáo viên.
- Chọn đúng mùa thi.
- Đảm bảo mùa thi đang ở `Nháp`.
- Đăng nhập thử 1 đội.
- Mở `/display` trên máy chiếu.
- Mở `/leaderboard` trên máy giáo viên.
- Kiểm tra internet phòng thi.
- Chuẩn bị phương án phát đề dự phòng nếu mất mạng.

## Khi bắt đầu

- Vào `/admin`.
- Chọn đúng mùa thi.
- Bấm `Đang mở`.
- Thông báo link `/login` cho học sinh.
- Nhắc học sinh không nộp liên tục quá nhanh vì hệ thống có giới hạn 3 giây.

## Trong lúc thi

- Theo dõi `/display` trên máy chiếu.
- Theo dõi `/admin` mục `Nhật ký nộp bài`.
- Theo dõi mục `Đội cần chú ý`.
- Nếu một đội báo không vào được, kiểm tra lại mã đội và mật khẩu.
- Nếu nhiều đội cùng lỗi, kiểm tra trạng thái mùa thi có đang `Đang mở` không.
- Không bấm `Reset` khi cuộc thi đang diễn ra.

## Khi kết thúc

- Vào `/admin`.
- Chọn đúng mùa thi.
- Bấm `Đã đóng`.
- Kiểm tra `/leaderboard`.
- Chụp màn hình bảng xếp hạng cuối.
- Ghi lại top đội, số cửa đã giải, số lần sai và thời gian mở cửa cuối.
- Không reset mùa thi cho đến khi ban tổ chức đã xác nhận kết quả.

## Nếu internet phòng thi bị lỗi

- Bình tĩnh thông báo tạm dừng.
- Không bấm reset mùa thi.
- Nếu mạng phục hồi nhanh, tiếp tục thi bình thường.
- Nếu mất mạng lâu, chuyển sang phương án dự phòng:
  - Phát đề dạng file/PDF đã chuẩn bị.
  - Ghi nhận đáp án thủ công.
  - Sau khi có mạng, nhập lại kết quả nếu cần.

## Nếu Vercel bị lỗi

- Kiểm tra link production có mở được trên 4G không.
- Vào Vercel dashboard xem deployment mới nhất có báo lỗi không.
- Nếu vừa sửa environment variables, bấm `Redeploy`.
- Nếu production không phục hồi kịp, dùng máy local đã chuẩn bị:

```bash
pnpm dev
```

Sau đó cho học sinh trong cùng mạng mở địa chỉ local/network do Next.js in ra.

## Nếu một đội quên mật khẩu

- Vào `/admin`.
- Kiểm tra danh sách đội để xác nhận đúng mã đội.
- Nếu dùng dữ liệu seed, mật khẩu mẫu là `123456`.
- Nếu là dữ liệu import, mở lại file `teams.csv` gốc để xem mật khẩu đã phát.
- Không hỏi hoặc xem mật khẩu trong database vì database chỉ lưu hash.

## Cách đóng cuộc thi

- Vào `/admin`.
- Chọn đúng mùa thi.
- Bấm `Đã đóng`.
- Thử nộp khóa bằng một đội bất kỳ để kiểm tra hệ thống báo cuộc thi đã đóng.
- Chụp màn hình `/leaderboard`.

## Cách kiểm tra kết quả cuối

- Mở `/leaderboard`.
- Xếp hạng theo:
  1. Số cửa đã giải cao hơn.
  2. Thời gian mở cửa cuối sớm hơn.
  3. Số lần sai ít hơn.
- Mở `/admin` để xem nhật ký nộp bài nếu có khiếu nại.
- Mục `Đội cần chú ý` giúp xem đội có số lần sai cao.

## Không được làm trong ngày thi

- Không đổi `ANSWER_HASH_SECRET`.
- Không đổi `SESSION_SECRET`.
- Không chạy lại SQL migration trên project đang thi.
- Không chạy `pnpm seed` trên production nếu mùa thi thật đang dùng.
- Không gửi `SUPABASE_SERVICE_ROLE_KEY` cho học sinh.
