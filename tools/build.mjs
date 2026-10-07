/* Dựng bản web từ mã nguồn, sinh biểu tượng, rồi tự kiểm tra.
 *
 *   src/index.html + src/app.js  →  www/
 *
 * Chạy:  node tools/build.mjs
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";
import { fileURLToPath } from "url";

const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(goc, "src");
const www = path.join(goc, "www");
fs.mkdirSync(www, { recursive: true });

/* ---------- 1. chép mã nguồn, đóng cùng một mã bản dựng ----------
   Trang và mã nguồn phải nhận ra nhau. Máy người dùng giữ lẫn bản cũ bản
   mới thì giao diện hỏng ngầm, nên mỗi bản dựng mang một mã riêng; lệch
   mã thì ứng dụng tự dọn bộ đệm và tải lại. */
const nguon = {};
for (const f of ["index.html", "app.js", "sw.js"]) nguon[f] = fs.readFileSync(path.join(src, f), "utf8");
const BAN = crypto.createHash("sha1")
  .update(nguon["index.html"] + nguon["app.js"] + nguon["sw.js"])
  .digest("hex").slice(0, 8);
for (const f of ["index.html", "app.js", "sw.js"]) {
  fs.writeFileSync(path.join(www, f), nguon[f].split("__BAN_DUNG__").join(BAN), "utf8");
}
console.log("Ma ban dung: " + BAN);

/* ---------- 2. biểu tượng: tự vẽ và tự mã hoá PNG, không thêm thư viện ---------- */
const NEN   = [0x0F, 0x6B, 0x5C];   // xanh lục thẫm, màu nhấn của giao diện
const TRANG = [0xFF, 0xFF, 0xFF];
const AM    = [0xE8, 0xA4, 0x45];   // chấm ấm: tiếng nói

const bangCrc = (() => {
  const b = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; b[n] = c >>> 0; }
  return b;
})();
const crc32 = buf => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = bangCrc[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function khoi(kieu, du) {
  const than = Buffer.concat([Buffer.from(kieu, "ascii"), du]);
  const dai = Buffer.alloc(4); dai.writeUInt32BE(du.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(than), 0);
  return Buffer.concat([dai, than, crc]);
}
function taoPng(canh, diem) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canh, 0); ihdr.writeUInt32BE(canh, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const tho = Buffer.alloc(canh * (canh * 3 + 1));
  let v = 0;
  for (let y = 0; y < canh; y++) {
    tho[v++] = 0;
    for (let x = 0; x < canh; x++) { const p = diem[y * canh + x]; tho[v++] = p[0]; tho[v++] = p[1]; tho[v++] = p[2]; }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    khoi("IHDR", ihdr), khoi("IDAT", zlib.deflateSync(tho, { level: 9 })), khoi("IEND", Buffer.alloc(0))
  ]);
}

/* Hai vòng tròn chụm đầu vào nhau — hai người đang nói chuyện,
   kèm ba chấm ấm: lời đang được nói ra. */
function veBieuTuong(canh) {
  const diem = new Array(canh * canh);
  const hinh = [
    { x: canh * 0.385, y: canh * 0.44, r: canh * 0.155, mau: TRANG },
    { x: canh * 0.615, y: canh * 0.44, r: canh * 0.125, mau: TRANG },
    { x: canh * 0.385, y: canh * 0.70, r: canh * 0.205, mau: TRANG },
    { x: canh * 0.615, y: canh * 0.70, r: canh * 0.175, mau: TRANG },
    { x: canh * 0.50,  y: canh * 0.215, r: canh * 0.030, mau: AM },
    { x: canh * 0.605, y: canh * 0.235, r: canh * 0.024, mau: AM },
    { x: canh * 0.395, y: canh * 0.235, r: canh * 0.024, mau: AM }
  ];
  for (let y = 0; y < canh; y++) for (let x = 0; x < canh; x++) {
    let mau = NEN;
    for (const h of hinh) {
      let trong = 0;
      for (const dx of [0.25, 0.75]) for (const dy of [0.25, 0.75]) {
        const a = x + dx - h.x, b = y + dy - h.y;
        if (a * a + b * b <= h.r * h.r) trong++;
      }
      if (trong === 4) mau = h.mau;
      else if (trong > 0) { const t = trong / 4; mau = [0, 1, 2].map(i => Math.round(mau[i] * (1 - t) + h.mau[i] * t)); }
    }
    diem[y * canh + x] = mau;
  }
  return taoPng(canh, diem);
}

