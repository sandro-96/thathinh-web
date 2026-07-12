const API_MESSAGES = {
  "4000": "Dữ liệu không hợp lệ",
  "4001": "Chưa đăng nhập",
  "4003": "Bạn không có quyền thực hiện thao tác này",
  "4004": "Không tìm thấy dữ liệu",
  "4005": "Yêu cầu không hợp lệ",

  "4100": "Email đã được sử dụng",
  "4101": "Nickname đã được sử dụng",
  "4102": "Email hoặc mật khẩu không đúng",
  "4103": "Email chưa được xác minh",
  "4104": "Liên kết không hợp lệ hoặc đã hết hạn",
  "4105": "Không tìm thấy tài khoản",
  "4106": "Tài khoản đã bị khoá",
  "4107": "Vui lòng hoàn thiện hồ sơ trước",
  "4110": "Không thể tương tác với người dùng này",
  "4111": "Đã chặn người dùng này",
  "4112": "Chưa chặn người dùng này",
  "4108": "Nickname không hợp lệ (3–20 ký tự, chữ/số/gạch dưới)",
  "4109": "Nickname chứa từ không được phép",

  "4200": "Không tìm thấy phòng trò chuyện",
  "4201": "Bạn chưa tham gia phòng này",
  "4202": "Bạn đã tham gia phòng này rồi",
  "4203": "Phòng trò chuyện không còn hoạt động",

  "4300": "Bạn đang chờ ghép đôi",
  "4301": "Không có phiên thả thính",
  "4302": "Không tìm thấy phiên thả thính",
  "4303": "Phiên thả thính đã kết thúc",
  "4304": "Chưa tìm được đối tác, thử lại sau",

  "4400": "Tin nhắn không được để trống",
  "4401": "Tin nhắn quá dài",
  "4402": "Tin nhắn chứa từ không được phép",

  "4500": "Bạn gửi tin quá nhanh, vui lòng thử lại sau",
  "4501": "Bạn thả thính quá nhiều, thử lại sau một lúc",
  "4600": "Đã là bạn hoặc đang chờ xác nhận",
  "4603": "Chưa kết bạn với người này",
  "4606": "Lịch sử flirt đã được chuyển sang chat riêng",
  "4607": "Không có lịch sử flirt để chuyển",
  "4700": "Không tìm thấy cuộc trò chuyện",

  "5000": "Lỗi hệ thống, vui lòng thử lại sau",
};

const HTTP_MESSAGES = {
  401: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại",
  403: "Bạn không có quyền thực hiện thao tác này",
  404: "Không tìm thấy dữ liệu",
  429: "Thao tác quá nhanh, vui lòng thử lại sau",
  500: "Lỗi máy chủ, vui lòng thử lại sau",
  502: "Máy chủ tạm thời không phản hồi",
  503: "Dịch vụ tạm thời không khả dụng",
};

export function getApiErrorMessage(err, fallback = "Có lỗi xảy ra") {
  if (!err) return fallback;

  if (!err.response) {
    if (err.code === "ECONNABORTED") return "Yêu cầu quá thời gian, thử lại";
    return "Không thể kết nối máy chủ. Kiểm tra mạng và thử lại";
  }

  const data = err.response.data;
  if (data?.code && API_MESSAGES[data.code]) {
    if (data.code === "4000" && data.data && typeof data.data === "object") {
      const fields = Object.entries(data.data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      if (fields) return `Dữ liệu không hợp lệ (${fields})`;
    }
    return API_MESSAGES[data.code];
  }
  if (data?.message) return data.message;

  return HTTP_MESSAGES[err.response.status] || fallback;
}
