export function parseTimestamp(timestamp: string) {
  return new Date(timestamp);
}

export function formatTimestamp(date: Date) {
  return date.toISOString();
}
