/**
 * Tiện ích hiển thị theo giới tính: viền/nền màu để phân biệt nam (xanh) / nữ (hồng) / khác (tím).
 */

export const GENDER_LABELS = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export function genderLabel(gender) {
  return GENDER_LABELS[gender] || "Khác";
}

/** Class viền (ring) cho avatar theo giới tính. */
export function genderRingClass(gender) {
  if (gender === "MALE") return "ring-2 ring-sky-400 dark:ring-sky-500";
  if (gender === "FEMALE") return "ring-2 ring-pink-400 dark:ring-pink-500";
  return "ring-2 ring-violet-300 dark:ring-violet-500";
}

/** Class chip/nhãn giới tính. */
export function genderChipClass(gender) {
  if (gender === "MALE") return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
  if (gender === "FEMALE") return "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300";
  return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
}
