// Wagner — file tổng hợp, gộp 2 nhóm sản phẩm đã cào từ wagner-group.com:
//   - Fluid Handling (bơm cấp liệu, thùng áp lực): wagner-products-feeding.js — 37 sản phẩm
//   - Atomizers (súng phun tự động & cầm tay công nghiệp): wagner-products-applying.js — 25 sản phẩm
// Tổng: 62 sản phẩm. Cần nạp cả 3 file theo đúng thứ tự trong HTML:
//   <script src="data/wagner-products-feeding.js"></script>
//   <script src="data/wagner-products-applying.js"></script>
//   <script src="data/wagner-products.js"></script>
var WAGNER_PRODUCTS = []
  .concat(typeof WAGNER_FEEDING_PRODUCTS !== "undefined" ? WAGNER_FEEDING_PRODUCTS : [])
  .concat(typeof WAGNER_APPLYING_PRODUCTS !== "undefined" ? WAGNER_APPLYING_PRODUCTS : []);
