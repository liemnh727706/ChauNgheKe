/* Chạy một lần để ghép chế độ kể chuyện vào giao diện và luồng chạy. */
import fs from "fs";

/* ---------------- index.html ---------------- */
let h = fs.readFileSync("src/index.html", "utf8");

const thayH = [
  // nạp hai tệp mới
  ['<script src="app.js"></script>',
   '<script src="ngucanh.js"></script>\n<script src="kechuyen.js"></script>\n<script src="app.js"></script>'],

  // trang chính: hai nút chọn chế độ
  ['    <button class="nut-lon" id="nutBatDau">Bấm để trò chuyện</button>\n    <button class="nut-phu" id="nutDoiNguoi">Đổi người trò chuyện</button>',
   '    <button class="nut-lon" id="nutBatDau">Bấm để trò chuyện</button>\n' +
   '    <button class="nut-lon" id="nutKeChuyen" style="background:var(--am); margin-top:12px">\n' +
   '      Kể chuyện liền mạch</button>\n' +
   '    <p class="y" style="text-align:center; margin-top:10px; color:var(--muted)">\n' +
   '      Kể liền mạch: cụ cứ kể, ứng dụng im lặng nghe và chỉ hỏi khi cụ dừng lại.</p>\n' +
   '    <button class="nut-phu" id="nutDoiNguoi">Đổi người trò chuyện</button>'],

  // màn trò chuyện: nhãn chế độ + chỗ hiện cả câu chuyện
  ['    <div class="trang-thai" id="trangThai">Đang chuẩn bị…</div>',
   '    <div class="nhan-che-do" id="nhanCheDo" hidden>Đang kể chuyện liền mạch</div>\n' +
   '    <div class="trang-thai" id="trangThai">Đang chuẩn bị…</div>'],

  ['      <div class="cua-app" id="loiApp" hidden></div>',
   '      <div class="cua-app" id="loiApp" hidden></div>\n' +
   '      <div class="ca-chuyen" id="caChuyen" hidden></div>']
];
for (const [cu, moi] of thayH) {
  if (!h.includes(cu)) { console.error("KHONG TIM THAY trong index.html:\n" + cu.slice(0, 70)); process.exit(1); }
  h = h.replace(cu, moi);
}

/* kiểu dáng cho phần mới */
h = h.replace(".dieu-khien{display:flex;",
`.nhan-che-do{text-align:center; margin-top:14px; font-size:.8rem; letter-spacing:.1em;
  text-transform:uppercase; font-weight:700; color:var(--am)}
.ca-chuyen{margin-top:14px; padding-top:14px; border-top:1px solid var(--line);
  font-family:var(--serif); font-size:1rem; line-height:1.6; color:var(--ink-2);
  max-height:30vh; overflow-y:auto}
.ca-chuyen b{color:var(--ink); font-style:normal}
.dieu-khien{display:flex;`);

fs.writeFileSync("src/index.html", h, "utf8");
console.log("index.html: da them nut va cho hien cau chuyen");

/* ---------------- app.js ---------------- */
let a = fs.readFileSync("src/app.js", "utf8");

const thayA = [
  // trạng thái phiên: thêm chế độ và máy kể chuyện
  ['id: "", amId: "", demManh: 0, coAm: false, ext: "webm", kieuAm: "", loiLienTiep: 0',
   'id: "", amId: "", demManh: 0, coAm: false, ext: "webm", kieuAm: "", loiLienTiep: 0,\n' +
   '  cheDo: "hoiDap", may2: null, lucCoTieng: 0, canhDung: null, caChuyen: []'],

  // nhận được lời: ở chế độ kể chuyện thì GOM LẠI, không đáp ngay
  [`      const loi = xong.trim();
      ghiKT("nghe ra: " + loi.slice(0, 50));
      P.loiLienTiep = 0;
      hienLoiCu(loi);
      ghiLoi("cu", loi);
      const d = soanDap(loi);
      if (d.chuDe) P.chuDe[d.chuDe] = (P.chuDe[d.chuDe] || 0) + 1;
      ghiLoi("app", d.text);
      hienLoiApp(d.text);
      phatLoi(d.text, d.ketThuc);`,
   `      const loi = xong.trim();
      ghiKT("nghe ra: " + loi.slice(0, 50));
      P.loiLienTiep = 0;
      P.lucCoTieng = Date.now();
      hienLoiCu(loi);
      ghiLoi("cu", loi);

      /* Chế độ kể chuyện: chỉ gom lại, tuyệt đối không đáp ngay —
         đáp ngay là cắt ngang lời cụ. Việc lên tiếng để cho bộ canh im lặng lo. */
      if (P.cheDo === "keChuyen") {
        P.caChuyen.push(loi);
        if (P.may2) P.may2.nghe(loi);
        veCaChuyen();
        return;
      }

      const d = soanDap(loi);
      if (d.chuDe) P.chuDe[d.chuDe] = (P.chuDe[d.chuDe] || 0) + 1;
      ghiLoi("app", d.text);
      hienLoiApp(d.text);
      phatLoi(d.text, d.ketThuc);`],

  // interim cũng tính là đang có tiếng
  ['    if (tam) { hienLoiCu(tam); datDemIm(); }',
   '    if (tam) { hienLoiCu(tam); P.lucCoTieng = Date.now(); datDemIm(); }'],

  // đồng hồ im lặng mặc định chỉ dùng cho chế độ hỏi đáp
  ['  P.demIm = setTimeout(() => {\n    if (!P.chay || P.tam || P.dangNoi) return;',
   '  if (P.cheDo === "keChuyen") return;   // chế độ kể chuyện có bộ canh riêng\n' +
   '  P.demIm = setTimeout(() => {\n    if (!P.chay || P.tam || P.dangNoi) return;']
];
for (const [cu, moi] of thayA) {
  if (!a.includes(cu)) { console.error("KHONG TIM THAY trong app.js:\n" + cu.slice(0, 80)); process.exit(1); }
  a = a.replace(cu, moi);
}

