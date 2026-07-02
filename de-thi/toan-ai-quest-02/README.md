# Toan AI Quest 02 - Omega Challenge

Bo 2 kho hon bo 1, phu hop khi truong muon to chuc mot mua thi co tinh canh tranh cao hon. De van cho phep hoc sinh dung AI thoai mai, nhung cac cua duoc thiet ke de AI de tinh nham, bo sot dieu kien, hoac tra loi qua nhanh neu hoc sinh khong biet kiem chung.

Ban hien tai la ban 2.1: cac cua cuoi duoc nang cap them ve du lieu ngoai lai, mat ma hoc RSA mini, truy vet quy luat, dinh thuc 3x3, duong di ngan nhat va toi uu lich thi.

File xem trực tiếp 30 câu: `DE_BAI.md`.
File đáp án và giải thích cho BTC: `DAP_AN_VA_GIAI_THICH.md`.

## Quy mo phu hop

- 1 khoi: 14-16 doi.
- 2 khoi: 28-32 doi.
- 3 khoi: 42-48 doi.
- Thoi luong goi y: 120 phut.
- Moi doi la mot lop, moi lop 1 may/nhom may, duoc dung AI khong gioi han.

## Tinh than bo de

- 10 cua dau: tang toc, tao hung phan.
- 10 cua giua: can biet dung AI de lap bang, giai thich va kiem chung.
- 10 cua cuoi: co boss, do thi, toi uu, dong du, du lieu, de tach top.
- Khoa nop theo ma doi, vi du `AIO02-01-2500-10A1`.

## Tao CSV de import

1. Tao mua thi trong `/admin`, copy `season_id` tu URL.
2. Sua file lop tu mau `classes.example.txt`, hoac tao file rieng.
3. Chay:

```bash
pnpm tsx scripts/generate-math-ai-season-02.ts --season <SEASON_ID> --classes de-thi/toan-ai-quest-02/classes.example.txt --out tmp/math-ai-quest-02
```

4. Import trong `/admin` theo thu tu:

- `teams.csv`
- `challenges.csv`
- `answers.csv`

File dap an va giai thich cho BTC nam tai `DAP_AN_VA_GIAI_THICH.md`.

## Goi y to chuc hay hon

- Cong bo truoc: "AI duoc phep, nhung doi phai tu chiu trach nhiem neu AI sai."
- Moi doi phan vai: nguoi prompt, nguoi tinh tay, nguoi kiem chung, nguoi nop khoa.
- BGK co the trao giai phu cho doi co prompt hay, loi giai dep, phan bien AI tot.
- Neu thi 3 khoi, nen dung man hinh `/display` va monitor `/monitor` de tao cam giac giai dau.
