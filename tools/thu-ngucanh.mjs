/* Thử bộ hiểu ngữ cảnh bằng một câu chuyện thật, không cần trình duyệt.
 * Chạy:  node tools/thu-ngucanh.mjs
 */
import fs from "fs";

const hop = {};
new Function("window", fs.readFileSync("src/ngucanh.js", "utf8"))(hop);

const CHUYEN = [
  "Hồi đó má còn nhỏ lắm, nhà mình ở xóm Rạch Kiến",
  "Má hay theo bà Tư ra chợ Tầm Vu bán rau, đi từ lúc trời chưa sáng",
  "Bà Tư thương má lắm, lúc nào cũng dành cho củ khoai",
  "Tới năm sáu mươi tám thì chạy giặc, cả nhà bỏ hết mà đi",
  "Ba con hồi đó đi bộ đội, mấy năm liền không có tin",
  "Đám cưới má với ba con làm ở nhà, nghèo mà vui",
  "Sau này mình dọn lên Sài Gòn, má đi bán ở chợ Bà Chiểu"
];

const N = new hop.HieuNguCanh();
let soHoiDuoc = 0;
const daHoi = [];

console.log("=== Thu bo hieu ngu canh ===\n");
CHUYEN.forEach((cau, i) => {
  N.nghe(cau);
  const m = N.chonMoc();
  console.log(`[${i + 1}] ${cau}`);
  if (m) {
    console.log(`     -> hoi ve ${m.loai}: "${m.ten}"`);
    daHoi.push(m.loai + ":" + m.ten);
    N.danhDauDaHoi(m);
    soHoiDuoc++;
  } else {
    console.log("     -> (chua co gi dang hoi)");
  }
});

const t = N.tomTat();
console.log("\n=== Tat ca moc nhat duoc ===");
for (const k in t) if (t[k].length) console.log(`  ${k}: ${t[k].join(" | ")}`);

/* Những thứ NHẤT ĐỊNH phải nhặt đúng, và những thứ tuyệt đối không được có */
const phaiCo = ["bà Tư", "chợ Tầm Vu", "xóm Rạch Kiến", "chợ Bà Chiểu"];
const khongDuocCo = ["kỳ thi đó", "bò", "chưa sáng", "cho củ khoai", "bà Tư thương",
                     "Bà Chiểu", "má", "lúc trời", "năm liền", "Rạch Kiến"];
const tatCa = Object.values(t).flat();

console.log("\n=== Ket qua ===");
let hong = 0;
phaiCo.forEach(x => {
  const co = tatCa.some(y => y.toLowerCase() === x.toLowerCase());
  if (!co) hong++;
  console.log(`  ${co ? "OK " : "THIEU"} phai nhat duoc: ${x}`);
});
khongDuocCo.forEach(x => {
  const co = tatCa.some(y => y.toLowerCase() === x.toLowerCase());
  if (co) hong++;
  console.log(`  ${co ? "SAI" : "OK "} khong duoc co: ${x}`);
});
console.log(`  So lan hoi duoc theo ngu canh: ${soHoiDuoc}/${CHUYEN.length}`);
console.log(hong ? `\n${hong} cho sai` : "\nTat ca dung");
process.exit(hong ? 1 : 0);
