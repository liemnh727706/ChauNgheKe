/* Giữ ứng dụng mở được khi mạng chập chờn.
 *
 * Lưu ý: phần NGHE giọng nói vẫn cần internet — Chrome và Safari gửi âm thanh
 * lên máy chủ hãng để nhận dạng. Đệm này chỉ giúp mở app và giữ giao diện.
 *
 * Quan trọng: trang và mã nguồn phải LẤY TỪ MẠNG TRƯỚC, chỉ khi mất mạng mới
 * dùng bản đã lưu. Nếu làm ngược lại thì mỗi bản sửa lỗi về sau sẽ không bao
 * giờ tới được máy người dùng — họ cứ chạy mãi bản cũ mà không biết.
 */
const BAN = "chaunghe-v2";
const GIU = ["./", "./index.html", "./app.js", "./manifest.webmanifest",
             "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(BAN).then(k => k.addAll(GIU))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(t => Promise.all(t.filter(x => x !== BAN).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

/* Thứ hay đổi (trang, mã nguồn) thì ưu tiên bản mới trên mạng;
   thứ gần như không đổi (ảnh, manifest) thì lấy bản đã lưu cho nhanh. */
function hayDoi(url) {
  return url.pathname.endsWith("/") ||
         url.pathname.endsWith(".html") ||
         url.pathname.endsWith(".js") ||
         url.pathname.endsWith(".webmanifest");
}

function catVao(req, res) {
  if (res && (res.ok || res.type === "opaque")) {
    const ban = res.clone();
    caches.open(BAN).then(k => k.put(req, ban)).catch(() => {});
  }
  return res;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const nha = url.origin === self.location.origin;

  if (nha && (req.mode === "navigate" || hayDoi(url))) {
    e.respondWith(
      fetch(req).then(res => catVao(req, res))
                .catch(() => caches.match(req).then(co => co || caches.match("./index.html")))
    );
    return;
  }

  if (nha) {
    e.respondWith(
      caches.match(req).then(co => {
        const mang = fetch(req).then(res => catVao(req, res)).catch(() => co);
        return co || mang;
      })
    );
    return;
  }

  /* phông chữ, thư viện ngoài */
  e.respondWith(
    fetch(req).then(res => catVao(req, res)).catch(() => caches.match(req))
  );
});
