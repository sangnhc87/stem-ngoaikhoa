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
    title: "Gauss mo khoa",
    module: "Khoi dong",
    difficulty: 1,
    key: "AIQ01-5050",
    mission: [
      "Duoc dung AI thoai mai.",
      "Hay tinh tong 1 + 2 + 3 + ... + 100. Doi phai yeu cau AI giai thich it nhat 2 cach va tu kiem tra lai.",
      "Nop khoa dang AIQ01-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 2,
    title: "Bat loi phep nhan cua AI",
    module: "Kiem chung",
    difficulty: 1,
    key: "AIQ02-1591",
    mission: [
      "Mot AI noi 37 x 43 = 1581. Doi hay kiem chung bang cach tach so hoac dung phep nhan doc.",
      "Ket qua dung cua 37 x 43 la bao nhieu?",
      "Nop khoa dang AIQ02-<ket qua dung>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 3,
    title: "Chu ky phan du",
    module: "So hoc",
    difficulty: 2,
    key: "AIQ03-2",
    mission: [
      "Tim so du cua 2^2026 khi chia cho 7.",
      "Goi y: yeu cau AI tim chu ky cua 2^n modulo 7, roi tu viet lai 3 gia tri dau de kiem chung.",
      "Nop khoa dang AIQ03-<so du>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 4,
    title: "Hai so lien tiep",
    module: "So hoc",
    difficulty: 2,
    key: "AIQ04-4106702",
    mission: [
      "Tinh BCNN cua 2026 va 2027.",
      "Doi can giai thich vi sao hai so lien tiep co UCLN bang 1.",
      "Nop khoa dang AIQ04-<BCNN>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 5,
    title: "Fibonacci khong cong tay",
    module: "Day so",
    difficulty: 2,
    key: "AIQ05-986",
    mission: [
      "Voi F1 = 1, F2 = 1, F(n+2) = F(n+1) + F(n).",
      "Tinh F1 + F2 + ... + F14. Hay hoi AI cong thuc tong Fibonacci, sau do tu kiem tra bang cach liet ke day.",
      "Nop khoa dang AIQ05-<tong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 6,
    title: "Tu khoa locker",
    module: "Lap luan",
    difficulty: 3,
    key: "AIQ06-30",
    mission: [
      "Co 900 tu khoa dong. Luot 1 doi trang thai moi tu. Luot 2 doi trang thai cac tu boi cua 2. Tiep tuc den luot 900.",
      "Sau 900 luot, co bao nhieu tu dang mo?",
      "Goi y: chi cac so co so uoc le moi con mo.",
      "Nop khoa dang AIQ06-<so tu mo>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 7,
    title: "Loc so nguyen to",
    module: "So hoc",
    difficulty: 2,
    key: "AIQ07-8",
    mission: [
      "Dem co bao nhieu so nguyen to tu 80 den 120, tinh ca 80 va 120 neu phu hop.",
      "Doi nen yeu cau AI lap bang ung vien, nhung phai tu kiem tra chia het cho 2, 3, 5, 7, 11.",
      "Nop khoa dang AIQ07-<so luong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 8,
    title: "Duong di robot",
    module: "To hop",
    difficulty: 3,
    key: "AIQ08-56",
    mission: [
      "Robot di tu A den B tren luoi o vuong, bat buoc di dung 5 buoc sang phai va 3 buoc len tren, khong di lui.",
      "Co bao nhieu duong di ngan nhat?",
      "Nop khoa dang AIQ08-<so duong>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 9,
    title: "Xac suat hai xuc xac",
    module: "Xac suat",
    difficulty: 3,
    key: "AIQ09-5-36",
    mission: [
      "Gieo 2 xuc xac can doi. Xac suat tong diem bang 8 la bao nhieu?",
      "Viet dap an duoi dang phan so toi gian a/b.",
      "Nop khoa dang AIQ09-<a>-<b>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 10,
    title: "Boss 1 - Ban do san truong",
    module: "Hinh hoc",
    difficulty: 5,
    is_boss: true,
    key: "AIQ10-29",
    mission: [
      "Mot khu dat tren mat phang toa do co cac dinh theo thu tu: (0,0), (6,0), (6,4), (2,6), (0,3).",
      "Tinh dien tich khu dat. Duoc dung AI, nhung phai yeu cau AI dung cong thuc day giay va tu thay so lai.",
      "Nop khoa dang AIQ10-<dien tich>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 11,
    title: "He phuong trinh cua doi truong",
    module: "Dai so",
    difficulty: 2,
    key: "AIQ11-906",
    mission: [
      "Giai he: 3x + 2y = 39 va x - y = 3.",
      "Sau khi tim x, y, ghep khoa bang xy theo dang x truoc y sau. Vi du x=4, y=5 thi ghi 405.",
      "Nop khoa dang AIQ11-<xy>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 12,
    title: "Hang rao lon nhat",
    module: "Toi uu",
    difficulty: 4,
    key: "AIQ12-225",
    mission: [
      "Co 60 m hang rao de quay mot hinh chu nhat. Dien tich lon nhat co the dat duoc la bao nhieu m2?",
      "Doi hay hoi AI vi sao hinh vuong cho dien tich lon nhat khi chu vi co dinh.",
      "Nop khoa dang AIQ12-<dien tich lon nhat>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 13,
    title: "Ma hoa modulo 26",
    module: "Modulo",
    difficulty: 4,
    key: "AIQ13-23",
    mission: [
      "Xet ham ma hoa f(n) = 7n + 11 (mod 26).",
      "Tinh f(2026) la so du nao trong tap 0 den 25?",
      "Nop khoa dang AIQ13-<so du>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 14,
    title: "Doi he dem",
    module: "Tin hoc Toan",
    difficulty: 3,
    key: "AIQ14-7EA",
    mission: [
      "Doi so 2026 tu he thap phan sang he thap luc phan.",
      "Viet bang chu in hoa, khong them tien to 0x.",
      "Nop khoa dang AIQ14-<ket qua hex>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 15,
    title: "Tong phan so lap lai",
    module: "Dai so",
    difficulty: 3,
    key: "AIQ15-1023-1024",
    mission: [
      "Tinh S = 1/2 + 1/4 + 1/8 + ... + 1/1024.",
      "Viet ket qua duoi dang phan so toi gian a/b.",
      "Nop khoa dang AIQ15-<a>-<b>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 16,
    title: "Thap Ha Noi",
    module: "De quy",
    difficulty: 3,
    key: "AIQ16-255",
    mission: [
      "Thap Ha Noi co 8 dia. Moi lan chi duoc chuyen 1 dia va khong dat dia lon len dia nho.",
      "So buoc it nhat la bao nhieu?",
      "Nop khoa dang AIQ16-<so buoc>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 17,
    title: "Mang ket noi lop hoc",
    module: "Do thi",
    difficulty: 3,
    key: "AIQ17-21",
    mission: [
      "Co 7 nhom hoc tap. Neu moi cap nhom deu can mot kenh trao doi rieng, can bao nhieu kenh?",
      "Hay lien he voi so canh cua do thi day du K7.",
      "Nop khoa dang AIQ17-<so kenh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 18,
    title: "Bat tay toan truong",
    module: "To hop",
    difficulty: 3,
    key: "AIQ18-9",
    mission: [
      "Trong mot nhom, moi cap hoc sinh bat tay dung 1 lan. Tong cong co 36 cai bat tay.",
      "Nhom do co bao nhieu hoc sinh?",
      "Nop khoa dang AIQ18-<so hoc sinh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 19,
    title: "So bi an trong bang diem",
    module: "Thong ke",
    difficulty: 2,
    key: "AIQ19-19",
    mission: [
      "Co 12 diem kiem tra co trung binh cong la 18. Tong 11 diem da biet la 197.",
      "Diem con thieu la bao nhieu?",
      "Nop khoa dang AIQ19-<diem thieu>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 20,
    title: "Boss 2 - Doc du lieu nhanh",
    module: "Thong ke",
    difficulty: 5,
    is_boss: true,
    key: "AIQ20-884",
    mission: [
      "Day du lieu: 6, 7, 7, 8, 8, 8, 9, 10.",
      "Tim mode, median va range. Ghep thanh 3 so lien tiep theo thu tu mode-median-range.",
      "Nop khoa dang AIQ20-<mode><median><range>-<MA DOI>. Vi du 1,2,3 thi ghi AIQ20-123-<MA DOI>."
    ].join("\n")
  },
  {
    door: 21,
    title: "So gan dung tat ca",
    module: "Dong du",
    difficulty: 5,
    key: "AIQ21-2521",
    mission: [
      "Tim so nguyen duong n nho nhat sao cho khi chia n cho moi so tu 2 den 10 deu du 1.",
      "Goi y: n - 1 chia het cho 2,3,4,5,6,7,8,9,10.",
      "Nop khoa dang AIQ21-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 22,
    title: "Ba manh ghep dong du",
    module: "Dong du",
    difficulty: 5,
    key: "AIQ22-53",
    mission: [
      "Tim so nguyen duong n nho nhat thoa man: n chia 3 du 2, chia 5 du 3, chia 7 du 4.",
      "Duoc nho AI lap bang hoac dung dinh ly thang du Trung Hoa, nhung phai kiem lai 3 phep chia.",
      "Nop khoa dang AIQ22-<n>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 23,
    title: "Tam giac 9-12-15",
    module: "Hinh hoc",
    difficulty: 4,
    key: "AIQ23-3",
    mission: [
      "Mot tam giac vuong co hai canh goc vuong 9 va 12, canh huyen 15.",
      "Tinh ban kinh duong tron noi tiep tam giac.",
      "Nop khoa dang AIQ23-<ban kinh>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 24,
    title: "Vanh khuyen",
    module: "Hinh hoc",
    difficulty: 4,
    key: "AIQ24-144",
    mission: [
      "Mot vanh khuyen co ban kinh ngoai R = 13 va ban kinh trong r = 5.",
      "Dien tich vanh khuyen bang k*pi. Tim k.",
      "Nop khoa dang AIQ24-<k>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 25,
    title: "Phan bien loi giai AI",
    module: "Kiem chung",
    difficulty: 4,
    key: "AIQ25-5",
    mission: [
      "Mot AI giai bai: Neu 5 may in in 5 tap tai lieu trong 5 phut, thi 100 may in 100 tap trong 100 phut.",
      "AI sai. Doi hay sua lai: 100 may in 100 tap tai lieu mat bao nhieu phut?",
      "Nop khoa dang AIQ25-<so phut>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 26,
    title: "Luy thua gon",
    module: "Dai so",
    difficulty: 2,
    key: "AIQ26-5",
    mission: [
      "Giai 3^x = 243.",
      "Nop khoa dang AIQ26-<x>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 27,
    title: "Day so bac hai",
    module: "Day so",
    difficulty: 3,
    key: "AIQ27-861",
    mission: [
      "Cho a_n = 2n^2 + 3n + 1.",
      "Tinh a_20.",
      "Nop khoa dang AIQ27-<a20>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 28,
    title: "Dinh thuc mini",
    module: "Dai so",
    difficulty: 4,
    key: "AIQ28-NEG2",
    mission: [
      "Tinh dinh thuc cua ma tran [[3,5],[7,11]].",
      "Neu ket qua am, viet NEG thay cho dau tru. Vi du -9 viet NEG9.",
      "Nop khoa dang AIQ28-<ket qua>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 29,
    title: "Duong di ngan nhat",
    module: "Toi uu",
    difficulty: 6,
    key: "AIQ29-13",
    mission: [
      "Do thi co cac canh co trong so: A-B=4, A-C=2, C-B=1, B-D=5, C-D=8, C-E=10, D-E=2, D-F=6, E-F=3.",
      "Tim do dai duong di ngan nhat tu A den F.",
      "Hay yeu cau AI dung Dijkstra, sau do doi tu cong lai duong di tot nhat.",
      "Nop khoa dang AIQ29-<do dai>-<MA DOI>."
    ].join("\n")
  },
  {
    door: 30,
    title: "Boss cuoi - Lap lich toan truong",
    module: "Toi uu",
    difficulty: 7,
    is_boss: true,
    key: "AIQ30-118",
    mission: [
      "Co 30 lop thi, moi lop 1 doi. Truong co 5 phong may, moi phong chua 1 doi moi luot.",
      "Moi luot thi keo dai 18 phut. Giua hai luot lien tiep can 2 phut chuyen ca. Sau luot cuoi khong can chuyen ca.",
      "Can toi thieu bao nhieu phut de tat ca 30 doi thi xong?",
      "Nop khoa dang AIQ30-<so phut>-<MA DOI>."
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
  const outDir = get("--out") ?? "tmp/math-ai-quest-01";

  if (!seasonId || !classesPath) {
    console.error("Usage: pnpm tsx scripts/generate-math-ai-season.ts --season <SEASON_ID> --classes <classes.txt> --out <output-dir>");
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
