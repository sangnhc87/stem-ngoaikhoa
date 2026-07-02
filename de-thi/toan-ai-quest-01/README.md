# Toan AI Quest 01 - Bo de dau tien cho toan truong

Bo de nay duoc thiet ke cho ngoai khoa Toan, moi lop mot doi, cho phep hoc sinh dung AI thoai mai. Tinh than khong phai "cam AI", ma la bat buoc biet hoi, biet kiem chung, biet phan bien va biet bien loi giai thanh dap an chinh xac.

File xem trực tiếp 30 câu: `DE_BAI.md`.
File đáp án và giải thích cho BTC: `DAP_AN_VA_GIAI_THICH.md`.

## Cach thi de hap dan

- Moi lop la mot doi, dang nhap bang ma lop/ma doi.
- Co 30 cua, tu de den kho, chia thanh cac module: khoi dong, so hoc, hinh hoc, xac suat, toi uu, du lieu, boss.
- Doi duoc dung ChatGPT/Gemini/Copilot/may tinh/tim kiem thoai mai.
- Luat quan trong: AI chi la cong su; doi phai tu kiem tra dap an truoc khi nop khoa.
- Khoa nop cua moi cua co dang `AIQxx-KETQUA-MADOI`, vi du `AIQ01-5050-10A1`.
- Bang xep hang uu tien so cua da giai va thoi gian mo cua gan nhat; doi nop sai se bi ghi nhat ky.

## Tao CSV de import

1. Tao mua thi trong trang `/admin`, copy `season_id` tren URL.
2. Chuan bi file danh sach lop, moi dong mot lop:

```txt
10A1
10A2
11A1
11A2
12A1
```

Hoac moi dong co du thong tin:

```txt
10A1,Doi 10A1,pass10A1
10A2,Doi 10A2,pass10A2
```

3. Chay lenh:

```bash
pnpm tsx scripts/generate-math-ai-season.ts --season <SEASON_ID> --classes de-thi/toan-ai-quest-01/classes.example.txt --out tmp/math-ai-quest-01
```

4. Vao `/admin`, import theo thu tu:

- `teams.csv`
- `challenges.csv`
- `answers.csv`

## Goi y van hanh

- Thoi luong dep: 90-120 phut.
- Mo man: 5 phut giai thich "AI duoc phep, nhung nop sai se mat nhip".
- Nen chieu `/display` len man hinh lon.
- BGK dung `/monitor` de xem doi nao bi ket lau.
- Neu muon giam chuyen chia khoa, doi mat khau rieng tung lop va khoa da co hau to ma doi.

## Khung cham diem phu neu muon co giai sang tao

He thong tu dong xep hang theo tien do. Ngoai ra co the them giai phu:

- Prompt hay nhat: doi viet duoc prompt ro rang, co buoc kiem chung.
- Loi giai dep nhat: doi trinh bay ngan gon, dung lap luan Toan.
- Phan bien AI tot nhat: doi phat hien AI sai va sua duoc.
- Hop tac tot nhat: doi phan cong nguoi hoi AI, nguoi tinh, nguoi kiem tra, nguoi nop khoa.
