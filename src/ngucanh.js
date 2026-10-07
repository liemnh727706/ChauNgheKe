/* Bộ hiểu ngữ cảnh câu chuyện.
 *
 * Việc của nó: nghe một mạch lời kể, nhặt ra những gì cụ vừa nhắc tới —
 * người nào, ở đâu, hồi nào, chuyện gì — rồi khi cụ dừng lại thì hỏi tiếp
 * về đúng thứ cụ vừa nói mà chưa kể rõ.
 *
 * Nguyên tắc: câu hỏi phải chứa CHÍNH LỜI CỤ VỪA NÓI. "Bà Tư là người thế
 * nào hả má?" nghe ra ngay là có người đang nghe; "Rồi sao nữa ạ?" thì không.
 *
 * Chạy trong máy, không gọi lên mạng: đáp phải tức thì, và tuyệt đối không
 * được bịa ra chi tiết gia đình — thứ rất hại với người sa sút trí nhớ.
 *
 * So khớp GIỮ NGUYÊN DẤU. Bỏ dấu thì "chùa" đụng "chưa", "chợ" đụng "cho",
 * "thì" đụng "thi", "bỏ" đụng "bò" — nhặt ra toàn mốc giả.
 */
(function (global) {
"use strict";

const MOC_NGUOI = ["ông", "bà", "cô", "chú", "bác", "anh", "chị", "em", "cậu", "dì",
                   "thím", "mợ", "cụ", "thầy", "dượng", "út", "ngoại", "nội"];

/* Từ chỉ chính người đang kể hoặc người nghe — hỏi "má là ai" thì vô duyên */
const TU_MINH = new Set(["má", "mẹ", "ba", "bố", "cha", "con", "cháu", "tôi", "mình", "tao"]);

const MOC_NOI = ["chợ", "làng", "xóm", "sông", "rạch", "kênh", "trường", "chùa",
                 "đình", "nhà thờ", "bến", "cầu", "ruộng", "rẫy", "đồng", "vườn",
                 "phố", "quận", "huyện", "tỉnh", "ga", "bệnh viện", "miếu", "giếng", "ấp"];

const MOC_THOI = ["năm", "thời", "mùa", "dạo", "tết", "giỗ"];
const SO = new Set(["một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười",
                    "mươi", "trăm", "ngàn", "nghìn", "rằm", "mùng"]);

const VIEC = {
  "cưới": "đám cưới", "đám cưới": "đám cưới", "lấy chồng": "chuyện lấy chồng",
  "lấy vợ": "chuyện lấy vợ", "đi lính": "hồi đi lính", "bộ đội": "hồi đi bộ đội",
  "chạy giặc": "hồi chạy giặc", "tản cư": "hồi tản cư", "di cư": "hồi di cư",
  "gặt": "mùa gặt", "cấy": "mùa cấy", "buôn bán": "chuyện buôn bán",
  "đi học": "hồi đi học", "sinh": "chuyện sinh nở", "đói": "những năm đói",
  "chuyển nhà": "hồi chuyển nhà", "dựng nhà": "hồi dựng nhà", "ốm": "trận ốm đó"
};

const DO = ["xuồng", "ghe", "thuyền", "trâu", "bò", "xe đạp", "xe lam", "nón",
            "áo dài", "radio", "cối xay", "lu", "chum", "võng", "nồi đồng", "cối"];

const CHAN = new Set([
  "của", "là", "thì", "mà", "với", "và", "rồi", "cũng", "đã", "đang", "sẽ",
  "không", "có", "ở", "đi", "về", "lại", "ra", "vào", "lên", "xuống", "qua",
  "cho", "được", "bị", "rất", "lắm", "quá", "nữa", "này", "đó", "kia", "ấy",
  "nó", "tôi", "mình", "ta", "hồi", "lúc", "khi", "nên", "vì", "do", "nhưng",
  "còn", "hay", "ơi", "ạ", "nhé", "cả", "mấy", "những", "các", "từ", "tới", "đến",
  /* động từ, tính từ hay dính ngay sau tên: "bà Tư thương má lắm" → phải ra "bà Tư" */
  "thương", "nói", "kể", "làm", "ăn", "uống", "bán", "mua", "dẫn", "theo", "dành",
  "thích", "ghét", "nhớ", "quên", "đẻ", "sinh", "mất", "chết", "sống", "ngủ",
  "trồng", "nuôi", "gọi", "bảo", "hỏi", "nấu", "may", "giặt", "chèo", "gánh", "dọn",
  "hiền", "dữ", "giỏi", "tốt", "xấu", "già", "trẻ", "đẹp", "nghèo", "giàu", "vui",
  "chưa", "vẫn", "mới", "sắp", "vừa", "từng", "bây", "giờ", "nay", "nào", "trời"
]);

const tach = s => String(s).trim().split(/\s+/).filter(Boolean);
const sach = w => w.replace(/[.,!?;:"'()]/g, "");
const boDau = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

function HieuNguCanh() {
  this.moc = {};
  this.soLuot = 0;
  this.cumCuoi = "";
}

HieuNguCanh.prototype.nghe = function (loi) {
  const goc = tach(loi).map(sach);
  const thuong = goc.map(w => w.toLowerCase());
  this.soLuot++;

  const them = (loai, ten, uuTien) => {
    ten = ten.trim();
    if (!ten) return;
    const moiKhoa = ten.toLowerCase();
    /* Gộp tên ngắn vào tên dài cùng loại: "Rạch Kiến" và "xóm Rạch Kiến"
       là một chỗ, đừng tính thành hai. */
    for (const k in this.moc) {
      const m = this.moc[k];
      if (m.loai !== loai) continue;
      const cu = m.ten.toLowerCase();
      if (cu === moiKhoa || cu.indexOf(moiKhoa) >= 0) { m.dem++; m.lanCuoi = this.soLuot; return; }
      if (moiKhoa.indexOf(cu) >= 0) { m.ten = ten; m.dem++; m.lanCuoi = this.soLuot; return; }
    }
    this.moc[loai + "|" + moiKhoa] =
      { loai, ten, dem: 1, lanCuoi: this.soLuot, daHoi: false, uuTien: uuTien || 0 };
  };

  const layTen = (i, daiMoc, toiDa) => {
    const phan = [goc.slice(i, i + daiMoc).join(" ")];
    for (let k = i + daiMoc; k < Math.min(goc.length, i + daiMoc + toiDa); k++) {
      const t = thuong[k];
      if (!t || CHAN.has(t) || t.length > 7) break;
      phan.push(goc[k]);
    }
    return phan.join(" ");
  };

  for (let i = 0; i < thuong.length; i++) {
    const t = thuong[i];
    const hai = t + " " + (thuong[i + 1] || "");
    const truoc = thuong[i - 1] || "";

    /* NGƯỜI — bỏ qua khi chữ trước là mốc nơi chốn: "chợ Bà Chiểu" là cái chợ,
       không phải một bà tên Chiểu. */
    if (MOC_NGUOI.indexOf(t) >= 0 && MOC_NOI.indexOf(truoc) < 0) {
      const ten = layTen(i, 1, 1);
      if (tach(ten).length >= 2) them("nguoi", ten, 3);   // "bà" trống thì bỏ
      continue;
    }
    if (TU_MINH.has(t)) continue;                         // không hỏi về chính người kể

    const laNoi = MOC_NOI.find(n => n === t || n === hai);
    if (laNoi) {
      const ten = layTen(i, laNoi.indexOf(" ") >= 0 ? 2 : 1, 2);
      if (tach(ten).length >= 2) them("noi", ten, 2);
      continue;
    }

    if (MOC_THOI.indexOf(t) >= 0) {
      const ten = layTen(i, 1, 2);
      const chu = tach(ten);
      /* mốc thời gian chỉ đáng hỏi khi có con số hoặc là lễ tết:
         "năm sáu mươi tám" thì được, "năm liền" thì không */
      const dangKe = chu.length >= 2 &&
        (chu.slice(1).some(c => SO.has(c.toLowerCase()) || /\d/.test(c)) ||
         ["tết", "giỗ", "mùa"].indexOf(t) >= 0);
      if (dangKe) them("thoi", ten, 1);
      continue;
    }

    const viec = VIEC[hai] || VIEC[t];
    if (viec) { them("viec", viec, 3); continue; }

    const do_ = DO.find(d => d === t || d === hai);
    if (do_) { them("do", do_, 1); continue; }
  }

  this.cumCuoi = goc.slice(-4).join(" ");
  return this;
};

/* Chọn thứ đáng hỏi nhất: cụ vừa nhắc, nhắc ít, và chưa hỏi bao giờ */
HieuNguCanh.prototype.chonMoc = function () {
  let tot = null, diemTot = -1;
  for (const k in this.moc) {
    const m = this.moc[k];
    if (m.daHoi || m.dem > 3) continue;
    const moi = Math.max(0, 4 - (this.soLuot - m.lanCuoi));
    const diem = moi * 3 + m.uuTien - m.dem;
    if (diem > diemTot) { diemTot = diem; tot = m; }
  }
  return diemTot >= 2 ? tot : null;
};

HieuNguCanh.prototype.danhDauDaHoi = function (m) { if (m) m.daHoi = true; };

HieuNguCanh.prototype.tomTat = function () {
  const theo = { nguoi: [], noi: [], thoi: [], viec: [], do: [] };
  for (const k in this.moc) if (theo[this.moc[k].loai]) theo[this.moc[k].loai].push(this.moc[k].ten);
  return theo;
};

global.HieuNguCanh = HieuNguCanh;
global.__ngucanh = { boDau, tach, sach };

})(typeof window !== "undefined" ? window : globalThis);
