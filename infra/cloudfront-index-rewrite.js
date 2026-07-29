// CloudFront Function — event type: viewer request
//
// Origin là S3 REST (OAC), nên CloudFront KHÔNG tự tìm index.html trong thư mục
// con. Nếu thiếu function này, "/chat-lam-quen-online" trả 403 từ S3 và rơi vào
// custom error page (/index.html) — HTML pre-render do build sinh ra sẽ không
// bao giờ được phục vụ, và mọi URL lại chung canonical trỏ về trang chủ.
//
// Route SPA không có file pre-render (vd. /topics) vẫn hoạt động: S3 trả 403,
// CloudFront custom error 403/404 → /index.html (200) như trước.
//
// Runtime: cloudfront-js-2.0. Chỉ dùng cú pháp ES5 để an toàn với cả 1.0.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.charAt(uri.length - 1) === "/") {
    request.uri = uri + "index.html";
    return request;
  }

  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);
  if (lastSegment.indexOf(".") === -1) {
    request.uri = uri + "/index.html";
  }

  return request;
}
