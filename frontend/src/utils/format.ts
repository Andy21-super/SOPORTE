export function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}
