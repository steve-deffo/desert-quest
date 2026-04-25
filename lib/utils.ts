export function toArabicNumerals(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) =>
    String.fromCharCode(0x0660 + parseInt(d))
  );
}

export function starsFromScore(correct: number, total: number): number {
  if (correct <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
