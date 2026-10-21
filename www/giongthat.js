/* Kho giọng thật của người trò chuyện.
 *
 * Vì sao không nhân bản giọng bằng AI: muốn tổng hợp giọng thật nói câu bất
 * kỳ thì phải gửi giọng lên dịch vụ trả phí, chờ vài giây mỗi câu. Độ trễ đó
 * phá hỏng cảm giác đang nói chuyện, và giọng cả đời người lại rời khỏi máy.
 *
 * Cách làm ở đây đơn giản và thật hơn: app chỉ nói một số câu hữu hạn và
 * biết trước, nên người con thu sẵn chính những câu đó. Cụ nghe được đúng
 * giọng con mình — không phải giọng bắt chước, mà là giọng thật.
 *
 * Tiếng nói để trong IndexedDB (nặng), danh mục câu đã thu để trong
 * localStorage (nhẹ, tra được tức thì để máy đáp lời còn kịp chọn câu).
 */
(function (global) {
"use strict";

const KHO = "chaunghe-giong";
const KHOA_DS = "chaunghe.dsgiong";

/* Mã ngắn cho một câu. Phải tra được đồng bộ, nên băm tại chỗ. */
function ma(cau) {
  const s = String(cau).replace(/\s+/g, " ").trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function moKho() {
  return new Promise((res, rej) => {
    try {
      const r = indexedDB.open(KHO, 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("g")) r.result.createObjectStore("g"); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
}
function viec(che, fn) {
  return moKho().then(db => new Promise((res, rej) => {
    const tx = db.transaction("g", che);
    const rq = fn(tx.objectStore("g"));
    tx.oncomplete = () => res(rq && rq.result);
    tx.onerror = () => rej(tx.error);
  }));
}

/* Danh mục: { "<idNguoi>": { "<mã câu>": 1 } } */
let ds = {};
try { ds = JSON.parse(localStorage.getItem(KHOA_DS) || "{}") || {}; } catch (e) { ds = {}; }
function luuDs() { try { localStorage.setItem(KHOA_DS, JSON.stringify(ds)); } catch (e) {} }

const khoa = (idNguoi, cau) => idNguoi + "|" + ma(cau);

const GiongThat = {
  ma,

  /* Tra đồng bộ — máy đáp lời gọi hàm này để ưu tiên câu đã có giọng thật */
  co(idNguoi, cau) {
    return !!(idNguoi && ds[idNguoi] && ds[idNguoi][ma(cau)]);
  },

  soCau(idNguoi) {
    return (idNguoi && ds[idNguoi]) ? Object.keys(ds[idNguoi]).length : 0;
  },

  async luu(idNguoi, cau, blob) {
    await viec("readwrite", st => st.put(blob, khoa(idNguoi, cau)));
    if (!ds[idNguoi]) ds[idNguoi] = {};
    ds[idNguoi][ma(cau)] = 1;
    luuDs();
  },

  lay(idNguoi, cau) {
    return viec("readonly", st => st.get(khoa(idNguoi, cau)));
  },

  async xoa(idNguoi, cau) {
    await viec("readwrite", st => st.delete(khoa(idNguoi, cau)));
    if (ds[idNguoi]) { delete ds[idNguoi][ma(cau)]; luuDs(); }
  },

  /* Xóa cả người: dùng khi gỡ một người trò chuyện khỏi danh sách */
  async xoaNguoi(idNguoi, dsCau) {
    for (const c of dsCau || []) {
      try { await viec("readwrite", st => st.delete(khoa(idNguoi, c))); } catch (e) {}
    }
    delete ds[idNguoi];
    luuDs();
  }
};

global.GiongThat = GiongThat;

})(typeof window !== "undefined" ? window : globalThis);
