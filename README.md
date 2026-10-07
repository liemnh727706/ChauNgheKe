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

## Cách nó đáp lời

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
