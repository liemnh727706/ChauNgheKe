/* Cháu Nghe Kể — người bạn trò chuyện bằng giọng nói cho người già.
 *
 * Nguyên tắc thiết kế, theo liệu pháp hồi tưởng (reminiscence therapy):
 *   - Mục đích là để cụ ĐƯỢC NÓI, không phải để cụ nói đúng.
 *   - Không bao giờ cải chính, không hỏi kiểm tra trí nhớ ("năm nào", "tên gì").
 *   - Phần lớn lượt đáp là tiếng đệm và phản chiếu lại lời cụ vừa nói —
 *     đó mới là dấu hiệu của người đang thật sự lắng nghe. Hỏi ít thôi,
 *     hỏi nhiều thành ra hỏi cung.
 *   - Càng sa sút nặng càng nói chậm, câu ngắn, thiên về trấn an.
 *
 * Máy trả lời chạy hoàn toàn trong máy: không gửi chuyện nhà người ta đi đâu,
 * đáp tức thì (độ trễ phá vỡ cảm giác được lắng nghe), và không bao giờ
 * bịa ra chi tiết gia đình — thứ rất hại với người sa sút trí nhớ.
 */
(function () {
"use strict";

/* ===================================================================
   1. Trạng thái và lưu trữ
   =================================================================== */

const KHOA = "chaunghe.v1";
const MAC_DINH = {
  nguoi: [], chon: 0, goi: "bà", muc: "vua",
  giong: "", ghiAm: true, buoi: []
};
let S = Object.assign({}, MAC_DINH);

function doc() {
  try { const r = localStorage.getItem(KHOA); if (r) S = Object.assign({}, MAC_DINH, JSON.parse(r)); }
  catch (e) {}
  /* người thêm từ trước chưa có giới tính — đoán theo quan hệ, mặc định là nữ */
  let doi = false;
  S.nguoi.forEach(n => {
    if (n.gioi) return;
    const t = boDau(n.qh || "");
    n.gioi = /(trai|re|cha|bo |anh |chu |cau |bac |ong|chong)/.test(t) ? "nam" : "nu";
    if (n.giong === undefined) n.giong = S.giong || "";
    doi = true;
  });
  if (doi) luu();
}
function luu() { try { localStorage.setItem(KHOA, JSON.stringify(S)); } catch (e) {} }

const $ = s => document.querySelector(s);
const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
const bocThan = a => a[Math.floor(Math.random() * a.length)];
function ngayKhoa(d) {
  const x = d || new Date();
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function dongHo(g) { return Math.floor(g / 60) + ":" + String(Math.round(g % 60)).padStart(2, "0"); }

function nguoiDangChon() { return S.nguoi[S.chon] || null; }
function XUNG() { const n = nguoiDangChon(); return (n && n.xung) || "cháu"; }
function GOI() { return S.goi || "bà"; }
function TEN() { const n = nguoiDangChon(); return (n && n.ten) || ""; }

/* ===================================================================
   2. Kho ngôn ngữ — tiếng Việt, bối cảnh người già Việt Nam
   =================================================================== */

/* Chủ đề nhận ra từ lời kể, dùng để chọn câu hỏi nối chuyện cho đúng mạch */
const CHU_DE = {
  giadinh: ["mẹ", "má", "cha", "ba ", "bố", "ông", "bà", "anh", "chị", "em", "vợ", "chồng", "gia đình", "nhà mình", "cụ"],
  que:     ["làng", "xóm", "quê", "đồng", "ruộng", "sông", "chợ", "đò", "ghe", "vườn", "cây đa", "giếng", "đình", "cầu"],
  thoitre: ["hồi nhỏ", "hồi bé", "hồi trẻ", "ngày xưa", "hồi đó", "lúc đó", "thuở", "hồi xưa"],
  nghe:    ["nghề", "buôn", "bán", "dạy học", "bộ đội", "lính", "công nhân", "nông dân", "cày", "gánh", "thợ", "làm ăn"],
  anuong:  ["cơm", "bánh", "chè", "phở", "canh", "nấu", "món", "mắm", "cá", "thịt", "rau", "khoai", "sắn", "ăn"],
  letet:   ["tết", "giỗ", "cưới", "hội", "đám", "lễ", "rằm", "mùng", "đình đám"],
  hoc:     ["trường", "đi học", "thầy", "cô giáo", "lớp", "sách", "chữ", "thi"],
  khokhan: ["đói", "nghèo", "khổ", "vất vả", "chiến tranh", "bom", "giặc", "chạy loạn", "cực", "bệnh"],
  concai:  ["con", "cháu", "sinh", "đẻ", "nuôi", "bế", "lớn lên"]
};

const TU_VUI  = ["vui", "thích", "cười", "mừng", "hạnh phúc", "ngon", "đẹp", "hay", "sướng", "khoái", "giỏi"];
const TU_BUON = ["buồn", "khổ", "đói", "nghèo", "mất", "chết", "đau", "khóc", "sợ", "cực", "vất vả", "tội", "bệnh"];
const TU_NHO  = ["nhớ", "thương", "giờ không còn", "mất rồi", "đã mất", "xa quá"];

/* Danh từ đáng nhắc lại. Phản chiếu đúng một từ cụ vừa nói là tín hiệu
   lắng nghe mạnh nhất — mạnh hơn bất kỳ câu hỏi nào. */
const DANH_TU = [
  "mẹ", "má", "cha", "bố", "ông", "bà", "anh", "chị", "em", "con", "cháu", "vợ", "chồng",
  "làng", "xóm", "quê", "chợ", "sông", "đồng", "ruộng", "vườn", "đò", "ghe", "thuyền", "cầu",
  "nhà", "giếng", "đình", "chùa", "trường", "lớp", "thầy", "cô giáo",
  "tết", "giỗ", "đám cưới", "hội", "bộ đội", "chiến tranh",
  "cơm", "bánh chưng", "bánh tét", "chè", "phở", "mắm", "cá", "khoai", "sắn", "trầu",
  "trâu", "bò", "gà", "lợn", "heo", "chó", "mèo", "lúa", "tre", "dừa", "xe đạp", "gánh"
];

/* --- các kho câu đáp. {X} = app tự xưng, {G} = gọi cụ, {K} = từ nhắc lại --- */

const DAP_DEM = [                      // tiếng đệm: ngắn, nhiều nhất
  "Dạ.", "Dạ, {X} nghe.", "Vâng ạ.", "Dạ, {X} nghe đây.",
  "Dạ, {X} đang nghe {G} kể.", "Ừm, dạ.", "Dạ, {X} nghe rõ mà.", "Dạ vâng."
];

const DAP_PHAN_CHIEU = [               // nhắc lại một từ của cụ
  "À, {K} ạ.", "Dạ, {K}…", "{K} cơ ạ.", "À, ra là {K}.",
  "Dạ, {K} hả {G}.", "{K}… dạ {X} nghe rồi."
];

const DAP_VUI = [
  "Nghe vui quá {G} ơi.", "Chắc hồi đó {G} thích lắm ạ.", "Hay quá {G}.",
  "{X} thích nghe chuyện này lắm.", "Dạ, nghe sướng thật {G} nhỉ."
];

/* Nhớ thương người đã khuất — an ủi, ở lại cùng cụ, không khen ngợi */
const DAP_NHO = [
  "Dạ… chắc {G} nhớ lắm.", "{X} nghe mà thương {G} quá.",
  "Dạ, {X} hiểu mà {G}.", "Dạ… {X} đang ngồi đây với {G} nè.",
  "{G} còn nhớ rõ vậy là quý lắm ạ.", "Dạ… {G} kể nữa đi, {X} nghe."
];

/* Kể chuyện đói khổ, vất vả — ghi nhận sức chịu đựng của cụ */
const DAP_VAT_VA = [
  "Hồi đó vất vả lắm {G} nhỉ.", "{G} chịu khó ghê ạ.",
  "Khổ vậy mà {G} vẫn qua được, giỏi quá {G}.",
  "Dạ… nghe mà {X} thương {G}.", "Cực vậy mà {G} vẫn lo được cho cả nhà."
];

const DAP_KHICH_LE = [                 // khi cụ nói rất ngắn
  "Dạ, {G} kể tiếp đi ạ, {X} nghe mà.", "Rồi sao nữa {G}?",
  "Dạ, rồi sao ạ?", "{G} kể nữa đi, {X} thích nghe lắm.",
  "Dạ, {X} đang nghe đây {G}."
];

/* Cụ hỏi lại — tuyệt đối không bịa chi tiết, chỉ trấn an rồi trả lượt cho cụ */
const DAP_HOI_LAI = [
  "Dạ, {X} nghe rõ mà {G}.", "Dạ có ạ.", "Dạ, {X} đang ngồi đây với {G} nè.",
  "{X} muốn nghe {G} kể thêm cơ.", "Dạ {G} kể tiếp đi, {X} nghe."
];

const DAP_LA_AI = [
  "Dạ, {X} là {T} đây mà {G}.", "{T} đây {G} ơi.", "Dạ {T} nè {G}, {X} đang nghe {G} kể."
];

const DAP_TAM_BIET = [
  "Dạ, {G} nghỉ đi ạ. Hôm nào {G} kể tiếp cho {X} nghe nhé.",
  "Dạ thôi {G} nghỉ nhé. {X} thích nghe {G} kể lắm.",
  "Dạ, {G} giữ sức khoẻ. Mai {X} lại nghe {G} kể tiếp ạ."
];

/* Câu hỏi nối chuyện theo chủ đề. Toàn câu mở, không có câu nào
   bắt cụ phải nhớ ra một dữ kiện cụ thể. */
const HOI = {
  giadinh: ["Hồi đó nhà mình đông người không {G}?", "Mọi người trong nhà hồi đó thế nào ạ?",
            "{G} kể thêm về người đó cho {X} nghe đi ạ."],
  que:     ["Xóm mình hồi đó có đông vui không {G}?", "Quê mình hồi đó trông thế nào ạ?",
            "Nhà mình hồi đó ở gần sông hay gần chợ hả {G}?"],
  thoitre: ["Hồi đó {G} hay đi đâu chơi ạ?", "Hồi ấy {G} còn trẻ lắm nhỉ.",
            "{G} kể thêm chuyện hồi đó đi ạ."],
  nghe:    ["Công việc hồi đó có vất vả lắm không {G}?", "{G} làm việc đó lâu chưa ạ?",
            "Hồi đó làm ăn thế nào hả {G}?"],
  anuong:  ["Món đó nấu thế nào hả {G}?", "Ai nấu ngon nhất nhà mình ạ?",
            "Nghe là {X} thèm rồi đó {G}."],
  letet:   ["Tết hồi đó nhà mình chuẩn bị những gì {G}?", "Hồi đó {G} thích nhất cái gì trong mấy ngày đó ạ?",
            "Đông vui lắm phải không {G}?"],
  hoc:     ["Trường hồi đó có xa nhà không {G}?", "Hồi đi học {G} thế nào ạ?"],
  khokhan: ["Khổ vậy mà {G} vẫn vượt qua được, giỏi quá {G}.", "Dạ… hồi đó cực lắm {G} nhỉ."],
  concai:  ["Hồi các con còn bé thì thế nào hả {G}?", "Đứa nào nghịch nhất ạ?"],
  chung:   ["Rồi sao nữa hả {G}?", "{G} kể tiếp cho {X} nghe đi ạ.", "Dạ, rồi thế nào {G}?"]
};

/* Khi cụ im lặng lâu — gợi một chuyện mới, không hối thúc */
const MOI_CHUYEN = [
  "{G} ơi, hồi nhỏ {G} thích ăn món gì nhất ạ?",
  "{G} kể cho {X} nghe về cái nhà ngày xưa của mình đi ạ.",
  "Tết ngày xưa nhà mình thế nào hả {G}?",
  "{G} còn nhớ con đường đi học hồi bé không ạ?",
  "Hồi đó {G} làm nghề gì vậy ạ?",
  "{G} kể chuyện hồi mới cưới cho {X} nghe đi ạ.",
  "Hồi các con còn bé, {G} nhớ chuyện gì nhất ạ?",
  "Quê mình hồi đó có gì vui nhất hả {G}?",
  "{G} ơi, bài hát nào hồi xưa {G} thuộc nhất ạ?",
  "Chợ quê mình hồi đó họp ở đâu hả {G}?"
];

const CHAO_DAU = [
  "{G} ơi, {X} đây. Hôm nay {G} kể chuyện gì cho {X} nghe đi ạ.",
  "Dạ {G}, {X} đang ngồi đây. {G} kể chuyện ngày xưa cho {X} nghe nhé.",
  "{G} ơi, {X} nhớ {G} quá. {G} kể chuyện hồi xưa đi ạ."
];

/* ===================================================================
   3. Máy hồi đáp
   =================================================================== */

function thay(mau) {
  return mau.replace(/\{X\}/g, XUNG()).replace(/\{G\}/g, GOI())
            .replace(/\{T\}/g, TEN() || XUNG());
}
function boDau(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
}

function doChuDe(loi) {
  const t = " " + loi.toLowerCase() + " ";
  let tot = null, diem = 0;
  for (const cd in CHU_DE) {
    let d = 0;
    for (const tu of CHU_DE[cd]) if (t.indexOf(tu) >= 0) d++;
    if (d > diem) { diem = d; tot = cd; }
  }
  return diem ? tot : null;
}

/* Trả về cả mức độ: lời kể nặng cảm xúc thì phải an ủi cho bằng được,
   không được rơi xuống tiếng đệm suông. */
function doCamXuc(loi) {
  const t = " " + loi.toLowerCase() + " ";
  const dem = ds => ds.reduce((n, tu) => n + (t.indexOf(tu) >= 0 ? 1 : 0), 0);
  const nho = dem(TU_NHO), buon = dem(TU_BUON), vui = dem(TU_VUI);
  if (buon + nho > vui)
    return { loai: "thuong", manh: buon + nho, kieu: nho >= buon ? "nho" : "vatva" };
  if (vui > 0) return { loai: "vui", manh: vui };
  return { loai: "binh", manh: 0 };
}

/* Viết hoa đầu câu — các mẫu câu bắt đầu bằng {G} hoặc {X} nên hay
   lọt ra chữ thường, và cụm nhắc lại thì lấy nguyên từ lời cụ. */
function chuanHoa(s) {
  return String(s).replace(/\s+/g, " ").trim()
    /* dấu … là ngắt hơi giữa câu, không phải hết câu — không viết hoa sau nó */
    .replace(/(^|[.!?]\s+)(\p{Ll})/gu, (m, dau, chu) => dau + chu.toUpperCase());
}
function hạThấp(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/* Lấy ra cụm đáng nhắc lại: một danh từ cụ vừa nói, kèm 1-2 chữ sau nó */
function layCumNhacLai(loi) {
  const chu = loi.trim().split(/\s+/);
  const thuong = chu.map(c => c.toLowerCase().replace(/[.,!?;:]/g, ""));
  for (let i = 0; i < thuong.length; i++) {
    for (const dt of DANH_TU) {
      const phan = dt.split(" ");
      if (thuong.slice(i, i + phan.length).join(" ") === dt) {
        const het = Math.min(chu.length, i + phan.length + 2);
        return chu.slice(i, het).join(" ").replace(/[.,!?;:]+$/, "");
      }
    }
  }
  if (chu.length >= 3) return chu.slice(-3).join(" ").replace(/[.,!?;:]+$/, "");
  return "";
}

function laCauHoi(loi) {
  const t = boDau(loi).trim();
  return /\?$/.test(loi.trim()) ||
    /\b(khong|chua|ha|hã|phai khong|dung khong|sao|the nao|gi|ai|dau|may)\s*$/.test(t);
}
function hoiLaAi(loi) {
  const t = boDau(loi);
  return /(ai day|ai do|ai vay|ai the|la ai|ai goi|ai dang noi|co phai)/.test(t);
}
function muonNghi(loi) {
  const t = boDau(loi);
  return /(thoi nhe|thoi con|thoi chau|di ngu|met roi|nghi day|tam biet|chao con|chao chau|du roi|thoi dung)/.test(t);
}

/* Chính sách lượt đáp theo mức độ sa sút:
   nặng thì ít hỏi, nhiều trấn an, câu ngắn. */
const CHINH_SACH = {
  nhe:  { hoi: 0.40, toc: 0.95 },
  vua:  { hoi: 0.28, toc: 0.88 },
  nang: { hoi: 0.12, toc: 0.78 }
};

let vuaHoi = false;      // không hỏi hai lượt liền — thành hỏi cung
let soLuot = 0;
const daDung = [];       // tránh lặp lại y nguyên câu vừa nói

function chonKhongLap(kho) {
  for (let i = 0; i < 8; i++) {
    const c = bocThan(kho);
    if (daDung.indexOf(c) < 0) { daDung.push(c); if (daDung.length > 12) daDung.shift(); return c; }
  }
  return bocThan(kho);
}

function soanDap(loi) {
  const d = soanDapTho(loi);
  d.text = chuanHoa(d.text);
  return d;
}

function soanDapTho(loi) {
  soLuot++;
  const cs = CHINH_SACH[S.muc] || CHINH_SACH.vua;

  if (hoiLaAi(loi))  { vuaHoi = false; return { text: thay(chonKhongLap(DAP_LA_AI)), loai: "danhtinh" }; }
  if (muonNghi(loi)) { return { text: thay(chonKhongLap(DAP_TAM_BIET)), loai: "chia tay", ketThuc: true }; }

  const soChu = loi.trim().split(/\s+/).filter(Boolean).length;
  if (soChu <= 2) { vuaHoi = true; return { text: thay(chonKhongLap(DAP_KHICH_LE)), loai: "khích lệ" }; }

  if (laCauHoi(loi)) { vuaHoi = false; return { text: thay(chonKhongLap(DAP_HOI_LAI)), loai: "đáp lại" }; }

  const cx = doCamXuc(loi);
  const cd = doChuDe(loi);
  const cum = layCumNhacLai(loi);
  const nhacLai = () => ({
    text: thay(chonKhongLap(DAP_PHAN_CHIEU)).replace(/\{K\}/g, hạThấp(cum)),
    loai: "nhắc lại", chuDe: cd
  });

  /* Cảm xúc mạnh thì phải an ủi — quan trọng hơn mọi câu hỏi.
     Kể chuyện đói khổ, mất mát mà chỉ nhận lại "Dạ." thì còn tệ hơn im lặng. */
  if (cx.loai === "thuong" && (cx.manh >= 2 || Math.random() < 0.75)) {
    vuaHoi = false;
    const kho = cx.kieu === "nho" ? DAP_NHO : DAP_VAT_VA;
    return { text: thay(chonKhongLap(kho)), loai: cx.kieu === "nho" ? "nhớ thương" : "vất vả", chuDe: cd };
  }
  if (cx.loai === "vui" && (cx.manh >= 2 || Math.random() < 0.55)) {
    vuaHoi = false;
    return { text: thay(chonKhongLap(DAP_VUI)), loai: "vui", chuDe: cd };
  }

  /* Hỏi nối chuyện — có chừng mực, và không bao giờ hai lượt liền */
  if (!vuaHoi && Math.random() < cs.hoi) {
    vuaHoi = true;
    const kho = (cd && HOI[cd]) ? HOI[cd] : HOI.chung;
    return { text: thay(chonKhongLap(kho)), loai: "hỏi nối", chuDe: cd };
  }
  vuaHoi = false;

  /* Còn lại: nhắc lại lời cụ. Tiếng đệm suông chỉ dùng khi không
     nhặt được cụm nào đáng nhắc — nhắc lại bao giờ cũng ấm hơn. */
  if (cum) return nhacLai();
  return { text: thay(chonKhongLap(DAP_DEM)), loai: "đệm", chuDe: cd };
}

/* ===================================================================
   4. Nói (tổng hợp giọng)
   =================================================================== */

let giongCo = [];
function nhatGiong() {
  try { giongCo = (window.speechSynthesis.getVoices() || []).filter(v => v.lang && /^vi/i.test(v.lang)); }
  catch (e) { giongCo = []; }
}

/* Đoán giọng nam hay nữ từ tên giọng.
   Cái bẫy: tên giọng tiếng Việt nào cũng chứa "Vietnam" / "Việt Nam", mà "nam"
   lại đúng là từ chỉ giới tính — không gạt đi trước thì mọi giọng đều thành nam. */
const DAU_NU  = ["hoaimy", "hoai my", "linh", "mai", "lan", "ngoc", "thu", "huong",
                 "female", "woman", "girl", "nu",
                 "standard-a", "standard-c", "wavenet-a", "wavenet-c", "neural2-a", "neural2-c"];
const DAU_NAM = ["namminh", "nam minh", "minh", "long", "hung", "tuan", "an",
                 "male", "man", "boy",
                 "standard-b", "standard-d", "wavenet-b", "wavenet-d", "neural2-b", "neural2-d"];

function doanGioiGiong(ten) {
  const t = boDau(String(ten || "")).replace(/vietnamese|viet ?nam|vi[-_ ]?vn/g, " ");
  const co = ds => ds.some(k => k.length <= 3 ? new RegExp("\\b" + k + "\\b").test(t) : t.indexOf(k) >= 0);
  if (co(DAU_NU)) return "nu";    // xét nữ trước: "woman" có chứa "man"
  if (co(DAU_NAM)) return "nam";
  return "";
}
const TEN_GIOI = { nu: "nữ", nam: "nam" };

function giongChoNguoi(ng) {
  if (!giongCo.length) return null;
  if (ng && ng.giong) { const v = giongCo.find(x => x.name === ng.giong); if (v) return v; }
  if (ng && ng.gioi) { const v = giongCo.find(x => doanGioiGiong(x.name) === ng.gioi); if (v) return v; }
  return giongCo[0];
}

/* Máy chỉ có một giọng tiếng Việt là chuyện rất thường trên điện thoại.
   Khi giọng không đúng giới, kéo cao độ cho nghiêng về phía cần — không
   thành thật nhưng đỡ lệch hẳn. Kéo vừa phải thôi, quá tay nghe như máy. */
function caoDoChoNguoi(ng) {
  if (!ng || !ng.gioi) return 1;
  const v = giongChoNguoi(ng);
  const g = v ? doanGioiGiong(v.name) : "";
  if (g === ng.gioi) return ng.gioi === "nu" ? 1.06 : 0.96;
  if (!g)            return ng.gioi === "nu" ? 1.15 : 0.88;
  return ng.gioi === "nu" ? 1.25 : 0.78;
}
try { window.speechSynthesis.onvoiceschanged = () => { nhatGiong(); veDsGiong(); }; nhatGiong(); } catch (e) {}

function noi(text, xong) {
  const sp = window.speechSynthesis;
  if (!sp) { if (xong) xong(); return; }
  try {
    sp.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "vi-VN";
    u.rate = (CHINH_SACH[S.muc] || CHINH_SACH.vua).toc;
    const ng = nguoiDangChon();
    u.pitch = caoDoChoNguoi(ng);
    const g = giongChoNguoi(ng);
    if (g) u.voice = g;
    u.onend = () => { if (xong) xong(); };
    u.onerror = () => { if (xong) xong(); };
    sp.speak(u);
  } catch (e) { if (xong) xong(); }
}

/* ===================================================================
   5. Nghe (nhận dạng giọng nói)
   =================================================================== */

const MayNghe = window.SpeechRecognition || window.webkitSpeechRecognition;

function canTroMic() {
  /* chuỗi phải nằm cùng dòng với return: xuống dòng là JavaScript tự chèn
     dấu chấm phẩy và hàm trả về undefined, mọi phép kiểm coi như vô hiệu */
  if (location.protocol === "file:")
    return "Mở trang thẳng từ file trong máy thì trình duyệt khóa micro và không hiện cửa sổ hỏi quyền. " +
           "Cần mở bằng một địa chỉ bắt đầu bằng https.";
  if (!window.isSecureContext)
    return "Trang đang mở bằng http thường nên trình duyệt khóa micro. Cần địa chỉ https.";
  if (!MayNghe)
    return "Trình duyệt này không nghe được giọng nói. Hãy mở bằng Chrome (Android) hoặc Safari (iPhone).";
  try {
    const cs = document.featurePolicy || document.permissionsPolicy;
    if (cs && cs.allowsFeature && !cs.allowsFeature("microphone")) return
      "Trang đang nằm trong khung nhúng không được cấp quyền micro. Hãy mở ở một thẻ riêng.";
  } catch (e) {}
  return null;
}

async function trangThaiQuyen() {
  try {
    if (!navigator.permissions || !navigator.permissions.query) return "khongro";
    return (await navigator.permissions.query({ name: "microphone" })).state;
  } catch (e) { return "khongro"; }
}

function giaiThichLoiNghe(ma) {
  if (ma === "not-allowed" || ma === "service-not-allowed")
    return "Chưa được dùng micro. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ → Quyền → Micro → Cho phép, rồi mở lại.";
  if (ma === "audio-capture") return "Không tìm thấy micro trên máy này.";
  if (ma === "network") return "Mất mạng nên không nghe được. Nhận dạng giọng nói cần có internet.";
  if (ma === "aborted") return "";
  return "";
}

/* ===================================================================
   6. Ghi âm buổi nói chuyện
   =================================================================== */

const KHO_AM = "chaunghe-am";
function moKho() {
  return new Promise((res, rej) => {
    try {
      const r = indexedDB.open(KHO_AM, 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("am")) r.result.createObjectStore("am"); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
}
function viec(che, fn) {
  return moKho().then(db => new Promise((res, rej) => {
    const tx = db.transaction("am", che);
    const rq = fn(tx.objectStore("am"));
    tx.oncomplete = () => res(rq && rq.result);
    tx.onerror = () => rej(tx.error);
  }));
}
const amLuu = (id, b) => viec("readwrite", st => st.put(b, id));
const amDoc = id => viec("readonly", st => st.get(id));
const amXoa = id => viec("readwrite", st => st.delete(id));

function duoiTu(mime) {
  if (!mime) return "webm";
  if (mime.indexOf("mp4") >= 0 || mime.indexOf("aac") >= 0) return "mp4";
  if (mime.indexOf("ogg") >= 0) return "ogg";
  return "webm";
}

async function sangMp3(blob) {
  if (!window.lamejs) return null;
  let ctx = null;
  try {
    const ab = await blob.arrayBuffer();
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await ctx.decodeAudioData(ab);
    const pcm = buf.getChannelData(0);
    const i16 = new Int16Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) {
      const s = Math.max(-1, Math.min(1, pcm[i]));
      i16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const enc = new lamejs.Mp3Encoder(1, buf.sampleRate, 64);
    const phan = []; const K = 1152;
    for (let i = 0; i < i16.length; i += K) {
      const d = enc.encodeBuffer(i16.subarray(i, i + K));
      if (d.length) phan.push(new Uint8Array(d));
    }
    const c = enc.flush(); if (c.length) phan.push(new Uint8Array(c));
    return new Blob(phan, { type: "audio/mpeg" });
  } catch (e) { return null; }
  finally { if (ctx) try { ctx.close(); } catch (e) {} }
}

function taiVe(blob, ten) {
  try {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = ten;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 5000);
    return true;
  } catch (e) { return false; }
}

async function luuRaFile(blob, ext, ngay, bao) {
  bao("Đang chuyển thành mp3…");
  const mp3 = await sangMp3(blob);
  const ten = "ChuyenKe_" + ngay + "_" + String(Date.now()).slice(-4) + "." + (mp3 ? "mp3" : ext);
  const ok = taiVe(mp3 || blob, ten);
  bao(ok ? "Đã lưu vào thư mục Tải về ✓" : "Trình duyệt chặn tải file");
}

/* ===================================================================
   7. Phiên trò chuyện
   =================================================================== */

const P = {
  chay: false, tam: false, dangNoi: false,
  may: null, luong: null, ghi: null, manh: [],
  batDau: 0, loi: [], chuDe: {}, demIm: null, phanTich: null, veSong: null,
  id: "", amId: "", demManh: 0, coAm: false, ext: "webm", kieuAm: ""
};

/* Lưu dần sau mỗi lượt, không đợi tới lúc bấm "Xong rồi".
   Người già nói xong thường tắt máy hoặc bấm nút quay lại — nếu chỉ lưu
   ở cuối thì cả buổi kể mất sạch. Ghi vào localStorage nên tức thì và
   chạy được cả trong lúc trang đang đóng. */
function luuBuoi(daXong) {
  if (!P.id) return;
  if (!P.loi.some(l => l.ai === "cu")) return;   // cụ chưa nói gì thì chưa có gì để lưu
  const ban = {
    id: P.id,
    d: ngayKhoa(new Date(P.batDau)),
    luc: new Date(P.batDau).toISOString(),
    giay: Math.round((Date.now() - P.batDau) / 1000),
    chuDe: Object.keys(P.chuDe),
    loi: P.loi.slice(0, 400),
    dangDo: !daXong
  };
  if (P.coAm) { ban.am = P.amId; ban.ext = P.ext; }
  const i = S.buoi.findIndex(b => b.id === P.id);
  if (i >= 0) S.buoi[i] = ban; else S.buoi.unshift(ban);
  S.buoi = S.buoi.slice(0, 60);
  luu();
}

/* Đổ tiếng nói đã thu được vào kho, định kỳ chứ không đợi tới cuối buổi */
async function xaTiengNoi() {
  if (!P.manh.length || !P.amId) return;
  try {
    const blob = new Blob(P.manh, { type: P.kieuAm || "audio/webm" });
    await amLuu(P.amId, blob);
    P.coAm = true; P.ext = duoiTu(blob.type);
    luuBuoi(!P.chay);
  } catch (e) {}
}

function datTrangThai(chu, kieu) {
  const t = $("#trangThai");
  t.textContent = chu;
  t.className = "trang-thai" + (kieu === "noi" ? " noi" : "");
  $("#vongNghe").className = "vong" + (kieu === "nghe" ? " nghe" : "");
  $("#khungAnh").classList.toggle("dang-noi", kieu === "noi");
}

function hienLoiCu(t) { $("#loiCu").textContent = t; }
function hienLoiApp(t) {
  const o = $("#loiApp");
  o.hidden = !t; o.textContent = t ? "— " + t : "";
}

function baoLoi(t) {
  const o = $("#baoLoi");
  o.hidden = !t; o.textContent = t || "";
}

function veSongAm() {
  const o = $("#song");
  o.innerHTML = "";
  const cot = [];
  for (let i = 0; i < 13; i++) { const c = el("i"); o.appendChild(c); cot.push(c); }
  if (!P.phanTich) return;
  const du = new Uint8Array(P.phanTich.frequencyBinCount);
  function khung() {
    if (!P.chay) return;
    P.phanTich.getByteFrequencyData(du);
    for (let i = 0; i < cot.length; i++) {
      const v = du[2 + i * 3] || 0;
      cot[i].style.height = (6 + (P.tam || P.dangNoi ? 0 : v / 255 * 38)) + "px";
    }
    P.veSong = requestAnimationFrame(khung);
  }
  khung();
}

function datDemIm() {
  clearTimeout(P.demIm);
  const cho = S.muc === "nang" ? 20000 : S.muc === "vua" ? 16000 : 13000;
  P.demIm = setTimeout(() => {
    if (!P.chay || P.tam || P.dangNoi) return;
    const c = thay(chonKhongLap(MOI_CHUYEN));
    ghiLoi("app", c);
    hienLoiApp(c);
    phatLoi(c);
  }, cho);
}

function ghiLoi(ai, text) {
  P.loi.push({ ai, text, giay: Math.round((Date.now() - P.batDau) / 1000) });
  if (ai === "cu") luuBuoi(false);   // lưu ngay sau mỗi lượt cụ kể
}

function phatLoi(text, ketThuc) {
  text = chuanHoa(text);   // lời chào và câu gợi chuyện cũng phải viết hoa đầu câu
  P.dangNoi = true;
  clearTimeout(P.demIm);
  datTrangThai((TEN() || "Cháu") + " đang nói…", "noi");
  try { if (P.may) P.may.stop(); } catch (e) {}
  noi(text, () => {
    P.dangNoi = false;
    if (ketThuc) { ketThucBuoi(); return; }
    if (P.chay && !P.tam) { batMayNghe(); datTrangThai("Đang nghe " + GOI() + " kể…", "nghe"); datDemIm(); }
  });
}

function batMayNghe() {
  if (!MayNghe || !P.chay || P.tam || P.dangNoi) return;
  try { if (P.may) { P.may.onend = null; P.may.abort(); } } catch (e) {}
  const m = new MayNghe();
  P.may = m;
  m.lang = "vi-VN";
  m.continuous = true;
  m.interimResults = true;
  m.maxAlternatives = 1;

  m.onresult = ev => {
    let tam = "", xong = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) xong += r[0].transcript; else tam += r[0].transcript;
    }
    if (tam) { hienLoiCu(tam); datDemIm(); }
    if (xong.trim()) {
      const loi = xong.trim();
      hienLoiCu(loi);
      ghiLoi("cu", loi);
      const d = soanDap(loi);
      if (d.chuDe) P.chuDe[d.chuDe] = (P.chuDe[d.chuDe] || 0) + 1;
      ghiLoi("app", d.text);
      hienLoiApp(d.text);
      phatLoi(d.text, d.ketThuc);
    }
  };
  m.onerror = ev => {
    const g = giaiThichLoiNghe(ev.error);
    if (g) baoLoi(g);
    if (ev.error === "not-allowed" || ev.error === "service-not-allowed") dungHan();
  };
  m.onend = () => {
    if (P.chay && !P.tam && !P.dangNoi) { try { m.start(); } catch (e) {} }
  };
  try { m.start(); } catch (e) {}
}

async function batDauBuoi() {
  const tro = canTroMic();
  if (tro) { chuyenMan("noi"); baoLoi(tro); datTrangThai("Chưa nghe được", ""); return; }

  chuyenMan("noi");
  baoLoi("");
  veAnh($("#oAnhNoi"), nguoiDangChon(), true);
  P.chay = true; P.tam = false; P.dangNoi = false;
  P.loi = []; P.chuDe = {}; P.manh = []; P.batDau = Date.now();
  P.id = "b" + P.batDau; P.amId = "am" + P.batDau;
  P.demManh = 0; P.coAm = false; P.ext = "webm"; P.kieuAm = "";
  soLuot = 0; vuaHoi = false; daDung.length = 0;
  hienLoiCu(""); hienLoiApp("");
  $("#nutTam").textContent = "Tạm dừng";

  try {
    P.luong = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    baoLoi("Chưa mở được micro. Hãy bấm “Cho phép” khi trình duyệt hỏi, hoặc bật quyền micro cho trang này trong cài đặt trình duyệt.");
    datTrangThai("Chưa nghe được", "");
    P.chay = false;
    return;
  }

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    P.phanTich = ctx.createAnalyser();
    P.phanTich.fftSize = 128;
    ctx.createMediaStreamSource(P.luong).connect(P.phanTich);
  } catch (e) { P.phanTich = null; }
  veSongAm();

  if (S.ghiAm && window.MediaRecorder) {
    try {
      P.ghi = new MediaRecorder(P.luong);
      P.kieuAm = P.ghi.mimeType || "audio/webm";
      P.ghi.ondataavailable = ev => {
        if (!ev.data || !ev.data.size) return;
        P.manh.push(ev.data);
        P.demManh++;
        if (P.demManh % 3 === 0) xaTiengNoi();   // cất tiếng nói mỗi ~15 giây
      };
      /* cắt thành mẩu 5 giây: nếu máy tắt đột ngột thì vẫn còn phần đã thu */
      P.ghi.start(5000);
    } catch (e) { P.ghi = null; }
  }

  const chao = thay(chonKhongLap(CHAO_DAU));
  ghiLoi("app", chao);
  hienLoiApp(chao);
  phatLoi(chao);
}

function dungHan() {
  P.chay = false;
  clearTimeout(P.demIm);
  if (P.veSong) cancelAnimationFrame(P.veSong);
  try { if (P.may) { P.may.onend = null; P.may.abort(); } } catch (e) {}
  try { window.speechSynthesis.cancel(); } catch (e) {}
  P.may = null;
}

async function ketThucBuoi() {
  const dangGhi = P.ghi && P.ghi.state === "recording";
  const giay = Math.round((Date.now() - P.batDau) / 1000);
  dungHan();

  if (dangGhi) {
    await new Promise(res => {
      P.ghi.onstop = res;
      try { P.ghi.stop(); } catch (e) { res(); }
    });
  }
  if (P.luong) { P.luong.getTracks().forEach(t => t.stop()); P.luong = null; }

  await xaTiengNoi();
  luuBuoi(true);
  const daLuu = P.loi.some(l => l.ai === "cu");

  P.ghi = null; P.manh = []; P.id = "";
  veTrangChinh();
  chuyenMan("chinh");
  if (daLuu) khoeDaLuu(giay);
}

/* Cho người nhà thấy rõ là buổi nói chuyện đã được cất giữ */
function khoeDaLuu(giay) {
  const o = $("#daLuu");
  o.hidden = false;
  o.textContent = "✓ Đã lưu buổi nói chuyện " + dongHo(giay) + ". Nghe lại ở Góc người nhà.";
  clearTimeout(khoeDaLuu.h);
  khoeDaLuu.h = setTimeout(() => { o.hidden = true; }, 9000);
}

/* ===================================================================
   8. Giao diện
   =================================================================== */

function chuyenMan(ten) {
  ["chinh", "noi", "nha"].forEach(m => { $("#man-" + m).hidden = (m !== ten); });
  $("#nutNha").hidden = (ten === "noi");
  window.scrollTo(0, 0);
}

function matThay(ng) { return ng && ng.gioi === "nam" ? "👨" : "👩"; }

function veAnh(o, ng, tron) {
  o.innerHTML = "";
  if (ng && ng.anh) {
    const im = document.createElement("img");
    im.className = "anh-to"; im.src = ng.anh; im.alt = ng.ten || "Ảnh người thân";
    o.appendChild(im);
  } else {
    o.appendChild(el("div", "anh-thay", ng ? matThay(ng) : "👨‍👩‍👧‍👦"));
  }
}

function veTrangChinh() {
  const ng = nguoiDangChon();
  veAnh($("#oAnhChinh"), ng, false);
  $("#hoChinh").textContent = ng ? ng.ten : "Chưa chọn người trò chuyện";
  $("#qhChinh").textContent = ng
    ? (ng.qh ? ng.qh + " của " + GOI() : "Người nhà")
    : "Vào Góc người nhà để thêm ảnh con cháu";
  $("#nutBatDau").textContent = ng ? "Bấm để trò chuyện với " + ng.ten : "Bấm để trò chuyện";
}

const TA_MUC = {
  nhe: "Nhẹ — ứng dụng nói với tốc độ bình thường, thỉnh thoảng hỏi nối chuyện để cụ kể dài hơn.",
  vua: "Vừa — nói chậm hơn, hỏi ít lại, nhắc lại lời cụ nhiều hơn để cụ biết mình đang được nghe.",
  nang: "Nặng — nói rất chậm, câu ngắn, gần như không hỏi. Chủ yếu là tiếng đệm và lời trấn an."
};

function veDsGiong() {
  const s = $("#nGiong");
  if (!s) return;
  const ng = nguoiDangChon();
  $("#tenGiong").textContent = ng ? ng.ten : "người trò chuyện";

  s.innerHTML = "";
  if (!giongCo.length) {
    s.appendChild(el("option", null, "Giọng mặc định của máy"));
    $("#matGiong").textContent =
      "Máy chưa thấy giọng tiếng Việt nào. Trên Android: Cài đặt → Ngôn ngữ → " +
      "Đầu ra giọng nói → tải thêm tiếng Việt. Trên iPhone: Cài đặt → Trợ năng → Nội dung đọc.";
    $("#matGiong").style.color = "var(--am)";
    return;
  }

  const dangDung = giongChoNguoi(ng);
  s.appendChild(Object.assign(el("option", null, "Tự chọn theo giới tính"), { value: "" }));
  giongCo.forEach(v => {
    const g = doanGioiGiong(v.name);
    const o = el("option", null, v.name + (g ? " — giọng " + TEN_GIOI[g] : " — chưa rõ nam nữ"));
    o.value = v.name;
    if (ng && ng.giong === v.name) o.selected = true;
    s.appendChild(o);
  });

  /* nói thẳng tình trạng, đừng để người nhà ngồi đoán vì sao giọng nghe lạ */
  const m = $("#matGiong");
  if (!ng) { m.textContent = "Chưa chọn người trò chuyện."; m.style.color = "var(--muted)"; return; }
  const gDung = dangDung ? doanGioiGiong(dangDung.name) : "";
  const coHop = giongCo.some(v => doanGioiGiong(v.name) === ng.gioi);
  if (coHop && gDung === ng.gioi) {
    m.textContent = "Đang dùng giọng " + TEN_GIOI[ng.gioi] + " cho " + ng.ten + ". Nghe thử bên dưới.";
    m.style.color = "var(--muted)";
  } else {
    m.textContent = "Máy này không có giọng " + TEN_GIOI[ng.gioi] + " tiếng Việt. " +
      "App đã chỉnh cao độ cho nghiêng về giọng " + TEN_GIOI[ng.gioi] +
      ", nhưng muốn tự nhiên hơn thì nên cài thêm giọng tiếng Việt " + TEN_GIOI[ng.gioi] +
      " trong cài đặt của máy.";
    m.style.color = "var(--am)";
  }
}

function veDsNguoi() {
  const o = $("#dsNguoi");
  o.innerHTML = "";
  if (!S.nguoi.length) {
    o.appendChild(el("p", "y", "Chưa có ai. Hãy thêm ít nhất một người để bắt đầu."));
    return;
  }
  S.nguoi.forEach((n, i) => {
    const t = el("div", "the-nguoi" + (i === S.chon ? " chon" : ""));
    if (n.anh) { const im = document.createElement("img"); im.src = n.anh; im.alt = n.ten; t.appendChild(im); }
    else t.appendChild(el("div", "mat", matThay(n)));
    t.appendChild(el("div", "tn", n.ten));
    t.appendChild(el("div", "qh", (n.qh ? n.qh + " · " : "") + TEN_GIOI[n.gioi || "nu"]));
    const nut = el("div", "nut");
    const bGioi = el("button", null, n.gioi === "nam" ? "→ nữ" : "→ nam");
    bGioi.title = "Đổi giới tính để chọn giọng cho hợp";
    bGioi.onclick = () => {
      n.gioi = n.gioi === "nam" ? "nu" : "nam";
      n.giong = "";                      // bỏ giọng đã chọn tay, để tự chọn lại cho hợp
      luu(); veDsNguoi(); veTrangChinh(); veDsGiong();
    };
    const bChon = el("button", null, i === S.chon ? "Đang chọn" : "Chọn");
    bChon.onclick = () => { S.chon = i; luu(); veDsNguoi(); veTrangChinh(); veDsGiong(); };
    const bXoa = el("button", null, "Xóa");
    bXoa.onclick = () => {
      S.nguoi.splice(i, 1);
      if (S.chon >= S.nguoi.length) S.chon = 0;
      luu(); veDsNguoi(); veTrangChinh();
    };
    nut.appendChild(bChon); nut.appendChild(bGioi); nut.appendChild(bXoa);
    t.appendChild(nut);
    o.appendChild(t);
  });
}

function veDsBuoi() {
  const o = $("#dsBuoi");
  o.innerHTML = "";
  if (!S.buoi.length) { o.appendChild(el("li", null, "Chưa có buổi nói chuyện nào.")); return; }

  S.buoi.slice(0, 20).forEach((b, i) => {
    const li = el("li");
    const d = new Date(b.luc);
    li.appendChild(el("div", "khi",
      d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " · " +
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") +
      " · nói " + dongHo(b.giay)));
    const cu = b.loi.filter(l => l.ai === "cu");
    li.appendChild(el("div", "tom",
      cu.length + " lượt kể" + (b.chuDe && b.chuDe.length ? " · " + b.chuDe.map(tenChuDe).join(", ") : "")));

    if (b.am) {
      const ng = document.createElement("audio");
      ng.controls = true; ng.preload = "none";
      li.appendChild(ng);
      amDoc(b.am).then(blob => { if (blob) ng.src = URL.createObjectURL(blob); else ng.remove(); })
                 .catch(() => ng.remove());
    }

    const viecO = el("div", "viec");
    if (b.am) {
      const bLuu = el("button", null, "⬇️ Lưu file mp3");
      bLuu.onclick = async () => {
        const blob = await amDoc(b.am).catch(() => null);
        if (!blob) return;
        bLuu.disabled = true;
        await luuRaFile(blob, b.ext || "webm", b.d, t => bLuu.textContent = t);
        setTimeout(() => { bLuu.textContent = "⬇️ Lưu file mp3"; bLuu.disabled = false; }, 2600);
      };
      viecO.appendChild(bLuu);
    }
    const bLoi = el("button", null, "Xem lời kể");
    bLoi.onclick = () => {
      if (li.querySelector(".ban-loi")) { li.querySelector(".ban-loi").remove(); return; }
      const h = el("div", "ban-loi");
      h.style.cssText = "margin-top:10px; font-size:.9rem; line-height:1.6";
      b.loi.forEach(l => {
        const p = el("div");
        p.style.cssText = "margin-top:6px" + (l.ai === "app" ? "; color:var(--accent)" : "; font-family:var(--serif); font-style:italic");
        p.textContent = (l.ai === "cu" ? GOI() + ": " : (TEN() || "Cháu") + ": ") + l.text;
        h.appendChild(p);
      });
      li.appendChild(h);
    };
    viecO.appendChild(bLoi);

    const bXoa = el("button", null, "Xóa buổi này");
    bXoa.onclick = () => {
      if (bXoa.dataset.chac !== "1") {
        bXoa.dataset.chac = "1"; bXoa.textContent = "Bấm lần nữa để xóa";
        setTimeout(() => { bXoa.dataset.chac = "0"; bXoa.textContent = "Xóa buổi này"; }, 4000);
        return;
      }
      if (b.am) amXoa(b.am).catch(() => {});
      S.buoi.splice(i, 1); luu(); veDsBuoi();
    };
    viecO.appendChild(bXoa);
    li.appendChild(viecO);
    o.appendChild(li);
  });
}

function tenChuDe(k) {
  return { giadinh: "gia đình", que: "quê", thoitre: "thời trẻ", nghe: "công việc",
           anuong: "món ăn", letet: "lễ Tết", hoc: "học hành", khokhan: "thời khó khăn",
           concai: "con cháu" }[k] || k;
}

async function veTinMic() {
  const o = $("#tinMic"); o.innerHTML = "";
  const d = (k, v) => { const li = el("li"); li.appendChild(el("div", "khi", k)); li.appendChild(el("div", null, v)); o.appendChild(li); };
  const gt = location.protocol.replace(":", "");
  d("Cách mở trang", gt === "file" ? "file trong máy — micro bị khóa" : gt === "https" ? "https — tốt" : gt);
  d("Địa chỉ", gt === "file" ? "(file trong máy)" : location.origin);
  d("Kết nối an toàn", window.isSecureContext ? "có" : "không");
  d("Nghe được giọng nói", MayNghe ? "có" : "không — hãy dùng Chrome hoặc Safari");
  d("Nói được thành tiếng", window.speechSynthesis ? "có" : "không");
  d("Giọng tiếng Việt", giongCo.length ? giongCo.length + " giọng" : "chưa thấy — máy sẽ đọc bằng giọng mặc định");
  const q = await trangThaiQuyen();
  d("Quyền micro", { granted: "đã cho phép", denied: "đang bị chặn", prompt: "sẽ hỏi khi dùng" }[q] || "không rõ");
  const tro = canTroMic();
  const k = $("#ketMic");
  if (tro) { k.textContent = tro; k.style.color = "var(--am)"; }
  else if (q === "denied") { k.textContent = "Quyền micro đang bị chặn. Bấm ổ khóa cạnh thanh địa chỉ → Quyền → Micro → Cho phép, rồi mở lại trang."; k.style.color = "var(--am)"; }
  else { k.textContent = "Không thấy trở ngại nào."; k.style.color = "var(--muted)"; }
}

function veGocNha() {
  document.querySelectorAll("#baMuc button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.m === S.muc)));
  $("#taMuc").textContent = TA_MUC[S.muc];
  $("#nGoi").value = S.goi;
  $("#nutGhiAm").textContent = "Tự ghi âm buổi nói chuyện: " + (S.ghiAm ? "Bật" : "Tắt");
  $("#nutGhiAm").setAttribute("aria-pressed", String(S.ghiAm));
  veDsGiong(); veDsNguoi(); veDsBuoi(); veTinMic();
  try { $("#chep").value = JSON.stringify(Object.assign({}, S, { buoi: S.buoi.map(b => ({ d: b.d, giay: b.giay })) })); }
  catch (e) { $("#chep").value = ""; }
}

/* ảnh thu nhỏ trước khi lưu để không đầy bộ nhớ trình duyệt */
function thuNho(file, canh) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(im.width, im.height);
        const cv = document.createElement("canvas");
        cv.width = canh; cv.height = canh;
        cv.getContext("2d").drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, canh, canh);
        res(cv.toDataURL("image/jpeg", 0.82));
      };
      im.onerror = rej; im.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

/* ===================================================================
   9. Gắn sự kiện
   =================================================================== */

$("#nutNha").onclick = () => { veGocNha(); chuyenMan("nha"); };
$("#nutVe").onclick = () => { veTrangChinh(); chuyenMan("chinh"); };
$("#nutBatDau").onclick = () => batDauBuoi();
$("#nutDoiNguoi").onclick = () => { veGocNha(); chuyenMan("nha"); };

$("#nutTam").onclick = () => {
  P.tam = !P.tam;
  $("#nutTam").textContent = P.tam ? "Nói tiếp" : "Tạm dừng";
  if (P.tam) {
    clearTimeout(P.demIm);
    try { if (P.may) { P.may.onend = null; P.may.abort(); } } catch (e) {}
    try { window.speechSynthesis.cancel(); } catch (e) {}
    P.dangNoi = false;
    datTrangThai("Đang tạm dừng", "");
  } else {
    batMayNghe();
    datTrangThai("Đang nghe " + GOI() + " kể…", "nghe");
    datDemIm();
  }
};
$("#nutKet").onclick = () => ketThucBuoi();

document.querySelectorAll("#baMuc button").forEach(b => {
  b.onclick = () => { S.muc = b.dataset.m; luu(); veGocNha(); };
});
$("#nGoi").onchange = e => { S.goi = e.target.value; luu(); veTrangChinh(); };
$("#nGiong").onchange = e => {
  const ng = nguoiDangChon();
  if (ng) { ng.giong = e.target.value; luu(); veDsGiong(); }
};
$("#nGioi").onchange = () => { $("#nGioi").dataset.tay = "1"; };
/* đoán sẵn giới tính từ quan hệ, người nhà vẫn sửa được */
$("#nQh").oninput = () => {
  if ($("#nGioi").dataset.tay === "1") return;
  const t = boDau($("#nQh").value);
  if (/(gai|dau|me|ba |chi |co |di |mo |thim|vo)/.test(t)) $("#nGioi").value = "nu";
  else if (/(trai|re|cha|bo |anh |chu |cau |bac |ong|chong)/.test(t)) $("#nGioi").value = "nam";
};
$("#nutThuGiong").onclick = () => noi(thay("Dạ {G} ơi, {X} đang nghe {G} kể đây ạ."));
$("#nutGhiAm").onclick = () => {
  S.ghiAm = !S.ghiAm; luu();
  $("#nutGhiAm").textContent = "Tự ghi âm buổi nói chuyện: " + (S.ghiAm ? "Bật" : "Tắt");
  $("#nutGhiAm").setAttribute("aria-pressed", String(S.ghiAm));
};

$("#nutThem").onclick = async () => {
  const ten = $("#nTen").value.trim();
  if (!ten) { $("#nTen").focus(); return; }
  const qh = $("#nQh").value.trim();
  const xung = $("#nXung").value;
  const gioi = $("#nGioi").value;
  const f = $("#nAnh").files[0];
  let anh = null;
  if (f) { try { anh = await thuNho(f, 480); } catch (e) { anh = null; } }
  S.nguoi.push({ ten, qh, xung, gioi, anh, giong: "" });
  S.chon = S.nguoi.length - 1;
  luu();
  $("#nTen").value = ""; $("#nQh").value = ""; $("#nAnh").value = "";
  delete $("#nGioi").dataset.tay;
  veDsNguoi(); veTrangChinh(); veDsGiong();
};

$("#nutChep").onclick = () => {
  const t = $("#chep"); t.select();
  try { navigator.clipboard.writeText(t.value); } catch (e) { try { document.execCommand("copy"); } catch (e2) {} }
  $("#nutChep").textContent = "Đã chép ✓";
  setTimeout(() => $("#nutChep").textContent = "Chép", 1800);
};

/* Thoát đột ngột: tắt máy, bấm nút quay lại, chuyển sang app khác.
   Ghi vào localStorage là việc đồng bộ nên kịp chạy xong, còn tiếng nói
   thì đã được cất định kỳ sẵn rồi. */
function chotLai() {
  if (!P.chay) return;
  luuBuoi(false);
  try { if (P.ghi && P.ghi.state === "recording") P.ghi.requestData(); } catch (e) {}
  xaTiengNoi();
}
window.addEventListener("pagehide", chotLai);
window.addEventListener("beforeunload", chotLai);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    chotLai();
    if (P.chay && !P.tam) $("#nutTam").click();
  }
});

/* ===================================================================
   10. Khởi động
   =================================================================== */

doc();
veTrangChinh();
chuyenMan("chinh");

/* để kiểm thử máy hồi đáp mà không cần micro */
window.__thuMayDap = function (loi) { return soanDap(loi); };
window.__datMuc = function (m) { S.muc = m; };

})();
