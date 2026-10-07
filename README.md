# Cháu Nghe Kể

Người bạn trò chuyện bằng giọng nói cho người già — đặc biệt là người sa sút trí nhớ.
Ứng dụng nghe cụ kể chuyện ngày xưa, đáp lại bằng tiếng nói, và ghi lại từng buổi
thành file âm thanh để con cháu nghe lại.

Hiện ảnh con cháu thật, xưng hô đúng cách trong nhà, nên với người sa sút trí nhớ
thì đây là một cuộc nói chuyện với người thân, không phải với cái máy.

## Vì sao máy trả lời chạy ngay trong máy, không gọi lên mạng

Đây là chủ ý, không phải hạn chế:

- **Đáp tức thì.** Độ trễ một hai giây phá vỡ cảm giác được lắng nghe. Người già
  dừng kể và hỏi "alô, có nghe không".
- **Chuyện nhà không rời khỏi máy.** Cả đời người được kể ra trong những buổi này.
- **Không bịa.** Một mô hình ngôn ngữ có thể dựng ra chi tiết gia đình không có thật.
  Với người sa sút trí nhớ, điều đó không chỉ sai mà còn gây hại — họ sẽ tin.

Máy hồi đáp làm đúng việc mà liệu pháp hồi tưởng cần: nghe, đệm, nhắc lại, an ủi.
Nó không cần biết gì về gia đình để làm tốt việc đó.

## Hai chế độ

**Trò chuyện qua lại** — cụ nói một câu, app đáp một câu. Hợp khi cụ mệt,
nói ngắt quãng, hoặc sa sút nặng cần được trấn an liên tục.

**Kể chuyện liền mạch** — cụ kể một mạch, app **im lặng nghe**, chỉ lên tiếng
khi cụ dừng hẳn vài giây. Hợp khi cụ còn kể được dài.

Chế độ kể chuyện làm ba việc:

1. **Không cắt ngang.** Dừng dưới ngưỡng (2,6s mức nhẹ · 3,2s vừa · 4s nặng)
   thì tuyệt đối im. Nghỉ lấy hơi giữa câu không bị tính là kể xong.
2. **Hỏi theo đúng chuyện vừa kể**, không phải câu soạn sẵn. Cụ nhắc "bà Tư"
   thì hỏi *"Bà Tư là người thế nào hả má?"*; nhắc "chợ Tầm Vu" thì hỏi
   *"Chợ Tầm Vu có đông người không má?"*. Câu hỏi chứa chính lời cụ nói —
   đó mới là dấu hiệu có người đang thật sự nghe.
3. **Hỏi — nối — hỏi — nối.** Không bao giờ hỏi hai lượt liền; hỏi dồn thành
   hỏi cung. Hết chuyện đáng hỏi thì tự lui về tiếng đệm nối chuyện.

Bộ hiểu ngữ cảnh nhặt ra người, nơi chốn, mốc thời gian, sự việc và đồ vật
từ lời kể, rồi chọn thứ cụ **vừa nhắc mà chưa kể rõ** để hỏi tiếp. Những gì
nhặt được cũng vào nhật ký, nên sau này nhìn là biết hôm đó cụ kể về ai.

Chạy hoàn toàn trong máy. Không gửi chuyện nhà người ta đi đâu, đáp tức thì,
và không bao giờ bịa ra chi tiết gia đình.

## Cách nó đáp lời (chế độ trò chuyện qua lại)

| Tình huống | Cách đáp |
|---|---|
| Cụ kể bình thường | Nhắc lại một cụm cụ vừa nói — tín hiệu lắng nghe mạnh nhất |
| Cụ kể chuyện đói khổ, chiến tranh | Ghi nhận sức chịu đựng: *"Khổ vậy mà má vẫn qua được, giỏi quá má."* |
| Cụ nhớ người đã mất | An ủi và ở lại cùng cụ: *"Dạ… con đang ngồi đây với má nè."* |
| Cụ kể chuyện vui | Vui theo |
| Cụ nói rất ngắn, chỉ "ờ", "ừ" | Khích lệ kể tiếp |
| Cụ hỏi lại | Trấn an rồi trả lượt — **không bao giờ bịa chi tiết** |
| Cụ hỏi "con là ai" | Xưng đúng tên người trong ảnh |
| Cụ im lặng lâu | Gợi một chuyện mới, không hối thúc |
| Cụ nói muốn nghỉ | Chào ấm áp rồi tự kết thúc và lưu buổi nói chuyện |

Hai quy tắc cứng: **không bao giờ cải chính cụ**, và **không hỏi hai lượt liền**
(hỏi dồn thành ra hỏi cung). Mức sa sút càng nặng thì nói càng chậm, càng ít hỏi.

## Cấu trúc

```
src/index.html   giao diện
src/app.js       máy hồi đáp, nghe, nói, ghi âm
tools/build.mjs  dựng www/, sinh biểu tượng, tự kiểm tra
www/             bản chạy được — đưa lên https là dùng ngay
```

```bash
node tools/build.mjs
```

## Bắt buộc phải có https

Nhận dạng giọng nói và micro **chỉ chạy trên `https`**. Mở file trực tiếp từ máy
(`file://`) thì trình duyệt khóa micro và không hiện cửa sổ hỏi quyền — không có
cách lập trình nào vượt qua.

Đưa thư mục `www/` lên GitHub Pages hoặc máy chủ https của mình, rồi:

- **Android:** Chrome → ⋮ → Thêm vào màn hình chính
- **iPhone:** Safari → Chia sẻ → Thêm vào MH chính

Phần **nghe** cũng cần internet: Chrome và Safari gửi âm thanh lên máy chủ hãng để
nhận dạng. Phần **trả lời** thì chạy trong máy nên luôn tức thì.

Không đóng gói được thành APK: Android WebView không có bộ nhận dạng giọng nói.

## Giới hạn

Ứng dụng **không thay được người thật**. Nó lấp quãng trống giữa những lần con cháu
về thăm. Giao tiếp đều đặn giúp làm chậm sa sút và cải thiện tâm trạng, nhưng không
đảo ngược bệnh lý — vẫn cần khám định kỳ, dùng thuốc theo chỉ định, vận động, ngủ đủ.

Về việc dùng ảnh người thân để cụ tin là đang nói chuyện với con cháu: nhiều gia đình
chấp nhận cách này trong chăm sóc sa sút trí nhớ, nhưng nên hỏi ý người trong ảnh trước.
Đó là quyết định của cả nhà.
