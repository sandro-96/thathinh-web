const ALLOWED = /^[a-zA-Z0-9_\u00C0-\u1EF9]{3,20}$/;
const ALL_DIGITS = /^\d+$/;

const RESERVED = new Set([
  "admin", "administrator", "mod", "moderator", "system", "support",
  "thathinh", "root", "null", "undefined", "helpdesk", "official",
]);

const BANNED_SUBSTRINGS = [
  "admin", "dit", "du", "lon", "cac", "buoi", "dmm", "clgt", "vl",
  "fuck", "shit", "bitch", "sex", "porn", "nude", "scam", "luadao",
];

export function normalizeNickname(input) {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** @returns {string|null} lỗi hoặc null nếu hợp lệ */
export function validateNickname(nickname) {
  const trimmed = nickname?.trim() ?? "";
  if (!trimmed) return "Vui lòng nhập nickname";
  if (trimmed.length < 3 || trimmed.length > 20) {
    return "Nickname phải từ 3–20 ký tự";
  }
  if (!ALLOWED.test(trimmed)) {
    return "Chỉ dùng chữ, số và gạch dưới (_)";
  }
  if (ALL_DIGITS.test(trimmed)) {
    return "Nickname không được chỉ có số";
  }
  const normalized = normalizeNickname(trimmed);
  if (RESERVED.has(normalized)) {
    return "Nickname này không được sử dụng";
  }
  for (const banned of BANNED_SUBSTRINGS) {
    if (normalized.includes(banned)) {
      return "Nickname chứa từ không được phép";
    }
  }
  return null;
}