for (const [ten, canh] of [["icon-512.png", 512], ["icon-192.png", 192], ["apple-touch-icon.png", 180]]) {
  fs.writeFileSync(path.join(www, ten), veBieuTuong(canh));
}

/* ---------- 3. tự kiểm tra ---------- */
const html = fs.readFileSync(path.join(www, "index.html"), "utf8");
const bytes = fs.readFileSync(path.join(www, "index.html"));
const js = fs.readFileSync(path.join(www, "app.js"), "utf8");
let hong = 0;
const ok = (ten, dung) => { if (!dung) hong++; console.log(`  ${dung ? "OK " : "LOI"} ${ten}`); };

console.log("Da dung www/ :");
fs.readdirSync(www).sort().forEach(f =>
  console.log(`  ${f}  ${fs.statSync(path.join(www, f)).size.toLocaleString("vi-VN")} bytes`));

ok("co <!doctype html>", html.trimStart().toLowerCase().startsWith("<!doctype html>"));
ok("co <meta charset> trong 1024 byte dau", bytes.indexOf(Buffer.from('<meta charset="utf-8">')) < 1024);
ok("co the viewport", /width=device-width/.test(html));
ok("chu co dau dung UTF-8", bytes.includes(Buffer.from("Cháu Nghe Kể", "utf8")));
ok("co [hidden] display:none !important", /\[hidden\]\{display:none !important\}/.test(html));
ok("co manifest va apple-touch-icon", /rel="manifest"/.test(html) && /rel="apple-touch-icon"/.test(html));
/* có sw.js không đủ — phải có chỗ đăng ký, nếu không file đó nằm chơi */
ok("co dang ky service worker", /serviceWorker\.register/.test(html));
for (const f of ["manifest.webmanifest", "sw.js", "apple-touch-icon.png", "icon-192.png", "icon-512.png"])
  ok("co www/" + f, fs.existsSync(path.join(www, f)));

const sw = fs.readFileSync(path.join(www, "sw.js"), "utf8");
ok("sw.js lay ban moi tu mang cho trang va ma nguon",
   /req\.mode === "navigate"/.test(sw) && /hayDoi\(url\)/.test(sw));
ok("sw.js bo qua ca dem HTTP cua trinh duyet",
   /cache: "no-store"/.test(sw));

/* trang va ma nguon phai mang cung mot ma ban dung, va phai co chot tu chua */
const banHtml = (html.match(/name="ban-dung" content="([0-9a-f]{8})"/) || [])[1];
const banJs = (js.match(/BAN_DUNG = "([0-9a-f]{8})"/) || [])[1];
ok("trang va ma nguon cung ma ban dung (" + (banHtml || "?") + ")", !!banHtml && banHtml === banJs);
ok("con sot cho danh dau __BAN_DUNG__ chua thay", !/__BAN_DUNG__/.test(html + js));
ok("co chot tu chua khi lech ban", /__tuChua/.test(html) && /__tuChua/.test(js));
ok("nhat ky tro chuyen duoc ve rieng, khong bi phan khac keo nga",
   /rieng\("nhật ký trò chuyện", veDsBuoi\)/.test(js));

try { new Function(js); ok("app.js khong loi cu phap", true); }
catch (e) { ok("app.js LOI: " + e.message, false); }

/* mọi id dùng trong app.js phải có thật trong index.html */
const thieu = [...new Set([...js.matchAll(/\$\("#([A-Za-z0-9_-]+)"\)/g)].map(m => m[1]))]
  .filter(id => !new RegExp(`id="${id}"`).test(html));
ok("moi id trong app.js deu co trong index.html" + (thieu.length ? " — thieu: " + thieu.join(", ") : ""), !thieu.length);

process.exit(hong ? 1 : 0);
