/* Chế độ "Kể chuyện liền mạch".
 *
 * Khác hẳn chế độ hỏi đáp: ở đây app KHÔNG đáp sau mỗi câu. Cụ cứ kể một
 * mạch, app im lặng nghe và gom lại. Chỉ khi cụ dừng hẳn vài giây mới lên
 * tiếng, và lên tiếng bằng chính chuyện cụ vừa kể.
 *
 * Ba việc phải làm cho đúng:
 *   1. Không cắt ngang. Dừng dưới ngưỡng thì tuyệt đối im.
 *   2. Hỏi phải dính ngữ cảnh — chứa tên người, tên chợ, cái năm cụ vừa nhắc.
 *   3. Chủ yếu là tiếng đệm nối chuyện; hỏi thưa thôi, hỏi dồn thành hỏi cung.
 */
(function (global) {
"use strict";

/* Ngưỡng im lặng trước khi app lên tiếng, theo mức sa sút.
   Càng nặng nói càng chậm, ngắt quãng càng nhiều — phải chờ lâu hơn. */
const NGUONG_DUNG = { nhe: 2600, vua: 3200, nang: 4000 };

/* Im quá lâu thì gợi chuyện, nhưng đừng hối */
const NGUONG_LANG = { nhe: 14000, vua: 18000, nang: 22000 };

/* Câu hỏi dựng từ mốc cụ vừa nhắc. {E} là chính lời cụ nói. */
const HOI_THEO_MOC = {
  nguoi: [
    "{E} là người thế nào hả {G}?",
    "{G} với {E} thân nhau lắm à?",
    "Rồi {E} sau đó ra sao {G}?",
    "{G} kể thêm về {E} cho {X} nghe đi ạ."
  ],
  noi: [
    "{E} hồi đó trông thế nào hả {G}?",
    "{G} hay ra {E} lắm à?",
    "{E} có đông người không {G}?",
    "Hồi đó ở {E} có gì vui không {G}?"
  ],
  thoi: [
    "{E} thì nhà mình thế nào hả {G}?",
    "{G} còn nhớ gì về {E} nữa không ạ?"
  ],
  viec: [
    "{E} hôm đó ra sao hả {G}?",
    "{G} kể {X} nghe về {E} đi ạ.",
    "Hồi {E} chắc vất vả lắm {G} nhỉ."
  ],
  do: [
    "Cái {E} đó giờ còn không {G}?",
    "{G} còn nhớ cái {E} đó chứ ạ?"
  ]
};

/* Tiếng đệm nối chuyện — phần lớn lượt đáp phải là loại này */
const NOI_TIEP = [
  "Dạ, rồi sao nữa {G}?",
  "Dạ {X} nghe đây, {G} kể tiếp đi ạ.",
  "Rồi sao nữa hả {G}?",
  "Dạ… rồi {G}?",
  "{X} đang nghe mà, {G} kể tiếp đi."
];

/* Nhắc lại cụm cuối để cụ biết mình nghe tới đâu */
const NHAC_LAI = [
  "À, {C}… rồi sao nữa {G}?",
  "Dạ, {C}. Rồi {G}?",
  "{C} à… {G} kể tiếp đi ạ."
];

const LANG_LAU = [
  "{G} ơi, {X} vẫn đang nghe đây ạ.",
  "{G} nghỉ chút rồi kể tiếp cho {X} nghe nhé.",
  "Dạ, {G} cứ thong thả. {X} ngồi đây mà."
];

const MO_DAU = [
  "{G} ơi, hôm nay {G} kể chuyện cho {X} nghe đi ạ. {X} ngồi nghe, {G} cứ kể thong thả.",
  "{X} đây {G}. {G} kể chuyện ngày xưa đi, {X} nghe hết mà không ngắt lời đâu.",
  "{G} kể chuyện cho {X} nghe nhé. {G} cứ kể một mạch, {X} nghe."
];

function MayKeChuyen(tuyChon) {
  this.nc = new global.HieuNguCanh();
  this.muc = tuyChon.muc || "vua";
  this.thay = tuyChon.thay;             // đổi {X} {G} thành xưng hô thật
  this.chuanHoa = tuyChon.chuanHoa || (s => s);
  this.soLanDap = 0;
  this.soLanHoi = 0;
  this.daDung = [];
  this.chuaDap = "";                    // phần cụ kể mà app chưa đáp lời nào
}

MayKeChuyen.prototype.nguongDung = function () { return NGUONG_DUNG[this.muc] || NGUONG_DUNG.vua; };
MayKeChuyen.prototype.nguongLang = function () { return NGUONG_LANG[this.muc] || NGUONG_LANG.vua; };

MayKeChuyen.prototype.chon = function (kho) {
  for (let i = 0; i < 8; i++) {
    const c = kho[Math.floor(Math.random() * kho.length)];
    if (this.daDung.indexOf(c) < 0) {
      this.daDung.push(c);
      if (this.daDung.length > 10) this.daDung.shift();
      return c;
    }
  }
  return kho[Math.floor(Math.random() * kho.length)];
};

/* Cụ vừa kể thêm một đoạn */
MayKeChuyen.prototype.nghe = function (loi) {
  this.nc.nghe(loi);
  this.chuaDap = (this.chuaDap + " " + loi).trim();
};

MayKeChuyen.prototype.moDau = function () {
  return this.chuanHoa(this.thay(this.chon(MO_DAU)));
};

MayKeChuyen.prototype.langLau = function () {
  return this.chuanHoa(this.thay(this.chon(LANG_LAU)));
};

/* Cụ đã dừng đủ lâu — giờ mới được lên tiếng.
   Trả về null nghĩa là chưa có gì để nói, cứ im tiếp. */
MayKeChuyen.prototype.dapKhiDung = function () {
  if (!this.chuaDap) return null;
  const daKe = this.chuaDap;
  this.chuaDap = "";
  this.soLanDap++;

  /* Nhịp: hỏi — nối — hỏi — nối. Không bao giờ hỏi hai lượt liền (hỏi dồn
     thành hỏi cung), nhưng cũng đừng chỉ ậm ừ: cụ cần thấy mình được hiểu.
     Hết mốc đáng hỏi thì tự khắc lui về tiếng đệm. */
  const vuaHoi = this.lanHoiCuoi === this.soLanDap - 1;
  const toiLuotHoi = !vuaHoi;

  if (toiLuotHoi) {
    const m = this.nc.chonMoc();
    if (m) {
      this.nc.danhDauDaHoi(m);
      this.lanHoiCuoi = this.soLanDap;
      this.soLanHoi++;
      const mau = this.chon(HOI_THEO_MOC[m.loai] || HOI_THEO_MOC.viec);
      return {
        text: this.chuanHoa(this.thay(mau).replace(/\{E\}/g, m.ten)),
        loai: "hỏi theo ngữ cảnh",
        moc: m.loai + ": " + m.ten
      };
    }
  }

  /* Nhắc lại cụm cuối — cho cụ thấy mình đang nghe thật, không phải ậm ừ */
  const cum = this.nc.cumCuoi;
  if (cum && cum.split(/\s+/).length >= 2 && Math.random() < 0.45) {
    return {
      text: this.chuanHoa(this.thay(this.chon(NHAC_LAI)).replace(/\{C\}/g, cum.toLowerCase())),
      loai: "nhắc lại",
      moc: cum
    };
  }

  return { text: this.chuanHoa(this.thay(this.chon(NOI_TIEP))), loai: "nối chuyện", moc: "" };
};

MayKeChuyen.prototype.tomTat = function () { return this.nc.tomTat(); };

global.MayKeChuyen = MayKeChuyen;

})(typeof window !== "undefined" ? window : globalThis);
