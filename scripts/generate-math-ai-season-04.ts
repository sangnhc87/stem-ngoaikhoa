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
    title: "Maker mo khoa",
    module: "Chang 1 - Khoi dong AI",
    difficulty: 2,
    key: "MAK04-01-1275",
    mission: [
      "Duoc dung AI thoai mai. Hay yeu cau AI dua ra 2 cach tinh, sau do doi tu kiem chung.",
      "Tinh tong 1 + 2 + ... + 50.",
      "Nop khoa dang MAK04-01-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 2,
    title: "Nhan nhanh co kiem chung",
    module: "Chang 1 - Khoi dong AI",
    difficulty: 2,
    key: "MAK04-02-2496",
    mission: [
      "Tinh 48 x 52 bang hang dang thuc hoac tach so.",
      "Doi phai hoi AI cach tinh nhanh va tu nhan lai de kiem chung.",
      "Nop khoa dang MAK04-02-<ket qua>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 3,
    title: "Chu ky modulo",
    module: "Chang 1 - Khoi dong AI",
    difficulty: 3,
    key: "MAK04-03-5",
    mission: [
      "Tim so du cua 5^2026 khi chia cho 11.",
      "Hay yeu cau AI lap chu ky modulo, roi doi tu kiem lai chu ky.",
      "Nop khoa dang MAK04-03-<so du>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 4,
    title: "Euclid trong 30 giay",
    module: "Chang 1 - Khoi dong AI",
    difficulty: 3,
    key: "MAK04-04-4",
    mission: [
      "Tim UCLN cua 2024 va 252.",
      "Nop khoa dang MAK04-04-<UCLN>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 5,
    title: "So uoc cua 840",
    module: "Chang 1 - Khoi dong AI",
    difficulty: 3,
    key: "MAK04-05-32",
    mission: [
      "So 840 co bao nhieu uoc duong?",
      "Doi nen yeu cau AI phan tich thua so nguyen to, roi tu dung cong thuc dem uoc.",
      "Nop khoa dang MAK04-05-<so uoc>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 6,
    title: "Chon nhom truyen thong",
    module: "Chang 2 - Lop hoc",
    difficulty: 3,
    key: "MAK04-06-1001",
    mission: [
      "Tu 14 hoc sinh, chon 4 ban lam nhom truyen thong. Khong phan vai.",
      "Co bao nhieu cach chon?",
      "Nop khoa dang MAK04-06-<so cach>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 7,
    title: "It nhat mot mat sap",
    module: "Chang 2 - Lop hoc",
    difficulty: 4,
    key: "MAK04-07-15-16",
    mission: [
      "Tung 4 dong xu can doi. Xac suat co it nhat mot mat sap la bao nhieu?",
      "Viet phan so toi gian a/b.",
      "Nop khoa dang MAK04-07-<a>-<b>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 8,
    title: "Median lop hoc",
    module: "Chang 2 - Lop hoc",
    difficulty: 3,
    key: "MAK04-08-16",
    mission: [
      "Du lieu so san pham hoan thanh cua 7 nhom: 12, 14, 14, 16, 19, 21, 30.",
      "Tinh median.",
      "Nop khoa dang MAK04-08-<median>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 9,
    title: "Ban do san pham",
    module: "Chang 2 - Lop hoc",
    difficulty: 5,
    key: "MAK04-09-43",
    mission: [
      "Da giac co dinh theo thu tu: (0,0), (5,0), (6,3), (2,5), (0,2).",
      "Tinh 2 lan dien tich da giac bang cong thuc day giay.",
      "Nop khoa dang MAK04-09-<2S>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 10,
    title: "San khau lon nhat",
    module: "Chang 2 - Lop hoc",
    difficulty: 4,
    key: "MAK04-10-400",
    mission: [
      "Mot hinh chu nhat co chu vi 80 m. Dien tich lon nhat la bao nhieu m2?",
      "Nop khoa dang MAK04-10-<dien tich>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 11,
    title: "Giai ma affine",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 5,
    key: "MAK04-11-11",
    mission: [
      "Ham ma hoa f(n)=11n+3 mod 26. Tim n trong 0..25 sao cho f(n)=20.",
      "Nop khoa dang MAK04-11-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 12,
    title: "Ma mau he 16",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 4,
    key: "MAK04-12-FFF",
    mission: [
      "Doi 4095 sang he thap luc phan. Viet chu in hoa, khong them 0x.",
      "Nop khoa dang MAK04-12-<hex>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 13,
    title: "Duong di poster",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 4,
    key: "MAK04-13-210",
    mission: [
      "Robot can di 6 buoc sang phai va 4 buoc len tren. Co bao nhieu duong di ngan nhat?",
      "Nop khoa dang MAK04-13-<so duong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 14,
    title: "Phan bien trung binh",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 3,
    key: "MAK04-14-75",
    mission: [
      "AI noi trung binh cua 60, 70, 80, 90 la 80. Hay kiem chung.",
      "Trung binh dung la bao nhieu?",
      "Nop khoa dang MAK04-14-<trung binh dung>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 15,
    title: "Lap lich phong may",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 5,
    key: "MAK04-15-94",
    mission: [
      "Co 32 doi, 6 phong may, moi phong 1 doi moi luot. Moi luot 14 phut, giua hai luot can 2 phut chuyen ca, sau luot cuoi khong can.",
      "Can toi thieu bao nhieu phut?",
      "Nop khoa dang MAK04-15-<so phut>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 16,
    title: "He so an trong chia nhom",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 4,
    key: "MAK04-16-1106",
    mission: [
      "Giai he: 4x + y = 50 va x + y = 17.",
      "Ghep dap an theo dang xy. Vi du x=5, y=12 thi ghi 512.",
      "Nop khoa dang MAK04-16-<xy>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 17,
    title: "Dinh ly Euler mini",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 5,
    key: "MAK04-17-4",
    mission: [
      "Do thi co bac cac dinh: 2, 2, 3, 3, 4, 6, 1, 1.",
      "Co bao nhieu dinh bac le?",
      "Nop khoa dang MAK04-17-<so dinh bac le>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 18,
    title: "Ba dieu kien dong du",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 6,
    key: "MAK04-18-11",
    mission: [
      "Tim so nguyen duong n nho nhat sao cho n chia 6 du 5, chia 7 du 4, chia 8 du 3.",
      "Nop khoa dang MAK04-18-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 19,
    title: "RSA maker mini",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 6,
    key: "MAK04-19-29",
    mission: [
      "RSA mini: p=7, q=13, phi(n)=72, e=5.",
      "Tim d nho nhat duong sao cho e*d chia phi(n) du 1.",
      "Nop khoa dang MAK04-19-<d>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 20,
    title: "Du lieu ngoai lai",
    module: "Chang 3 - STEM mo hinh hoa",
    difficulty: 5,
    key: "MAK04-20-35",
    mission: [
      "Du lieu: 30, 32, 34, 36, 38, 40, 200. Loai ngoai lai 200 roi tinh trung binh phan con lai.",
      "Nop khoa dang MAK04-20-<trung binh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 21,
    title: "AI sai trung binh lop ghep",
    module: "Chang 4 - AI phan bien",
    difficulty: 5,
    key: "MAK04-21-76",
    mission: [
      "Lop A co 12 ban, diem trung binh la 7. Lop B co 18 ban, diem trung binh la 8.",
      "AI noi diem trung binh chung la (7+8)/2 = 7.5. Hay bat loi va tinh diem trung binh chung dung.",
      "Viet 7.6 thanh 76 trong khoa. Nop khoa dang MAK04-21-<so>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 22,
    title: "AI sai cay khung",
    module: "Chang 4 - AI phan bien",
    difficulty: 7,
    key: "MAK04-22-11",
    mission: [
      "Do thi co canh: A-B=2, A-C=6, B-C=3, B-D=5, C-D=1, C-E=4, D-E=2, D-F=7, E-F=3.",
      "AI noi cay khung nho nhat co tong 13. Hay tim tong dung.",
      "Nop khoa dang MAK04-22-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 23,
    title: "AI sai duong ngan nhat",
    module: "Chang 4 - AI phan bien",
    difficulty: 7,
    key: "MAK04-23-12",
    mission: [
      "Do thi co canh: S-A=4, S-B=2, A-B=1, A-C=3, B-D=7, C-T=6, D-C=1, D-T=3.",
      "AI noi duong ngan nhat S den T dai 13. Hay bat loi va tim do dai dung.",
      "Nop khoa dang MAK04-23-<do dai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 24,
    title: "AI sai van toc trung binh",
    module: "Chang 4 - AI phan bien",
    difficulty: 6,
    key: "MAK04-24-48",
    mission: [
      "Mot ban di tu nha den truong dai 12 km voi van toc 40 km/h, luc ve cung quang duong do voi van toc 60 km/h.",
      "AI noi van toc trung binh ca di lan ve la (40+60)/2 = 50 km/h. Hay bat loi va tinh van toc trung binh dung.",
      "Nop khoa dang MAK04-24-<van toc>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 25,
    title: "Dem ket luan sai cua AI",
    module: "Chang 4 - AI phan bien",
    difficulty: 5,
    key: "MAK04-25-1",
    mission: [
      "AI dua ra 4 ket luan: 1) 15! co 3 chu so 0 tan cung. 2) C(8,2)=28. 3) 2^12=4096. 4) UCLN(54,24)=12.",
      "Co bao nhieu ket luan sai?",
      "Nop khoa dang MAK04-25-<so ket luan sai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 26,
    title: "San pham 1 - Bo prompt hoc Toan",
    module: "Chang 5 - San pham mini",
    difficulty: 6,
    key: "MAK04-26-PROMPT",
    mission: [
      "Tao mot bo 5 prompt giup hoc sinh lop minh hoc Toan tot hon. Moi prompt phai co muc dich va vi du su dung.",
      "Hay nop san pham vao form ben duoi, sau do nhap khoa MAK04-26-PROMPT-<MA DOI> de mo cua tiep.",
      "Nop khoa dang MAK04-26-PROMPT-<MA DOI>."
    ].join("\n")
  },
  {
    door: 27,
    title: "San pham 2 - Ke hoach on tap 7 ngay",
    module: "Chang 5 - San pham mini",
    difficulty: 6,
    key: "MAK04-27-PLAN",
    mission: [
      "Dung AI tao ke hoach on tap Toan 7 ngay cho lop minh, co muc tieu moi ngay va cach tu kiem tra.",
      "Nop san pham vao form ben duoi, sau do nhap khoa MAK04-27-PLAN-<MA DOI>.",
      "Nop khoa dang MAK04-27-PLAN-<MA DOI>."
    ].join("\n")
  },
  {
    door: 28,
    title: "San pham 3 - Infographic chong AI sai",
    module: "Chang 5 - San pham mini",
    difficulty: 7,
    is_boss: true,
    key: "MAK04-28-CHECK",
    mission: [
      "Tao infographic hoac poster 1 trang: 5 buoc kiem chung loi giai Toan do AI tao ra.",
      "Nop link/san pham vao form ben duoi, sau do nhap khoa MAK04-28-CHECK-<MA DOI>.",
      "Nop khoa dang MAK04-28-CHECK-<MA DOI>."
    ].join("\n")
  },
  {
    door: 29,
    title: "San pham 4 - Mini game do Toan",
    module: "Chang 5 - San pham mini",
    difficulty: 7,
    is_boss: true,
    key: "MAK04-29-GAME",
    mission: [
      "Dung AI tao y tuong mini game do Toan 5 cau cho hoc sinh cung khoi. San pham can co luat choi, 5 cau hoi va dap an.",
      "Nop san pham vao form ben duoi, sau do nhap khoa MAK04-29-GAME-<MA DOI>.",
      "Nop khoa dang MAK04-29-GAME-<MA DOI>."
    ].join("\n")
  },
  {
    door: 30,
    title: "Final Product - Thu vien hoc tap cua lop",
    module: "Chang 5 - San pham mini",
    difficulty: 8,
    is_boss: true,
    key: "MAK04-30-GALLERY",
    mission: [
      "Tong hop thanh mot san pham cuoi: 'Thu vien hoc Toan bang AI cua lop'. San pham gom prompt hay, meo kiem chung AI, mot mini game hoac ke hoach on tap.",
      "Nop san pham vao form ben duoi de luu vao Gallery, sau do nhap khoa MAK04-30-GALLERY-<MA DOI>.",
      "Nop khoa dang MAK04-30-GALLERY-<MA DOI>."
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
  const outDir = get("--out") ?? "tmp/math-ai-quest-04";

  if (!seasonId || !classesPath) {
    console.error("Usage: pnpm tsx scripts/generate-math-ai-season-04.ts --season <SEASON_ID> --classes <classes.txt> --out <output-dir>");
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
