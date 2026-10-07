/* Giữ ứng dụng mở được khi mạng chập chờn.
   Lưu ý: phần NGHE giọng nói vẫn cần internet — Chrome và Safari gửi
   âm thanh lên máy chủ hãng để nhận dạng. Đệm này chỉ giúp mở app
   và giữ giao diện, không làm app nghe được khi mất mạng. */
const BAN = "chaunghe-v1";
const GIU = ["./", "./index.html", "./app.js", "./manifest.webmanifest",
             "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(BAN).then(k => k.addAll(GIU)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(t => Promise.all(t.filter(x => x !== BAN).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const nha = new URL(r.url).origin === self.location.origin;
  if (nha) {
    e.respondWith(caches.match(r).then(co => {
      const mang = fetch(r).then(res => {
        if (res && res.ok) { const b = res.clone(); caches.open(BAN).then(k => k.put(r, b)); }
        return res;
      }).catch(() => co);
      return co || mang;
    }));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    if (res && (res.ok || res.type === "opaque")) { const b = res.clone(); caches.open(BAN).then(k => k.put(r, b)); }
    return res;
  }).catch(() => caches.match(r)));
});
