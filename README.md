# Nhất Quán — Website mới

Trang chủ dạng ecommerce (Node.js phục vụ tĩnh + HTML5/CSS3/JS thuần) cho Công ty CP Công nghiệp
Nhất Quán, cộng với toàn bộ catalog 1000+ sản phẩm (nằm ở `/catalog`).

## Cấu trúc

```
site/
  index.html          # Trang chủ: Hero, Bộ sưu tập, Về chúng tôi, Sản phẩm nổi bật,
                       # Khách hàng tin dùng, Liên hệ, Footer
  css/styles.css       # Toàn bộ style, không phụ thuộc font/thư viện ngoài
  js/main.js            # Render dữ liệu động + validate form liên hệ (client-side)
  data/                # products.json / brands.json / featured.json / customers.json
  img/                 # Ảnh thật (hero, about, logo khách hàng)
  scripts/
    build-data.js       # Đọc lại web/data/*.js gốc (nguồn dữ liệu thật), xuất JSON
    pick-featured.js     # Chọn sản phẩm nổi bật thật (không tự bịa) cho trang chủ
  catalog/              # Toàn bộ catalog cũ (catalog.html) — trang xem/lọc chi tiết
                         # 1000+ sản phẩm, giữ nguyên chức năng lọc hãng/ngành/tìm kiếm.
                         # Nhận query param ?brand=<id> để mở thẳng đúng hãng.
  server.js             # Static file server, không cần cài npm package nào
```

## Chạy thử local

```bash
npm run dev
# mở http://localhost:8080
```

## Cập nhật dữ liệu sản phẩm

Dữ liệu sản phẩm/hãng lấy trực tiếp từ `web/data/*.js` (nguồn thật đã cào từ các
website chính hãng qua nhiều đợt trong dự án này) — script `build-data.js` chạy
các file đó y hệt cách `catalog.html` load, rồi xuất ra JSON gọn cho trang chủ dùng.

Sau khi thêm/sửa sản phẩm trong `web/data/`, hoặc trong `site/catalog/data/`
(bản sao đang phục vụ trực tiếp), chạy lại:

```bash
npm run build:data
```

rồi commit các file JSON mới trong `site/data/`.

**⚠️ CHỈ chạy `build:data` khi ở LOCAL trong thư mục dự án gốc** (nơi có thư mục
`web/` nằm cạnh `site/`). Script này đọc `../web/catalog.html` và `../web/data/*.js`
— hai thứ đó **không nằm trong repo Git** (chỉ tồn tại trên máy dev gốc), nên nếu
Hostinger (hoặc bất kỳ máy chủ deploy nào) chạy lệnh này sẽ báo lỗi
`ENOENT: no such file or directory ... web/catalog.html` và **build sẽ thất bại**.
Trên Hostinger, **không đặt Build command là `npm run build:data`** — để trống,
hoặc dùng `npm run build` (script no-op an toàn, không làm gì cả vì site đã build
sẵn, mọi file cần thiết đã có trong `site/data/*.json` và `site/catalog/`).

**Lưu ý quan trọng:** `site/catalog/` hiện là **bản sao độc lập** của `web/`. Nếu bạn
sửa dữ liệu sản phẩm, cần đồng bộ cả hai nơi (hoặc chuyển hẳn sang chỉ dùng một
nguồn — xem mục "Việc cần làm tiếp" bên dưới).

## Form liên hệ

Form liên hệ hiện chỉ **validate phía client**, CHƯA gửi được email/lưu dữ liệu thật.
Cần chọn 1 trong các cách sau trước khi dùng thật:
- Dịch vụ nhận form không cần backend (Formspree, Getform, Web3Forms...) — nhanh nhất.
- Serverless function (Vercel/Netlify function, hoặc PHP mail() nếu host có PHP).
- Backend Node/Express riêng + SMTP.

## Deploy

### Đẩy lên GitHub
```bash
git init
git add .
git commit -m "Init Nhat Quan website"
git branch -M main
git remote add origin <URL_repo_GitHub_của_bạn>
git push -u origin main
```

### Deploy lên Hostinger
- **Hosting tĩnh (phổ biến nhất, khuyến nghị):** vì đây là site HTML/CSS/JS tĩnh
  (Node.js chỉ dùng để serve local lúc dev + build dữ liệu), chỉ cần upload toàn bộ
  nội dung thư mục `site/` (trừ `node_modules`, `scripts/`, `server.js`,
  `package.json`) lên thư mục `public_html` qua File Manager hoặc FTP trên hPanel.
- **Hosting Node.js (nếu gói Hostinger hỗ trợ):** trỏ entry point vào `server.js`,
  set biến môi trường `PORT` theo Hostinger cấp, chạy `npm install` (không có
  dependency ngoài nên bước này gần như tức thời) rồi start bằng `npm start`.
- **Nếu hPanel/Git deploy yêu cầu nhập "Build command":** để trống, hoặc điền
  `npm run build`. **KHÔNG điền `npm run build:data`** — script đó phụ thuộc thư
  mục `web/` chỉ có trên máy dev gốc, không có trong repo, sẽ làm bước build
  thất bại với lỗi `ENOENT ... web/catalog.html`.

## Việc cần làm tiếp (chưa làm trong lượt này)

- [ ] Kết nối form liên hệ với dịch vụ gửi email thật.
- [ ] Quyết định: giữ `site/catalog/` là bản sao riêng, hay hợp nhất với `web/`
      gốc để không phải sửa dữ liệu 2 nơi.
- [ ] Thêm ảnh hero/about khác nếu muốn (hiện đang dùng ảnh thật từ khách hàng
      Triệu Phú Lộc).
