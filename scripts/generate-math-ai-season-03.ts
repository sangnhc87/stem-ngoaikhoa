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
    title: "Nexus mo khoa",
    module: "Khoi dong",
    difficulty: 2,
    key: "NEX03-01-1225",
    mission: [
      "Duoc dung AI thoai mai, nhung phai yeu cau AI dua ra cach tinh khong cong tay.",
      "Tinh tong 1 + 3 + 5 + ... + 69.",
      "Nop khoa dang NEX03-01-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 2,
    title: "Kiem chung can bac hai",
    module: "Uoc luong",
    difficulty: 2,
    key: "NEX03-02-44",
    mission: [
      "Khong dung may tinh can bac hai truc tiep, hay tim so nguyen gan nhat voi sqrt(2025) - 1.",
      "Doi nen hoi AI cach uoc luong va tu kiem tra lai bang binh phuong.",
      "Nop khoa dang NEX03-02-<ket qua>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 3,
    title: "Modulo Fibonacci",
    module: "Modulo",
    difficulty: 4,
    key: "NEX03-03-0",
    mission: [
      "Voi F1=1, F2=1. Tim so du cua F12 khi chia cho 8.",
      "Hay yeu cau AI lap bang Fibonacci modulo 8, roi doi tu kiem lai tung dong.",
      "Nop khoa dang NEX03-03-<so du>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 4,
    title: "So uoc la so le",
    module: "So hoc",
    difficulty: 3,
    key: "NEX03-04-15",
    mission: [
      "Trong cac so tu 1 den 225, co bao nhieu so co so uoc duong la so le?",
      "Goi y: chi so chinh phuong moi co so uoc le.",
      "Nop khoa dang NEX03-04-<so luong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 5,
    title: "Mat khau AI-AI-MATH",
    module: "Hoan vi",
    difficulty: 4,
    key: "NEX03-05-3360",
    mission: [
      "Co bao nhieu cach sap xep cac ky tu trong chuoi AIAIMATH?",
      "Luu y A lap 3 lan, I lap 2 lan.",
      "Nop khoa dang NEX03-05-<so cach>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 6,
    title: "Xac suat khong trung sinh nhat",
    module: "Xac suat",
    difficulty: 5,
    key: "NEX03-06-20-21",
    mission: [
      "Mot nhom co 2 ban, moi ban sinh ngau nhien vao mot trong 21 ngay truc nhat cua thang.",
      "Xac suat hai ban khong cung ngay truc la bao nhieu? Viet phan so toi gian a/b.",
      "Nop khoa dang NEX03-06-<a>-<b>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 7,
    title: "Bang gia tri sai phan",
    module: "Day so",
    difficulty: 4,
    key: "NEX03-07-191",
    mission: [
      "Day so: 5, 11, 21, 35, 53, ... co sai phan bac hai khong doi.",
      "Hay tim so hang thu 10 bang bang sai phan.",
      "Nop khoa dang NEX03-07-<so hang thu 10>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 8,
    title: "Doc bieu do khong co bieu do",
    module: "Du lieu",
    difficulty: 3,
    key: "NEX03-08-14",
    mission: [
      "So luot giai dung cua 7 doi lan luot la: 8, 12, 12, 14, 15, 16, 21.",
      "Tinh median cua bo du lieu.",
      "Nop khoa dang NEX03-08-<median>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 9,
    title: "Boss 1 - Toa do kho bau",
    module: "Hinh hoc toa do",
    difficulty: 6,
    is_boss: true,
    key: "NEX03-09-84",
    mission: [
      "Da giac co dinh theo thu tu: (0,0), (8,1), (9,5), (5,9), (1,7).",
      "Tinh 2 lan dien tich da giac bang cong thuc day giay.",
      "Nop khoa dang NEX03-09-<2S>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 10,
    title: "Toi uu san khau",
    module: "Toi uu",
    difficulty: 5,
    key: "NEX03-10-144",
    mission: [
      "Mot hinh chu nhat co chu vi 48 m. Dien tich lon nhat la bao nhieu m2?",
      "Doi hay hoi AI vi sao hai canh bang nhau la toi uu, roi tu kiem lai.",
      "Nop khoa dang NEX03-10-<dien tich>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 11,
    title: "Affine nguoc",
    module: "Mat ma hoc",
    difficulty: 5,
    key: "NEX03-11-17",
    mission: [
      "Ham ma hoa f(n)=9n+4 mod 26. Tim n trong 0..25 sao cho f(n)=1.",
      "Goi y: can nghich dao modulo cua 9.",
      "Nop khoa dang NEX03-11-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 12,
    title: "Checksum he 16",
    module: "Tin hoc Toan",
    difficulty: 4,
    key: "NEX03-12-8FF",
    mission: [
      "Doi so 2303 tu he thap phan sang he thap luc phan.",
      "Viet chu in hoa, khong them 0x.",
      "Nop khoa dang NEX03-12-<hex>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 13,
    title: "Duong di va rang buoc",
    module: "To hop",
    difficulty: 5,
    key: "NEX03-13-35",
    mission: [
      "Robot can di 4 buoc sang phai va 3 buoc len tren. Tong cong co bao nhieu duong di ngan nhat?",
      "Nop khoa dang NEX03-13-<so duong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 14,
    title: "Phan bien AI ve trung binh",
    module: "Kiem chung",
    difficulty: 5,
    key: "NEX03-14-82",
    mission: [
      "AI noi trung binh cua 70, 75, 80, 85, 100 la 90. Hay kiem chung.",
      "Trung binh dung la bao nhieu?",
      "Nop khoa dang NEX03-14-<trung binh dung>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 15,
    title: "Lap lich mini",
    module: "Toi uu",
    difficulty: 5,
    key: "NEX03-15-72",
    mission: [
      "Co 18 doi, 4 phong may, moi phong 1 doi moi luot. Moi luot 12 phut, giua hai luot can 3 phut chuyen ca, sau luot cuoi khong can.",
      "Can toi thieu bao nhieu phut?",
      "Nop khoa dang NEX03-15-<so phut>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 16,
    title: "He phuong trinh tham so an",
    module: "Dai so",
    difficulty: 4,
    key: "NEX03-16-708",
    mission: [
      "Giai he: 2x + 5y = 54 va x + y = 15.",
      "Ghep dap an theo dang xy. Vi du x=3,y=12 thi ghi 312.",
      "Nop khoa dang NEX03-16-<xy>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 17,
    title: "Do thi Euler mini",
    module: "Do thi",
    difficulty: 6,
    key: "NEX03-17-2",
    mission: [
      "Do thi co bac cac dinh lan luot: 2, 4, 4, 3, 3, 2.",
      "Co bao nhieu dinh bac le?",
      "Nop khoa dang NEX03-17-<so dinh bac le>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 18,
    title: "Dong du ket hop",
    module: "Dong du",
    difficulty: 6,
    key: "NEX03-18-23",
    mission: [
      "Tim so nguyen duong n nho nhat sao cho n chia 5 du 3, chia 7 du 2, chia 9 du 5.",
      "Nop khoa dang NEX03-18-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 19,
    title: "Boss 2 - RSA tiny",
    module: "Mat ma hoc",
    difficulty: 7,
    is_boss: true,
    key: "NEX03-19-27",
    mission: [
      "RSA tiny: p=5, q=11, n=55, phi(n)=40, e=3. Tim d nho nhat duong sao cho e*d chia phi(n) du 1.",
      "Nop khoa dang NEX03-19-<d>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 20,
    title: "Bay ngoai lai cap hai",
    module: "Du lieu",
    difficulty: 6,
    key: "NEX03-20-28",
    mission: [
      "Du lieu: 22, 24, 26, 28, 30, 32, 34, 100. Loai ngoai lai 100 roi tinh trung binh cua phan con lai.",
      "Nop khoa dang NEX03-20-<trung binh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 21,
    title: "Dinh thuc va dau",
    module: "Dai so tuyen tinh",
    difficulty: 6,
    key: "NEX03-21-NEG3",
    mission: [
      "Tinh dinh thuc ma tran [[1,4],[2,5]]. Neu am, viet NEG thay dau tru.",
      "Nop khoa dang NEX03-21-<ket qua>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 22,
    title: "Cay khung toi thieu",
    module: "Toi uu do thi",
    difficulty: 7,
    key: "NEX03-22-6",
    mission: [
      "Do thi co canh: A-B=1, A-C=4, B-C=2, B-D=5, C-D=1, C-E=3, D-E=2.",
      "Tim tong trong so cay khung nho nhat.",
      "Nop khoa dang NEX03-22-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 23,
    title: "Duong ngan nhat co lua chon",
    module: "Toi uu do thi",
    difficulty: 7,
    key: "NEX03-23-9",
    mission: [
      "Do thi co canh: S-A=2, S-B=5, A-B=1, A-C=4, B-C=2, B-T=9, C-T=4.",
      "Tim do dai duong di ngan nhat tu S den T.",
      "Nop khoa dang NEX03-23-<do dai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 24,
    title: "Xac suat bayes nhe",
    module: "Xac suat",
    difficulty: 7,
    key: "NEX03-24-2-3",
    mission: [
      "Trong hop co 2 bi do va 1 bi xanh. Lay 1 bi, khong tra lai, roi lay tiep 1 bi. Biet lan 2 la bi do. Xac suat lan 1 cung la bi do la bao nhieu?",
      "Viet phan so toi gian a/b.",
      "Nop khoa dang NEX03-24-<a>-<b>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 25,
    title: "Prompt phan bien",
    module: "AI Literacy",
    difficulty: 6,
    key: "NEX03-25-2",
    mission: [
      "Mot AI dua ra 3 ket luan ve bai toan. Doi phai kiem tra va dem so ket luan sai:",
      "1) 2^10=1024. 2) 12! co 3 chu so 0 tan cung. 3) C(6,2)=12.",
      "Co bao nhieu ket luan sai?",
      "Nop khoa dang NEX03-25-<so ket luan sai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 26,
    title: "Hinh tron noi tiep",
    module: "Hinh hoc",
    difficulty: 5,
    key: "NEX03-26-4",
    mission: [
      "Tam giac vuong co hai canh goc vuong 12 va 16, canh huyen 20. Tinh ban kinh duong tron noi tiep.",
      "Nop khoa dang NEX03-26-<ban kinh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 27,
    title: "Tong chu so cua luy thua",
    module: "So hoc",
    difficulty: 5,
    key: "NEX03-27-26",
    mission: [
      "Tinh tong cac chu so cua 2^15.",
      "Doi co the dung AI de tinh 2^15, nhung phai tu cong tong chu so.",
      "Nop khoa dang NEX03-27-<tong chu so>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 28,
    title: "Boss 3 - Tich hop du lieu va toi uu",
    module: "Mo hinh hoa",
    difficulty: 8,
    is_boss: true,
    key: "NEX03-28-14",
    mission: [
      "Mot truong co 96 hoc sinh tham gia, moi nhom toi da 5 hoc sinh. Can it nhat bao nhieu nhom?",
      "Neu moi nhom can 2 phut de check-in, 3 ban giam khao check-in song song, can it nhat bao nhieu phut de check-in tat ca nhom?",
      "Nop khoa bang so phut: NEX03-28-<so phut>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 29,
    title: "Boss 4 - Ke hoach cong bang",
    module: "Toi uu",
    difficulty: 8,
    key: "NEX03-29-30",
    mission: [
      "Co 48 lop, chia vao 5 cum ho tro. Moi cum toi da 10 lop. Can it nhat bao nhieu cum? Sau do, neu moi cum can 6 phut huong dan va cac cum huong dan noi tiep, tong thoi gian huong dan la bao nhieu phut?",
      "Nop khoa dang NEX03-29-<so phut>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 30,
    title: "Final Boss - Giai dau 120 phut",
    module: "Lap lich",
    difficulty: 9,
    is_boss: true,
    key: "NEX03-30-116",
    mission: [
      "Co 48 doi, 8 phong may, moi phong 1 doi moi luot. Moi luot thi 16 phut, giua hai luot can 4 phut chuyen ca, sau luot cuoi khong can.",
      "Can toi thieu bao nhieu phut de tat ca doi thi xong?",
      "Nop khoa dang NEX03-30-<so phut>-<MA DOI>."
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
  const outDir = get("--out") ?? "tmp/math-ai-quest-03";

  if (!seasonId || !classesPath) {
    console.error("Usage: pnpm tsx scripts/generate-math-ai-season-03.ts --season <SEASON_ID> --classes <classes.txt> --out <output-dir>");
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

  writeFileSync(join(outDir, "teams.csv"), toCsv(["season_id", "team_id", "team_name", "password"], teamRows));
  writeFileSync(
    join(outDir, "challenges.csv"),
    toCsv(["season_id", "door", "title", "mission", "file_url", "difficulty", "module", "is_boss"], challengeRows)
  );
  writeFileSync(join(outDir, "answers.csv"), toCsv(["season_id", "team_id", "door", "key"], answerRows));
  writeFileSync(join(outDir, "answer-book.txt"), `${answerBook}\n`);

  console.log(`Da tao bo CSV tai ${outDir}`);
  console.log(`So doi: ${teams.length}`);
  console.log(`So cua: ${challenges.length}`);
  console.log(`So khoa dap an: ${answerRows.length}`);
}

main();
