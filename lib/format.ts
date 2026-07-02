export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

export function statusLabel(status: string) {
  if (status === "OPEN") {
    return "Đang mở";
  }
  if (status === "CLOSED") {
    return "Đã đóng";
  }
  return "Nháp";
}