/* phần chạy của chế độ kể chuyện, chèn trước mục giao diện */
const KHOI = `
/* ===================================================================
   7b. Chế độ kể chuyện liền mạch
   Cụ kể một mạch, app im lặng nghe. Chỉ lên tiếng khi cụ dừng đủ lâu,
   và lên tiếng bằng chính chuyện cụ vừa kể.
   =================================================================== */

function veCaChuyen() {
  const o = $("#caChuyen");
  if (!o) return;
  o.hidden = P.cheDo !== "keChuyen" || !P.caChuyen.length;
  if (o.hidden) return;
  const n = P.caChuyen.length;
  o.innerHTML = "";
  P.caChuyen.slice(-12).forEach((c, i, ds) => {
    const d = el("div");
    d.style.marginTop = "6px";
    if (i === ds.length - 1) { const b = el("b", null, c); d.appendChild(b); }
    else d.textContent = c;
    o.appendChild(d);
  });
  o.scrollTop = o.scrollHeight;
  if (n > 12) o.firstChild.insertAdjacentHTML("beforebegin",
    '<div style="color:var(--muted); font-size:.85rem">… (' + (n - 12) + ' đoạn trước)</div>');
}

function batCanhDung() {
  dungCanhDung();
  P.lucCoTieng = Date.now();
  P.canhDung = setInterval(() => {
    if (!P.chay || P.tam || P.dangNoi || P.cheDo !== "keChuyen") return;
    const im = Date.now() - P.lucCoTieng;

    if (P.may2 && P.caChuyen.length && im >= P.may2.nguongDung()) {
      const d = P.may2.dapKhiDung();
      if (d) {
        ghiKT("cụ dừng " + Math.round(im / 1000) + "s → " + d.loai + (d.moc ? " (" + d.moc + ")" : ""));
        ghiLoi("app", d.text);
        hienLoiApp(d.text);
        P.lucCoTieng = Date.now();
        phatLoi(d.text);
      }
      return;
    }

    /* im quá lâu mà chưa kể gì: nhắc nhẹ một câu, không hối */
    if (P.may2 && !P.caChuyen.length && im >= P.may2.nguongLang()) {
      const c = P.may2.langLau();
      ghiKT("im lâu → gợi tiếp");
      ghiLoi("app", c);
      hienLoiApp(c);
      P.lucCoTieng = Date.now();
      phatLoi(c);
    }
  }, 400);
}

function dungCanhDung() { if (P.canhDung) { clearInterval(P.canhDung); P.canhDung = null; } }
`;

a = a.replace("/* ===================================================================\n   8. Giao diện", KHOI +
  "\n/* ===================================================================\n   8. Giao diện");

/* dọn bộ canh khi dừng phiên */
a = a.replace("function dungHan() {\n  P.chay = false;\n  clearTimeout(P.demIm);",
              "function dungHan() {\n  P.chay = false;\n  clearTimeout(P.demIm);\n  dungCanhDung();");

/* batDauBuoi nhận tham số chế độ */
a = a.replace("async function batDauBuoi() {", "async function batDauBuoi(cheDo) {");
a = a.replace(`  P.id = "b" + P.batDau; P.amId = "am" + P.batDau;`,
  `  P.id = "b" + P.batDau; P.amId = "am" + P.batDau;
  P.cheDo = cheDo === "keChuyen" ? "keChuyen" : "hoiDap";
  P.caChuyen = []; P.lucCoTieng = Date.now();
  P.may2 = P.cheDo === "keChuyen"
    ? new MayKeChuyen({ muc: S.muc, thay, chuanHoa })
    : null;
  $("#nhanCheDo").hidden = P.cheDo !== "keChuyen";
  $("#caChuyen").hidden = true;
  veCaChuyen();`);

/* lời mở đầu riêng cho chế độ kể chuyện, và bật bộ canh */
a = a.replace(`  const chao = thay(chonKhongLap(CHAO_DAU));
  ghiLoi("app", chao);
  hienLoiApp(chao);
  phatLoi(chao);`,
  `  const chao = P.cheDo === "keChuyen" ? P.may2.moDau() : thay(chonKhongLap(CHAO_DAU));
  ghiLoi("app", chao);
  hienLoiApp(chao);
  if (P.cheDo === "keChuyen") batCanhDung();
  phatLoi(chao);`);

/* nút mới */
a = a.replace(`$("#nutBatDau").onclick = () => batDauBuoi();`,
  `$("#nutBatDau").onclick = () => batDauBuoi("hoiDap");\n$("#nutKeChuyen").onclick = () => batDauBuoi("keChuyen");`);

/* trạng thái hiển thị khác nhau giữa hai chế độ */
a = a.replace(`    if (P.chay && !P.tam) { batMayNghe(); datTrangThai("Đang nghe " + GOI() + " kể…", "nghe"); datDemIm(); }`,
  `    if (P.chay && !P.tam) {
      batMayNghe();
      datTrangThai(P.cheDo === "keChuyen" ? GOI() + " cứ kể, " + (TEN() || "cháu") + " đang nghe…"
                                          : "Đang nghe " + GOI() + " kể…", "nghe");
      if (P.cheDo === "keChuyen") P.lucCoTieng = Date.now();
      datDemIm();
    }`);

fs.writeFileSync("src/app.js", a, "utf8");
console.log("app.js: da ghep che do ke chuyen");
