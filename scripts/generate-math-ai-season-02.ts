import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type TeamInput = {
  team_id: string;
  team_name: string;
  password: string;
};

type ChallengeSeed = {
  door: number;
  title: string;
  mission: string;
  key: string;
  difficulty: number;
  module: string;
  is_boss?: boolean;
};

const challenges: ChallengeSeed[] = [
  {
    door: 1,
    title: "Omega mo khoa",
    module: "Khoi dong",
    difficulty: 2,
    key: "AIO02-01-2500",
    mission: [
      "Duoc dung AI thoai mai, nhung phai yeu cau AI dua ra cong thuc va cach kiem chung.",
      "Tinh tong cac so le tu 1 den 99.",
      "Nop khoa dang AIO02-01-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 2,
    title: "Hieu hai binh phuong",
    module: "Dai so",
    difficulty: 2,
    key: "AIO02-02-197",
    mission: [
      "Tinh nhanh 99^2 - 98^2.",
      "Doi nen hoi AI cach dung hang dang thuc, roi tu kiem tra bang phep nhan.",
      "Nop khoa dang AIO02-02-<ket qua>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 3,
    title: "Chu ky luy thua",
    module: "Modulo",
    difficulty: 3,
    key: "AIO02-03-3",
    mission: [
      "Tim so du cua 3^2026 khi chia cho 13.",
      "Hay yeu cau AI tim chu ky, nhung doi phai tu viet lai it nhat 3 luy thua dau de xac nhan.",
      "Nop khoa dang AIO02-03-<so du>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 4,
    title: "UCLN an trong",
    module: "So hoc",
    difficulty: 3,
    key: "AIO02-04-154",
    mission: [
      "Tim UCLN cua 462 va 1078.",
      "Doi hay dung thuat toan Euclid va kiem lai bang cach chia hai so cho UCLN.",
      "Nop khoa dang AIO02-04-<UCLN>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 5,
    title: "So uoc cua 360",
    module: "So hoc",
    difficulty: 3,
    key: "AIO02-05-24",
    mission: [
      "So 360 co bao nhieu uoc duong?",
      "Goi y: phan tich thua so nguyen to roi dung cong thuc dem uoc.",
      "Nop khoa dang AIO02-05-<so uoc>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 6,
    title: "Chu so 0 cuoi cung",
    module: "To hop",
    difficulty: 3,
    key: "AIO02-06-24",
    mission: [
      "So 100! co bao nhieu chu so 0 tan cung?",
      "Hay hoi AI vi sao chi can dem so thua so 5.",
      "Nop khoa dang AIO02-06-<so chu so 0>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 7,
    title: "Chon ban chien luoc",
    module: "To hop",
    difficulty: 3,
    key: "AIO02-07-220",
    mission: [
      "Tu 12 hoc sinh, chon 3 ban vao ban chien luoc. Khong phan vai.",
      "Co bao nhieu cach chon?",
      "Nop khoa dang AIO02-07-<so cach>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 8,
    title: "Mat khau MATHTEAM",
    module: "Hoan vi",
    difficulty: 4,
    key: "AIO02-08-5040",
    mission: [
      "Co bao nhieu cach sap xep cac chu cai cua tu MATHTEAM?",
      "Luu y co chu lap. Doi phai kiem tra so lan lap cua tung chu.",
      "Nop khoa dang AIO02-08-<so cach>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 9,
    title: "It nhat mot mat 6",
    module: "Xac suat",
    difficulty: 4,
    key: "AIO02-09-91-216",
    mission: [
      "Gieo 3 xuc xac can doi. Xac suat co it nhat mot xuc xac ra mat 6 la bao nhieu?",
      "Viet dap an duoi dang phan so toi gian a/b.",
      "Nop khoa dang AIO02-09-<a>-<b>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 10,
    title: "Boss 1 - Da giac Omega",
    module: "Hinh hoc toa do",
    difficulty: 6,
    is_boss: true,
    key: "AIO02-10-65",
    mission: [
      "Da giac co cac dinh theo thu tu: (1,1), (7,2), (6,6), (3,8), (0,5).",
      "Tinh 2 lan dien tich cua da giac. Yeu cau AI dung cong thuc day giay, doi tu thay so lai.",
      "Nop khoa dang AIO02-10-<2S>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 11,
    title: "He hai an co bay",
    module: "Dai so",
    difficulty: 3,
    key: "AIO02-11-514",
    mission: [
      "Giai he: 3x + 4y = 71 va x + y = 19.",
      "Ghep dap an theo dang xy. Vi du x=2, y=8 thi ghi 208.",
      "Nop khoa dang AIO02-11-<xy>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 12,
    title: "Tich lon nhat",
    module: "Toi uu",
    difficulty: 4,
    key: "AIO02-12-400",
    mission: [
      "Hai so duong co tong bang 40. Tich lon nhat co the dat duoc la bao nhieu?",
      "Doi hay yeu cau AI giai bang bat dang thuc hoac parabol, roi tu kiem chung.",
      "Nop khoa dang AIO02-12-<tich lon nhat>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 13,
    title: "Giai ma affine",
    module: "Modulo",
    difficulty: 5,
    key: "AIO02-13-1",
    mission: [
      "Ham ma hoa f(n) = 5n + 7 (mod 26).",
      "Tim n trong tap 0 den 25 sao cho f(n) = 12.",
      "Nop khoa dang AIO02-13-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 14,
    title: "Binary 2027",
    module: "Tin hoc Toan",
    difficulty: 4,
    key: "AIO02-14-11111101011",
    mission: [
      "Doi so 2027 tu he thap phan sang he nhi phan.",
      "Khong them tien to 0b.",
      "Nop khoa dang AIO02-14-<ket qua binary>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 15,
    title: "Tong nhan doi",
    module: "Day so",
    difficulty: 3,
    key: "AIO02-15-765",
    mission: [
      "Tinh 3 + 6 + 12 + 24 + ... + 384.",
      "Doi can nhan ra day nhan doi va xac dinh dung so hang.",
      "Nop khoa dang AIO02-15-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 16,
    title: "Thap Ha Noi cap Omega",
    module: "De quy",
    difficulty: 4,
    key: "AIO02-16-1023",
    mission: [
      "Thap Ha Noi co 10 dia. Moi lan chi chuyen 1 dia va khong dat dia lon len dia nho.",
      "So buoc it nhat la bao nhieu?",
      "Nop khoa dang AIO02-16-<so buoc>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 17,
    title: "Do thi day du K10",
    module: "Do thi",
    difficulty: 4,
    key: "AIO02-17-45",
    mission: [
      "Co 10 doi muon moi cap doi co mot tran dau rieng.",
      "Tong cong can bao nhieu tran?",
      "Nop khoa dang AIO02-17-<so tran>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 18,
    title: "105 cai bat tay",
    module: "To hop",
    difficulty: 4,
    key: "AIO02-18-15",
    mission: [
      "Trong mot nhom, moi cap hoc sinh bat tay dung 1 lan. Tong cong co 105 cai bat tay.",
      "Nhom do co bao nhieu hoc sinh?",
      "Nop khoa dang AIO02-18-<so hoc sinh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 19,
    title: "Diem trung binh sau khi bo mot diem",
    module: "Thong ke",
    difficulty: 3,
    key: "AIO02-19-70",
    mission: [
      "15 diem co trung binh cong la 72. Neu bo di mot diem 100, trung binh cua 14 diem con lai la bao nhieu?",
      "Nop khoa dang AIO02-19-<trung binh moi>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 20,
    title: "Boss 2 - Doc du lieu khong nham",
    module: "Thong ke",
    difficulty: 6,
    is_boss: true,
    key: "AIO02-20-998",
    mission: [
      "Day du lieu: 4, 4, 5, 7, 9, 9, 9, 10, 12.",
      "Tim mode, median va range. Ghep 3 ket qua theo thu tu mode-median-range.",
      "Nop khoa dang AIO02-20-<mode><median><range>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 21,
    title: "So gan dung tat ca - Omega",
    module: "Dong du",
    difficulty: 7,
    key: "AIO02-21-27721",
    mission: [
      "Tim so nguyen duong n nho nhat sao cho khi chia n cho moi so tu 2 den 12 deu du 1.",
      "Goi y: n - 1 chia het cho tat ca cac so tu 2 den 12.",
      "Nop khoa dang AIO02-21-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 22,
    title: "Ba khoa dong du",
    module: "Dong du",
    difficulty: 6,
    key: "AIO02-22-17",
    mission: [
      "Tim so nguyen duong n nho nhat thoa man: n chia 4 du 1, chia 5 du 2, chia 7 du 3.",
      "Duoc dung AI de lap bang, nhung doi phai tu kiem lai ca 3 phep chia.",
      "Nop khoa dang AIO02-22-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 23,
    title: "Tam giac 20-21-29",
    module: "Hinh hoc",
    difficulty: 5,
    key: "AIO02-23-6",
    mission: [
      "Mot tam giac vuong co hai canh goc vuong 20 va 21, canh huyen 29.",
      "Tinh ban kinh duong tron noi tiep tam giac.",
      "Nop khoa dang AIO02-23-<ban kinh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 24,
    title: "Du lieu ngoai lai",
    module: "Du lieu",
    difficulty: 6,
    key: "AIO02-24-24",
    mission: [
      "Day du lieu thoi gian hoan thanh cua 10 nhom, don vi phut: 20, 21, 22, 23, 24, 25, 26, 27, 28, 99.",
      "Gia tri 99 la ngoai lai do nhom quen bam ket thuc. Hay loai gia tri lon nhat roi tinh trung binh cong cua 9 gia tri con lai.",
      "Doi nen yeu cau AI giai thich vi sao ngoai lai co the lam meo trung binh.",
      "Nop khoa dang AIO02-24-<trung binh sau khi loai ngoai lai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 25,
    title: "Phan bien AI: bai may san xuat",
    module: "Kiem chung",
    difficulty: 5,
    key: "AIO02-25-6",
    mission: [
      "Mot AI noi: Neu 6 may lam 6 san pham trong 6 phut, thi 60 may lam 60 san pham trong 60 phut.",
      "AI sai. 60 may lam 60 san pham mat bao nhieu phut?",
      "Nop khoa dang AIO02-25-<so phut>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 26,
    title: "RSA mini",
    module: "Mat ma hoc",
    difficulty: 7,
    key: "AIO02-26-103",
    mission: [
      "Trong mot he RSA mini, p = 11, q = 13 nen phi(n) = (p-1)(q-1). Chon e = 7.",
      "Tim so d nho nhat duong sao cho e*d chia cho phi(n) du 1.",
      "Duoc hoi AI ve nghich dao modulo, nhung doi phai tu kiem lai bang phep chia du.",
      "Nop khoa dang AIO02-26-<d>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 27,
    title: "Truy vet cong thuc an",
    module: "Day so",
    difficulty: 6,
    key: "AIO02-27-231",
    mission: [
      "Mot AI du doan day so sau la bac hai: 6, 15, 28, 45, 66, ...",
      "Hay kiem tra sai phan bac hai va tim so hang thu 10.",
      "Goi y: neu sai phan bac hai khong doi, co the tim cong thuc hoac keo dai bang bang sai phan.",
      "Nop khoa dang AIO02-27-<so hang thu 10>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 28,
    title: "Dinh thuc 3x3",
    module: "Dai so tuyen tinh",
    difficulty: 7,
    key: "AIO02-28-41",
    mission: [
      "Tinh dinh thuc cua ma tran 3x3: [[2,1,3],[0,4,5],[1,0,6]].",
      "Doi co the nho AI khai trien theo hang/cot, nhung phai tu thay so lai vi AI rat de sai dau.",
      "Nop khoa dang AIO02-28-<ket qua>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 29,
    title: "Duong di ngan nhat Omega",
    module: "Toi uu",
    difficulty: 7,
    key: "AIO02-29-12",
    mission: [
      "Do thi co cac canh co trong so: A-B=7, A-C=3, C-B=2, B-D=4, C-D=9, C-E=8, D-E=1, D-F=5, E-F=2.",
      "Tim do dai duong di ngan nhat tu A den F.",
      "Hay yeu cau AI dung Dijkstra, sau do doi tu cong lai duong di tot nhat.",
      "Nop khoa dang AIO02-29-<do dai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 30,
    title: "Boss cuoi - Lap lich 3 khoi",
    module: "Toi uu",
    difficulty: 8,
    is_boss: true,
    key: "AIO02-30-156",
    mission: [
      "Co 45 doi thi. Truong co 6 phong may, moi phong chua 1 doi moi luot.",
      "Moi luot thi keo dai 16 phut. Giua hai luot lien tiep can 4 phut chuyen ca. Sau luot cuoi khong can chuyen ca.",
      "Can toi thieu bao nhieu phut de tat ca 45 doi thi xong?",
      "Nop khoa dang AIO02-30-<so phut>-<MA DOI>."
    ].join("\n")
  }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const seasonId = get("--season");
  const classesPath = get("--classes");
  const outDir = get("--out") ?? "tmp/math-ai-quest-02";

  if (!seasonId || !classesPath) {
    console.error("Usage: pnpm tsx scripts/generate-math-ai-season-02.ts --season <SEASON_ID> --classes <classes.txt> --out <output-dir>");
    process.exit(1);
  }

  return { seasonId, classesPath, outDir };
}

function parseTeams(path: string): TeamInput[] {
  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  return lines.map((line) => {
    const [rawId, rawName, rawPassword] = line.split(",").map((part) => part.trim());
    const teamId = rawId.toUpperCase();

    return {
      team_id: teamId,
      team_name: rawName || `Doi ${teamId}`,
      password: rawPassword || `pass${teamId}`
    };
  });
}

function csvEscape(value: string | number | boolean | null) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers: string[], rows: Array<Record<string, string | number | boolean | null>>) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
}

function main() {
  const { seasonId, classesPath, outDir } = parseArgs();
  const teams = parseTeams(classesPath);

  if (teams.length === 0) {
    throw new Error("Danh sach lop dang rong.");
  }

  mkdirSync(outDir, { recursive: true });

  const teamRows = teams.map((team) => ({
    season_id: seasonId,
    team_id: team.team_id,
    team_name: team.team_name,
    password: team.password
  }));

  const challengeRows = challenges.map((challenge) => ({
    season_id: seasonId,
    door: challenge.door,
    title: challenge.title,
    mission: challenge.mission,
    file_url: "",
    difficulty: challenge.difficulty,
    module: challenge.module,
    is_boss: Boolean(challenge.is_boss)
  }));

  const answerRows = teams.flatMap((team) =>
    challenges.map((challenge) => ({
      season_id: seasonId,
      team_id: team.team_id,
      door: challenge.door,
      key: `${challenge.key}-${team.team_id}`
    }))
  );

  const answerBook = challenges
    .map((challenge) => `${String(challenge.door).padStart(2, "0")}. ${challenge.title}: ${challenge.key}-<MA DOI>`)
    .join("\n");

  writeFileSync(
    join(outDir, "teams.csv"),
    toCsv(["season_id", "team_id", "team_name", "password"], teamRows)
  );
  writeFileSync(
    join(outDir, "challenges.csv"),
    toCsv(["season_id", "door", "title", "mission", "file_url", "difficulty", "module", "is_boss"], challengeRows)
  );
  writeFileSync(
    join(outDir, "answers.csv"),
    toCsv(["season_id", "team_id", "door", "key"], answerRows)
  );
  writeFileSync(join(outDir, "answer-book.txt"), `${answerBook}\n`);

  console.log(`Da tao bo CSV tai ${outDir}`);
  console.log(`So doi: ${teams.length}`);
  console.log(`So cua: ${challenges.length}`);
  console.log(`So khoa dap an: ${answerRows.length}`);
}

main();
