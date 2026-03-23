export function toIsoTimestamp(value: string | Date | null): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}
