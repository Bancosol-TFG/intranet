export function localDate(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function defaultExceptionRange() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 30);
  return { from: localDate(today), to: localDate(end) };
}
